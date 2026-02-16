const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String, required: true, trim: true, minlength: 2, maxlength: 50
  },
  email: {
    type: String, required: true, unique: true, lowercase: true, trim: true
  },
  passwordHash: {
    type: String, required: true
  },
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
