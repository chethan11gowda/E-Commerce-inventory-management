import './AdminMessages.css';
import { useEffect, useState } from 'react';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/messages")
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error("Fetch error:", err));
  }, []);

  return (
    <div className="admin-container">
      <h2 className="admin-title">📩 Messages</h2>

      {messages.length === 0 ? (
        <p className="no-data">No messages found</p>
      ) : (
        <div className="table-wrapper">
          <table className="messages-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Product</th> {/* ✅ New */}
                <th>Message</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m._id}>
                  <td>{m.name}</td>
                  <td>{m.email}</td>
                  <td>{m.productName}</td> {/* ✅ Show product */}
                  <td>{m.message}</td>
                  <td>{new Date(m.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
