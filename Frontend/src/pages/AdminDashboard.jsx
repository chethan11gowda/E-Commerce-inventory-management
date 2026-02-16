import './AdminDashboard.css';
import React, { useEffect, useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';

import AddProduct from '../components/AddProduct';
import ProductList from '../components/ProductList';
import AdminMessages from './AdminMessages';
import ViewOrders from './ViewOrders';
import UpdateProduct from '../components/UpdateProduct';
import AnalysisBoard from '../components/AnalysisBoard'; // ✅ Import Analysis

// ------------------ Welcome Section ------------------
function AdminWelcome({ stats, lowStockItems, showLowStock, setShowLowStock }) {
  const navigate = useNavigate();

  return (
    <div className="admin-welcome">
      <h2>Welcome</h2>
      <p>Here’s an overview of your inventory system:</p>

      <div className="stats-cards">
        {/* Total Products */}
        <div
          className="stat-card"
          onClick={() => navigate("/admin/dashboard/view-products")}
          style={{ cursor: "pointer" }}
        >
          <h3>{stats.products}</h3>
          <p>Total Products</p>
        </div>

        {/* Total Orders */}
        <div
          className="stat-card"
          onClick={() => navigate("/admin/dashboard/view-orders")}
          style={{ cursor: "pointer" }}
        >
          <h3>{stats.orders}</h3>
          <p>Total Orders</p>
        </div>

        {/* ✅ Fixed Total Messages */}
        <div
          className="stat-card"
          onClick={() => navigate("/admin/dashboard/view-messages")}
          style={{ cursor: "pointer" }}
        >
          <h3>{stats.messages || 0}</h3>
          <p>Total Messages</p>
        </div>

        {/* Low Stock */}
        <div
          className={`stat-card ${stats.lowStock > 0 ? "alert" : ""}`}
          style={{ cursor: "pointer" }}
          onClick={() => setShowLowStock(!showLowStock)}
        >
          <h3>{stats.lowStock}</h3>
          <p>Low Stock Items</p>
          {stats.lowStock > 0 && (
            <span className="low-stock-alert">⚠ Restock Needed!</span>
          )}
        </div>
      </div>

      {/* Inline Low Stock Table */}
      {showLowStock && (
        <div className="low-stock-list">
          <h3>🚨 Low Stock Products</h3>
          {lowStockItems.length > 0 ? (
            <table className="product-list-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((p) => (
                  <tr key={p._id}>
                    <td>
                      {p.image ? (
                        <img
                          src={`http://localhost:5000/uploads/${p.image}`}
                          alt={p.name}
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        "No Image"
                      )}
                    </td>
                    <td>{p.name}</td>
                    <td className="low-qty">{p.quantity}</td>
                    <td>₹{p.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>✅ No products are in low stock.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ------------------ Main Admin Dashboard ------------------
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    messages: 0,  // ✅ messages is always a number
    lowStock: 0,
  });

  const [newOrders, setNewOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [showLowStock, setShowLowStock] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // ✅ Stats
        const res = await fetch("http://localhost:5000/api/admin/stats");
        const data = await res.json();

        // ✅ Inventory (with products array)
        const lowStockRes = await fetch("http://localhost:5000/api/inventory");
        const inventory = await lowStockRes.json();
        const items = Array.isArray(inventory)
          ? inventory
          : inventory.products || [];
        const lowStockItems = items.filter((p) => p.quantity <= 2);

        // ✅ Orders
        const ordersRes = await fetch("http://localhost:5000/api/orders");
        const allOrders = await ordersRes.json();
        const latestOrders = allOrders.slice(-2).reverse();

        setStats({
          products: data.products || 0,
          orders: data.orders || 0,
          messages: data.messages || 0, // ✅ ensure number
          lowStock: lowStockItems.length,
        });

        setLowStockItems(lowStockItems);
        setNewOrders(latestOrders);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    navigate("/adminLogin", { replace: true });
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <nav>
          <ul>
            <li>
              <Link to="/admin/dashboard/">Dashboard</Link>
            </li>
            <li>
              <Link to="/admin/dashboard/add-product">➕ Add Product</Link>
            </li>
            <li>
              <Link to="/admin/dashboard/view-products">
                🛒 View Products
                {stats.lowStock > 0 && (
                  <span className="sidebar-alert">{stats.lowStock}</span>
                )}
              </Link>
            </li>
            <li>
              <Link to="/admin/dashboard/view-orders">📦 View Orders</Link>
            </li>
            <li>
              <Link to="/admin/dashboard/view-messages">💬 View Messages</Link>
            </li>
            <li>
              <Link to="/admin/dashboard/analysis">📊 Analysis</Link>
            </li>
          </ul>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </aside>

      {/* Content */}
      <main className="admin-content">
        {/* 🔔 Topbar with Bell */}
        <div className="admin-topbar">
          <div
            className="notification-bell"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔
            {newOrders.length > 0 && (
              <span className="notif-count">{newOrders.length}</span>
            )}
          </div>

          {/* Dropdown */}
          {showNotifications && (
            <div className="notif-dropdown">
              <h4>New Orders</h4>
              {newOrders.length > 0 ? (
                newOrders.map((order, idx) => (
                  <div key={idx} className="notif-card">
                    <p>
                      <strong>Payment Mode:</strong> {order.paymentMode}
                    </p>
                    <div>
                      <strong>Products:</strong>
                      <ul>
                        {order.items.map((item, i) => (
                          <li key={i}>
                            {item.product?.name || "Unknown"} (x{item.quantity}) - ₹
                            {item.product?.price || 0}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p>
                      <strong>Total:</strong> ₹{order.total}
                    </p>
                  </div>
                ))
              ) : (
                <p>No new orders</p>
              )}
            </div>
          )}
        </div>

        <Routes>
          <Route
            index
            element={
              <AdminWelcome
                stats={stats}
                lowStockItems={lowStockItems}
                showLowStock={showLowStock}
                setShowLowStock={setShowLowStock}
              />
            }
          />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="view-products" element={<ProductList isAdmin={true} />} />
          <Route path="view-orders" element={<ViewOrders />} />
          <Route path="view-messages" element={<AdminMessages />} />
          <Route path="update/:id" element={<UpdateProduct />} />
          <Route path="analysis" element={<AnalysisBoard />} /> {/* ✅ Analysis */}
        </Routes>
      </main>
    </div>
  );
}
