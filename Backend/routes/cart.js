const express = require('express');
const auth = require('../middleware/auth');
const Cart = require('../models/Cart');

const router = express.Router();

/** Get user's cart */
router.get('/', auth, async (req, res) => {
  try {
    console.log('User ID from auth:', req.user.id);
    const cart = await Cart.findOne({ user: req.user.id });
    res.json(cart || { items: [] });
  } catch (error) {
    console.error('Failed to fetch cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

/** Save/update user's cart */
router.post('/', auth, async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Items must be an array' });
  }

  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items, updatedAt: Date.now() },
      { upsert: true, new: true }
    );
    res.json(cart);
  } catch (error) {
    console.error('Failed to save cart:', error);
    res.status(500).json({ error: 'Failed to save cart' });
  }
});

/** Clear cart */
router.delete('/', auth, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user.id });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to clear cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;
