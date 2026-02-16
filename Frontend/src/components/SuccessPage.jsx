import React, {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SuccessPage = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const orderId = new URLSearchParams(window.location.search).get('orderId');
        console.log('Extracted Order ID:', orderId);

        if (!orderId) throw new Error('Order ID not found');

        // ✅ Fixed endpoints
        const response = await axios.get(`http://localhost:5000/api/orders/order/${orderId}`);

        await axios.patch(`http://localhost:5000/api/orders/update-status/${orderId}`, { status: 'Completed' });

        setOrder(response.data);
        setLoading(false);

        // ✅ Redirect to "My Orders" after 2s
        setTimeout(() => {
          navigate('/my-orders');
        }, 2000);

      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error fetching order details: {error}</div>;

  return (
    <div>
      <h2>Order Confirmation</h2>
      <h3>Thank you for your order!</h3>
      <p>Your order has been successfully placed.</p>
      <p>Order ID: {order._id}</p>
      <p>Payment Status: {order.paymentMode === 'COD' ? 'Cash on Delivery' : 'Paid via Stripe'}</p>

      <h4>Order Details</h4>
      <ul>
        {order.items.map((item, index) => (
          <li key={index}>
            <strong>{item.name}</strong> - {item.quantity} x ₹{item.price}
          </li>
        ))}
      </ul>

      <h4>Total: ₹{order.total}</h4>
      <p>Redirecting to My Orders...</p>
    </div>
  );
};

export default SuccessPage;
