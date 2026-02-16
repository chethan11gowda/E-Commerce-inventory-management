// models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: false },
  name: String,
  price: Number,
  quantity: { type: Number, required: true, default: 1 },
  image: String,
});

const orderSchema = new mongoose.Schema({
  items: [orderItemSchema],
  total: { type: Number, default: 0 },
  paymentMode: { type: String, enum: ['COD', 'Stripe'], default: 'COD' },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Completed'],
    default: 'Pending',
  },
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerEmail: { type: String },
});

module.exports = mongoose.model('Order', orderSchema);
