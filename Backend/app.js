require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Stripe = require('stripe');

const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRouter = require('./routes/order');
const adminRouter = require('./routes/admin');
const messageRoutes = require("./routes/messageRoutes");
const Order = require("./models/Order");

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Stripe Webhook (must come BEFORE express.json)
app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId; //  metadata from checkout session

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { status: "Completed" });
      console.log("✅ Order", orderId, "marked as Completed");
    }
  }

  res.json({ received: true });
});

// ---- Middlewares ----
app.use(express.json()); // normal JSON for the rest of API
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Static folder for images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRouter);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', adminRouter);
app.use("/api/messages", messageRoutes);
app.use('/api/cart', require('./routes/cart'));


// ---- MongoDB ----
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://nayaksneha92:JqB9K72J7KI2WGLC@cluster0.67miway.mongodb.net/', {})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ---- Start Server ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
