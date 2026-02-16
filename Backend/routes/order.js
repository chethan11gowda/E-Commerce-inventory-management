const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/inventoryModel');
const Stripe = require('stripe');
const { sendEmail } = require('../utils/sendEmail'); // adjust path

let auth;
try { auth = require('../middleware/auth'); } catch { auth = null; }

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_replace_with_yours');
const router = express.Router();

function pickIdentity(req) {
  const userId = req.user?.id || req.body.userId || null;
  const customerEmail = req.body.email || req.body.customerEmail || null;
  return { userId, customerEmail };
}

// helper: safe extract productId from item
function extractProductId(item) {
  return item.productId || item._id || item.product?._id || null;
}

// helper: ensure items have numeric quantity & price
function normalizeItems(items) {
  return items.map(it => ({
    productId: extractProductId(it),
    name: it.name,
    price: Number(it.price) || 0,
    quantity: Number(it.quantity) || 1,
    image: it.image || '',
  }));
}

// helper: generate order summary table for email
function buildOrderTable(items, total) {
  const rows = items
    .map(
      it => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd">${it.name}</td>
          <td style="padding:8px;border:1px solid #ddd">${it.quantity}</td>
          <td style="padding:8px;border:1px solid #ddd">₹${it.price}</td>
          <td style="padding:8px;border:1px solid #ddd">₹${it.price * it.quantity}</td>
        </tr>
      `
    )
    .join('');

  return `
    <table style="border-collapse:collapse;width:100%;margin-top:10px">
      <thead>
        <tr>
          <th style="padding:8px;border:1px solid #ddd">Product</th>
          <th style="padding:8px;border:1px solid #ddd">Qty</th>
          <th style="padding:8px;border:1px solid #ddd">Price</th>
          <th style="padding:8px;border:1px solid #ddd">Subtotal</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding:8px;border:1px solid #ddd;text-align:right"><b>Total</b></td>
          <td style="padding:8px;border:1px solid #ddd"><b>₹${total}</b></td>
        </tr>
      </tfoot>
    </table>
  `;
}

// ================== ROUTES ==================

// fetch all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Fetch orders error', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// my orders
router.get('/my', auth ? auth : (_r, res) => res.status(401).json({ error: 'Auth required' }), async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Fetch my orders error', err);
    res.status(500).json({ error: 'Failed to fetch your orders' });
  }
});

// get by email
router.get('/user', async (req, res) => {
  try {
    const email = (req.query.email || '').trim();
    if (!email) return res.status(400).json({ error: 'email is required' });
    const orders = await Order.find({ customerEmail: email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Fetch orders by email error', err);
    res.status(500).json({ error: 'Failed to fetch orders for user' });
  }
});

// COD order
router.post('/cod', async (req, res) => {
  try {
    const { items, total } = req.body;
    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: 'Items are required' });
    }
    const { userId, customerEmail } = pickIdentity(req);

    const normalized = normalizeItems(items);

    // Check stock
    for (let it of normalized) {
      const product = await Product.findById(it.productId).select('quantity name');
      if (!product) return res.status(400).json({ error: `Product not found: ${it.name}` });
      if (product.quantity < it.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }
    }

    // Decrement stock
    for (let it of normalized) {
      await Product.findByIdAndUpdate(it.productId, { $inc: { quantity: -it.quantity } });
    }

    // Save order
    const orderTotal = total || normalized.reduce((s, x) => s + x.price * x.quantity, 0);
    const order = await Order.create({
      items: normalized,
      total: orderTotal,
      paymentMode: 'COD',
      status: 'Pending',
      ...(userId ? { user: userId } : {}),
      ...(customerEmail ? { customerEmail } : {}),
    });

    // Send email
    if (customerEmail) {
      await sendEmail({
        to: customerEmail,
        subject: "Order Confirmation - COD",
        html: `
          <h2>Thank you for your order!</h2>
          <p>Your COD order has been placed successfully.</p>
          <p><b>Order ID:</b> ${order._id}</p>
          ${buildOrderTable(normalized, orderTotal)}
          <p>We’ll notify you once your order is shipped.</p>
        `,
      });
    }

    return res.status(201).json({ success: true, order });
  } catch (err) {
    console.error('COD order error:', err);
    return res.status(500).json({ error: 'Server error while placing COD order' });
  }
});

// Stripe checkout
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { items, email, userId } = req.body;
    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: 'Items are required' });
    }

    const normalized = normalizeItems(items);

    // Validate stock
    for (let it of normalized) {
      const product = await Product.findById(it.productId).select('quantity name');
      if (!product) return res.status(400).json({ error: `Product not found: ${it.name}` });
      if (product.quantity < it.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }
    }

    const total = normalized.reduce((sum, it) => sum + it.price * it.quantity, 0);

    // Save pending order
    const newOrder = await Order.create({
      items: normalized,
      total,
      paymentMode: 'Stripe',
      status: 'Pending',
      ...(userId ? { user: userId } : {}),
      ...(email ? { customerEmail: email } : {}),
    });

    // Create Stripe session
    const stripeItems = normalized.map(it => ({
      price_data: {
        currency: 'inr',
        product_data: { name: it.name },
        unit_amount: Math.round(it.price * 100),
      },
      quantity: it.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: stripeItems,
      mode: 'payment',
      locale: 'en',
      success_url: 'http://localhost:5173/my-orders',
      cancel_url: 'http://localhost:5173/cart',
      ...(email ? { customer_email: email } : {}),
      metadata: { orderId: newOrder._id.toString() },
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error('create-checkout-session error:', err);
    res.status(500).json({ error: 'Stripe session creation failed' });
  }
});

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      console.warn('Webhook: session missing orderId');
      return res.json({ received: true });
    }

    try {
      const order = await Order.findById(orderId);
      if (!order) {
        console.error('Webhook: order not found', orderId);
        return res.status(404).send('Order not found');
      }

      if (order.status === 'Completed') {
        console.log('Webhook: order already Completed', orderId);
        return res.json({ received: true });
      }

      // Decrement stock
      for (let it of order.items) {
        const pid = it.productId || it._id || null;
        if (pid) {
          await Product.findByIdAndUpdate(pid, { $inc: { quantity: -it.quantity } });
        }
      }

      order.status = 'Completed';
      await order.save();

      // Send email
      if (order.customerEmail) {
        await sendEmail({
          to: order.customerEmail,
          subject: "Order Confirmation - Stripe Payment",
          html: `
            <h2>Payment Successful 🎉</h2>
            <p>Your Stripe payment was successful and your order is confirmed.</p>
            <p><b>Order ID:</b> ${order._id}</p>
            ${buildOrderTable(order.items, order.total)}
            <p>We’ll notify you once your order is shipped.</p>
          `,
        });
      }

      console.log(`Webhook: Order ${orderId} completed, stock decremented, email sent`);
    } catch (err) {
      console.error('Webhook processing error:', err);
    }
  }

  res.json({ received: true });
});

// update order status
router.put('/:id', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });
    res.json(updatedOrder);
  } catch (err) {
    console.error('Update order error', err);
    res.status(500).json({ message: err.message });
  }
});

// cancel order
router.put('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.status = 'Cancelled';
    await order.save();
    res.json(order);
  } catch (err) {
    console.error('Cancel order error', err);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

module.exports = router;
