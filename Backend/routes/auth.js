const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

/** 📩 Nodemailer setup (use Gmail App Password) */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // e.g. yourapp@gmail.com
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

// In-memory OTP store (email → { otp, expires })
const otpStore = new Map();

/** 🔹 Step 1: Send OTP */
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "Email already registered" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });

   await transporter.sendMail({
  from: `"Inventory App" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "🔐 Your OTP Code - Inventory App",
  text: `Hello,

Thank you for signing up with Inventory App!

Your One-Time Password (OTP) is: ${otp}

⚠️ This code will expire in 5 minutes. Please do not share this OTP with anyone.

If you did not request this, you can safely ignore this email.

Best regards,  
Inventory App Team
`,

  html: `
  <div style="font-family: Arial, sans-serif; line-height:1.6; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e0e0e0; border-radius:8px;">
    <h2 style="color:#4CAF50; text-align:center;">Inventory App Verification</h2>
    <p>Hello,</p>
    <p>Thank you for signing up with <b>Inventory App</b>! To complete your registration, please use the One-Time Password (OTP) below:</p>
    <div style="text-align:center; margin:20px 0;">
      <span style="display:inline-block; background:#f4f4f4; padding:15px 25px; font-size:22px; letter-spacing:4px; font-weight:bold; border-radius:6px; border:1px solid #ddd;">
        ${otp}
      </span>
    </div>
    <p style="color:#d32f2f;">⚠️ This OTP will expire in 5 minutes. Do not share it with anyone.</p>
    <p>If you did not request this, please ignore this email.</p>
    <hr style="margin:30px 0; border:none; border-top:1px solid #eee;">
    <p style="font-size:12px; color:#888; text-align:center;">
      &copy; ${new Date().getFullYear()} Inventory App. All rights reserved.
    </p>
  </div>
  `,
});


    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

/** 🔹 Step 2: Verify OTP */
router.post("/verify-otp", (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP required" });

    const record = otpStore.get(email);
    if (!record) return res.status(400).json({ error: "No OTP requested for this email" });

    if (record.otp !== otp || record.expires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // OTP verified → mark email as verified temporarily
    otpStore.set(email, { ...record, verified: true });

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OTP verification failed" });
  }
});

/** 🔹 Step 3: Register after OTP verified */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const otpRecord = otpStore.get(email);
    if (!otpRecord || !otpRecord.verified) {
      return res.status(400).json({ error: "Please verify OTP before registering" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      passwordHash: hash,
      isVerified: true,
    });

    otpStore.delete(email); // cleanup after registration

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

/** 🔹 Login */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    if (!user.isVerified)
      return res.status(403).json({ error: "Please verify your email before login" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Login failed" });
  }
});

/** 🔹 Get current user */
router.get("/me", auth, async (req, res) => {
  const u = await User.findById(req.user.id).select("username email createdAt isVerified");
  if (!u) return res.status(404).json({ error: "User not found" });
  res.json(u);
});

module.exports = router;
