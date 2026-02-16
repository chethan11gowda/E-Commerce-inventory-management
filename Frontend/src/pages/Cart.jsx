import './Cart.css';
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [quantities, setQuantities] = useState({});

  // User & token from localStorage
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }, []);
  const email = user?.email || null;
  const token = localStorage.getItem('userToken') || null;

  // Fetch cart from backend on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/cart', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const fetchedItems = res.data.items || [];
        setCart(fetchedItems);

        // Set initial quantities
        const qtyObj = {};
        fetchedItems.forEach((item, idx) => {
          qtyObj[idx] = item.quantity || 1;
        });
        setQuantities(qtyObj);
      } catch (err) {
        console.error('Failed to fetch cart:', err.response?.data || err.message);
      }
    };

    fetchCart();
  }, [token]);

  // Update quantities if cart changes
  useEffect(() => {
    if (cart.length === 0) return;
    const qtyObj = {};
    cart.forEach((item, idx) => {
      qtyObj[idx] = quantities[idx] || item.quantity || 1;
    });
    setQuantities(qtyObj);
  }, [cart]);

  const handleQuantityChange = (index, delta) => {
    setQuantities(prev => {
      const newQty = Math.max(1, (prev[index] || 1) + delta);
      return { ...prev, [index]: newQty };
    });
  };

  // Prepare items with updated quantities
  const prepareItems = () =>
    cart.map((item, index) => ({
      productId: item.productId || item._id || item.product?._id || null,
      name: item.name,
      price: Number(item.price) || 0,
      quantity: Number(quantities[index]) || Number(item.quantity) || 1,
      image: item.image || '',
    }));

  const calculateTotal = () =>
    cart.reduce((sum, item, idx) => {
      const qty = Number(quantities[idx]) || 1;
      return sum + (Number(item.price) || 0) * qty;
    }, 0);

  // Save cart to backend whenever quantities change
  useEffect(() => {
    const saveCart = async () => {
      try {
        const updatedItems = prepareItems();
        await axios.post(
          'http://localhost:5000/api/cart',
          { items: updatedItems },
          { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
        );
      } catch (err) {
        console.error('Failed to save cart:', err.response?.data || err.message);
      }
    };

    if (cart.length > 0) saveCart();
  }, [quantities]);

  // COD for full cart
  const handleCOD = async () => {
    try {
      if (cart.length === 0) return alert('Your cart is empty.');
      const payload = { items: prepareItems(), total: calculateTotal(), email };

      const res = await axios.post('http://localhost:5000/api/orders/cod', payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      alert(res.data?.message || 'Order placed successfully via COD!');
      window.location.href = '/my-orders';
    } catch (err) {
      console.error('COD order failed:', err.response?.data || err.message);
      alert(`Failed to place COD order: ${err.response?.data?.error || err.message}`);
    }
  };

  // Stripe checkout for full cart
  const handleStripeCheckout = async () => {
    try {
      if (cart.length === 0) return alert('Your cart is empty.');

      const stripe = await loadStripe('pk_test_51Ru5gBDnLRpcLAj6WDKTjaaiEbQBZHOhEBV7mLoYqqdmV6TrCJ2fS4Lp3oRlk6u3kYWf1euuz9iJrJ3QN3GvqDLr00Ces4LViH');

      const res = await axios.post(
        'http://localhost:5000/api/orders/create-checkout-session',
        { items: prepareItems(), email, total: calculateTotal() },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );

      const result = await stripe.redirectToCheckout({ sessionId: res.data.id });
      if (result.error) {
        console.error('Stripe redirect error:', result.error);
        alert(result.error.message || 'Stripe redirect failed');
      }
    } catch (err) {
      console.error('Checkout failed:', err.response?.data || err.message);
      alert(`Stripe checkout failed: ${err.response?.data?.error || err.message}`);
    }
  };

  // COD for individual item
  const handleCODItem = async (item) => {
    try {
      const payload = { 
        items: [item], 
        total: (Number(item.price) || 0) * (item.quantity || 1), 
        email 
      };

      const res = await axios.post('http://localhost:5000/api/orders/cod', payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      alert(res.data?.message || `Order placed successfully for ${item.name} via COD!`);
      window.location.href = '/my-orders';
    } catch (err) {
      console.error('COD item order failed:', err.response?.data || err.message);
      alert(`Failed to place COD order: ${err.response?.data?.error || err.message}`);
    }
  };

  // Stripe checkout for individual item
  const handleStripeCheckoutItem = async (item) => {
    try {
      const stripe = await loadStripe('pk_test_51Ru5gBDnLRpcLAj6WDKTjaaiEbQBZHOhEBV7mLoYqqdmV6TrCJ2fS4Lp3oRlk6u3kYWf1euuz9iJrJ3QN3GvqDLr00Ces4LViH');

      const res = await axios.post(
        'http://localhost:5000/api/orders/create-checkout-session',
        { items: [item], email, total: (Number(item.price) || 0) * (item.quantity || 1) },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );

      const result = await stripe.redirectToCheckout({ sessionId: res.data.id });
      if (result.error) {
        console.error('Stripe redirect error:', result.error);
        alert(result.error.message || 'Stripe redirect failed');
      }
    } catch (err) {
      console.error('Checkout failed:', err.response?.data || err.message);
      alert(`Stripe checkout failed: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="cart-container">
      <h2 className="cart-title">🛒 Your Cart</h2>

      {cart.length === 0 ? (
        <p className="empty-cart">Your cart is empty.</p>
      ) : (
        <>
          <ul className="cart-list">
            {cart.map((item, index) => {
              const qty = Number(quantities[index]) || 1;
              const price = Number(item.price) || 0;
              return (
                <li key={index} className="cart-item">
                  {item.image && (
                    <img
                      src={
                        item.image.startsWith?.('http')
                          ? item.image
                          : `http://localhost:5000/uploads/${item.image}`
                      }
                      alt={item.name}
                      className="cart-image"
                    />
                  )}
                  <div className="cart-details">
                    <strong className="cart-name">{item.name}</strong>
                    <p className="cart-price">
                      ₹{price} × {qty}
                    </p>
                    <div className="cart-qty">
                      <button className="qty-btn" onClick={() => handleQuantityChange(index, -1)}>
                        −
                      </button>
                      <span className="qty-value">{qty}</span>
                      <button className="qty-btn" onClick={() => handleQuantityChange(index, +1)}>
                        +
                      </button>
                    </div>
                    <p className="cart-subtotal">Subtotal: ₹{price * qty}</p>

                    {/* ✅ Individual Item Checkout */}
                    <div className="item-checkout-buttons">
                      <button 
                        className="checkout-btn cod" 
                        onClick={() => handleCODItem({ ...item, quantity: qty })}
                      >
                        Pay COD for this item
                      </button>
                      <button 
                        className="checkout-btn stripe" 
                        onClick={() => handleStripeCheckoutItem({ ...item, quantity: qty })}
                      >
                        Pay with Card (Stripe)
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* ✅ Full cart checkout */}
          <h3 className="cart-total">Total: ₹{calculateTotal()}</h3>
          <div className="checkout-buttons">
            <button className="checkout-btn cod" onClick={handleCOD}>
              Pay on Delivery (Full Cart)
            </button>
            <button className="checkout-btn stripe" onClick={handleStripeCheckout}>
              Pay with Card (Stripe) (Full Cart)
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
