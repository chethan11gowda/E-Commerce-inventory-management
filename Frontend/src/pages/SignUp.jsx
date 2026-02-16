// src/pages/SignUp.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function SignUp() {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=username+password
  const [form, setForm] = useState({
    email: "",
    otp: "",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /** Step 1: Send OTP */
  const sendOtp = async () => {
    if (!form.email) return toast.error("📧 Please enter your email");
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/send-otp", {
        email: form.email,
      });
      toast.success("📩 OTP sent to your email");
      setStep(2);
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /** Step 2: Verify OTP */
  const verifyOtp = async () => {
    if (!form.otp) return toast.error("🔑 Enter OTP");
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email: form.email,
        otp: form.otp,
      });
      toast.success("✅ OTP verified!");
      setStep(3);
    } catch (e) {
      toast.error(e.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /** Step 3: Register user */
  const register = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password)
      return toast.error("Fill all fields");

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      toast.success("🎉 Account created! Please sign in.");
      nav("/signin");
    } catch (e) {
      toast.error(e.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrap}>
      <div style={card} className="animate-card">
        <h2 style={title}>✨ Create Your Account</h2>
        <p style={subtitle}>Secure signup with email OTP verification 🚀</p>

        {step === 1 && (
          <div>
            <input
              style={input}
              name="email"
              type="email"
              placeholder="📧 Enter your email"
              value={form.email}
              onChange={onChange}
              required
            />
            <button style={btn} onClick={sendOtp} disabled={loading}>
              {loading ? "⏳ Sending OTP..." : "📩 Send OTP"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <input
              style={input}
              name="otp"
              placeholder="🔑 Enter OTP"
              value={form.otp}
              onChange={onChange}
              required
            />
            <button style={btn} onClick={verifyOtp} disabled={loading}>
              {loading ? "⏳ Verifying..." : "✅ Verify OTP"}
            </button>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={register}>
            <input
              style={input}
              name="username"
              placeholder="👤 Username"
              value={form.username}
              onChange={onChange}
              required
            />
            <input
              style={input}
              name="password"
              type="password"
              placeholder="🔒 Password"
              value={form.password}
              onChange={onChange}
              required
            />
            <button style={btn} type="submit" disabled={loading}>
              {loading ? "⏳ Creating Account..." : "🚀 Sign Up"}
            </button>
          </form>
        )}

        <p style={footerText}>
          Already have an account?{" "}
          <Link to="/signin" style={link}>
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}

// 🎨 Same styles as before
const wrap = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)",
  padding: "20px",
};

const card = {
  background: "white",
  padding: "40px 32px",
  borderRadius: "20px",
  boxShadow: "0 12px 40px rgba(0,0,0,.15)",
  width: "400px",
  textAlign: "center",
  animation: "fadeIn 0.8s ease",
};

const title = {
  marginBottom: "8px",
  fontSize: "26px",
  fontWeight: "700",
  color: "#111827",
};

const subtitle = {
  marginBottom: "20px",
  fontSize: "14px",
  color: "#6b7280",
};

const input = {
  width: "100%",
  padding: "14px 16px",
  border: "1px solid #d1d5db",
  borderRadius: "12px",
  margin: "12px 0",
  fontSize: "15px",
  outline: "none",
  transition: "all 0.3s",
};

const btn = {
  width: "100%",
  padding: "14px",
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "600",
  marginTop: "14px",
  boxShadow: "0 4px 15px rgba(99,102,241,0.4)",
  transition: "all 0.3s",
};

const footerText = {
  marginTop: "16px",
  fontSize: "14px",
  color: "#374151",
};

const link = {
  color: "#6366f1",
  fontWeight: "600",
  textDecoration: "none",
};
