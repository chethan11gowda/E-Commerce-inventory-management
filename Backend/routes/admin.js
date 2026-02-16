// admin.js (Backend)

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const inventoryModel = require('../models/inventoryModel');
const Order = require('../models/Order');
const Message = require('../models/Message');
const adminRouter = express.Router();

// Secret key for JWT
const JWT_SECRET = 'your_jwt_secret_key';  // Change this to a more secure secret

// Hardcoded Admin credentials
const adminUsername = '123';
const adminPassword = '123';  // Plaintext password (to hash before comparing)

const hashedPassword = bcrypt.hashSync(adminPassword, 10); // Hash the password before using it

// Admin Login Route
adminRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username matches
    if (username !== adminUsername) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: 'admin123' }, JWT_SECRET, { expiresIn: '1h' });

    // Send the token in the response
    res.json({
      message: 'Login successful',
      token,  // Send the token to the frontend
      adminId: 'admin123', // Example of an admin ID
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

adminRouter.get("/stats", async (req, res) => {
  try {
    const products = await inventoryModel.countDocuments();
    const orders = await Order.countDocuments();
    const messages = await Message.countDocuments();  // ✅ should return 4 if you have 4 docs
    const lowStockProducts = await inventoryModel.find({ quantity: { $lt: 10 } });

    res.json({
      products,
      orders,
      messages,
      lowStock: lowStockProducts.length,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Server error" });
  }
});
adminRouter.get("/analysis", async (req, res) => {
  try {
    const totalRevenueAgg = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$total" }, totalOrders: { $sum: 1 } } },
    ]);

    const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;
    const totalOrders = totalRevenueAgg[0]?.totalOrders || 0;
    const avgOrder = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;

    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          sales: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { sales: -1 } },
      { $limit: 5 },
    ]);

    const categorySales = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "inventories",
          localField: "items.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product.category",
          sales: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $project: { category: "$_id", sales: 1, revenue: 1, _id: 0 } },
    ]);

    const orderTrends = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 7 },
    ]);

    const lowStock = await inventoryModel.find({ quantity: { $lt: 10 } })
      .select("name quantity category price")
      .sort({ quantity: 1 })
      .limit(10);

    const paymentSplit = await Order.aggregate([
      { $group: { _id: "$paymentMode", count: { $sum: 1 }, revenue: { $sum: "$total" } } },
      { $project: { mode: "$_id", count: 1, revenue: 1, _id: 0 } },
    ]);

    res.json({
      revenue: totalRevenue,
      orders: totalOrders,
      avgOrder,
      topProducts,
      categorySales,
      orderTrends,
      lowStock,
      paymentSplit,
    });
  } catch (err) {
    console.error("Error in analysis API:", err);
    res.status(500).json({ error: "Failed to fetch analysis" });
  }
});


module.exports = adminRouter;
