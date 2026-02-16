import './ViewOrders.css';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ViewOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch orders');
    }
  };

  // ✅ Function to update order status
const handleStatusChange = async (orderId, newStatus) => {
  try {
    await axios.put(`http://localhost:5000/api/orders/${orderId}`, {
      status: newStatus,
    });

    // Update state locally without refetching
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === orderId ? { ...order, status: newStatus } : order
      )
    );

    // ✅ Show success prompt
    alert(`✅ Order ${orderId} status updated to "${newStatus}"`);
  } catch (err) {
    console.error(err);
    alert('❌ Failed to update order status');
  }
};

  return (
    <div className="view-orders-container">
      <h2>View Orders</h2>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Total</th>
            <th>Status</th>
            <th>Payment Mode</th>
            <th>Items</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>₹{order.total}</td>
              <td>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>
              <td>
                {order.paymentMode === 'Stripe'
                  ? 'Paid via Stripe'
                  : 'Cash on Delivery'}
              </td>
              <td>
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <strong>{item.name}</strong> - ₹{item.price} x {item.quantity}
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewOrders;
