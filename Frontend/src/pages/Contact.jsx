// src/pages/Contact.jsx
import './Contact.css';
import { useState, useEffect } from 'react';

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "", orderId: "", productName: "" });
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.email) return;
      try {
        const res = await fetch(`http://localhost:5000/api/orders/user?email=${encodeURIComponent(user.email)}`);
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading orders:", err);
      } finally {
        setLoadingOrders(false);
      }
    };
    loadOrders();
  }, [user?.email]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOrderChange = (e) => {
    const [orderId, productName] = e.target.value.split("::");
    setForm({ ...form, orderId, productName });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:5000/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    alert("Message sent successfully!");
    setForm({ name: "", email: "", message: "", orderId: "", productName: "" });
  };

  return (
    <div className="contact-container">
      <div className="contact-box">
        <h2>Contact Us</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows="4"
            ></textarea>
          </div>

          {/* ✅ Order / Product Dropdown */}
          {/* ✅ Order / Product Dropdown */}
<div className="form-group">
  <label>Related Order/Product</label>
  {loadingOrders ? (
    <p className="no-orders">Loading your orders...</p>
  ) : !orders.length ? (
    <p className="no-orders">No orders found.</p>
  ) : (
    <select onChange={handleOrderChange} value={`${form.orderId}::${form.productName}`}>
      <option value="">-- Select Order/Product --</option>
      {orders.map((o) =>
        o.items?.map((it, idx) => (
          <option key={idx} value={`${o._id}::${it.name}`}>
            🛒 Order #{o._id.slice(-6).toUpperCase()} — {it.name}
          </option>
        ))
      )}
    </select>
  )}
</div>


          <button type="submit" className="submit-btn">Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
