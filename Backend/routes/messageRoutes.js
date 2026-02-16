const express = require("express");
const Message = require("../models/Message");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, message, orderId, productName } = req.body;
    const newMessage = new Message({ name, email, message, orderId, productName });
    await newMessage.save();
    res.status(201).json({ success: true, message: "Message saved" });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// Get all messages
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
