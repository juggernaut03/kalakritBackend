// routes/wallet.js
const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get wallet balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json({ balance: user.wallet });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add funds to wallet
router.post('/add-funds', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.userId);
    user.wallet += amount;
    await user.save();
    res.json({ balance: user.wallet });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;