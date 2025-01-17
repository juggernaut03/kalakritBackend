const router = require('express').Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// Get user's orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.userId })
      .populate('products.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post('/', auth, async (req, res) => {
    try {
      const order = new Order({
        ...req.body,
        buyer: req.user.userId
      });
      await order.save();
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  
  module.exports = router;