import './AdminLogin.css';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/admin/login', {
        username,
        password,
      });

      localStorage.setItem('adminToken', response.data.token);
      toast.success("✅ Login successful");
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || '❌ Invalid credentials');
    }
  };

  return (
    <div className="admin-login-container">
      <form className="admin-login-form animate-card" onSubmit={handleSubmit}>
        <h2 className="admin-login-title">🔑 Admin Login</h2>

        <div className="form-group">
          <label htmlFor="username">👤 Username</label>
          <input
            type="text"
            id="username"
            value={username}
            placeholder="Enter admin username"
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">🔒 Password</label>
          <input
            type="password"
            id="password"
            value={password}
            placeholder="Enter password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="login-btn">
          🚀 Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
