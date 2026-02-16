import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEnvelope, FaLock } from "react-icons/fa";

export default function SignIn() {
  const [form, setForm] = useState({ email: "", password: "" });
  const nav = useNavigate();

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/login",
        form
      );
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("✅ Login successful!");
      setTimeout(() => nav("/"), 1000);
    } catch (e) {
      console.error(e.response?.data || e.message);
      toast.error(e.response?.data?.error || "❌ Login failed");
    }
  };

  return (
    <div style={wrap}>
      <form onSubmit={onSubmit} style={card}>
        <h2 style={title}>Inventory Portal</h2>
        <p style={subtitle}>Manage your stock & orders efficiently</p>

        <div style={inputWrap}>
          <FaEnvelope style={icon} />
          <input
            style={input}
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            required
          />
        </div>

        <div style={inputWrap}>
          <FaLock style={icon} />
          <input
            style={input}
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={onChange}
            required
          />
        </div>

        <button style={btn} type="submit">
          Sign In
        </button>

        <p style={{ marginTop: 16, fontSize: 14 }}>
          New here?{" "}
          <Link to="/signup" style={{ color: "#4f46e5", fontWeight: "600" }}>
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}

const wrap = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #6366f1, #3b82f6, #06b6d4)",
  fontFamily: "Segoe UI, sans-serif",
  padding: "20px",
};

const card = {
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(12px)",
  padding: "35px 30px",
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(0,0,0,.2)",
  width: 380,
  textAlign: "center",
  animation: "fadeInUp 0.6s ease",
};

const title = {
  fontSize: 26,
  marginBottom: 8,
  fontWeight: "700",
  color: "#1e293b",
};

const subtitle = {
  fontSize: 14,
  marginBottom: 22,
  color: "#475569",
};

const inputWrap = {
  display: "flex",
  alignItems: "center",
  background: "#f1f5f9",
  border: "1px solid #d1d5db",
  borderRadius: 10,
  padding: "10px 12px",
  margin: "10px 0",
};

const icon = {
  marginRight: 10,
  color: "#64748b",
  fontSize: 16,
};

const input = {
  border: "none",
  outline: "none",
  background: "transparent",
  flex: 1,
  fontSize: 15,
  color: "#1e293b",
};

const btn = {
  width: "100%",
  padding: "12px",
  background: "linear-gradient(90deg, #4f46e5, #3b82f6)",
  color: "#fff",
  fontWeight: "600",
  border: "none",
  borderRadius: 10,
  marginTop: 12,
  cursor: "pointer",
  transition: "0.3s",
};
