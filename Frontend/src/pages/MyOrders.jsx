// src/pages/MyOrders.jsx
import './MyOrders.css';
import React, { useEffect, useState } from 'react';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [cancelling, setCancelling] = useState(null); // track which order is being cancelled

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr('');
      try {
        if (!user?.email) {
          setErr('Please sign in to view your orders.');
          setLoading(false);
          return;
        }
        const res = await fetch(
          `http://localhost:5000/api/orders/user?email=${encodeURIComponent(
            user.email
          )}`
        );
        if (!res.ok) throw new Error('Failed to load orders');
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.email]);

  // 🔥 Cancel order logic
  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      setCancelling(id);
      const res = await fetch(`http://localhost:5000/api/orders/${id}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to cancel order');
      const updated = await res.json();

      // update the local state
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: updated.status } : o))
      );
    } catch (e) {
      alert(e.message || 'Cancel failed');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return <div className="orders-loading">Loading your orders…</div>;
  if (err) return <div className="orders-error">{err}</div>;

  return (
    <div className="orders-container">
      <h2 className="orders-title">My Orders</h2>

      {!orders.length ? (
        <p className="orders-empty">No orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((o) => (
            <div key={o._id} className="order-card">
              <div className="order-header">
                <p className="order-id">
                  Order #{o._id.slice(-6).toUpperCase()}
                </p>
                <span className={`order-status ${o.status.toLowerCase()}`}>
                  {o.status}
                </span>
              </div>

              <p className="order-meta">
                Placed on {new Date(o.createdAt).toLocaleString()} •{' '}
                {o.paymentMode}
              </p>

              <ul className="order-items">
                {o.items?.map((it, idx) => (
                  <li key={idx}>
                    {it.name} × {it.quantity} — ₹{Number(it.price).toFixed(2)}
                  </li>
                ))}
              </ul>

              <div className="order-total">
                Total: ₹{Number(o.total).toFixed(2)}
              </div>

              {/* 🔥 Cancel button only if not already cancelled */}
              {o.status.toLowerCase() !== 'cancelled' && (
                <button
                  className="cancel-btn"
                  onClick={() => handleCancel(o._id)}
                  disabled={cancelling === o._id}
                >
                  {cancelling === o._id ? 'Cancelling…' : 'Cancel Order'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
