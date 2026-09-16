const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Place new order
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, address, items, total } = req.body;
    const newOrder = new Order({
      orderId: uuidv4(),
      name,
      email,
      phone,
      address,
      items,
      total
    });
    await newOrder.save();
    res.status(201).json({ success: true, message: 'Order placed successfully', orderId: newOrder.orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to place order' });
  }
});

// Get today's orders
router.get('/today', authenticateToken, authorizeRole('superadmin'), async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const todayOrders = await Order.find({
      placedAt: { $gte: start, $lte: end }
    }).sort({ placedAt: -1 });

    res.json(todayOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch today's orders" });
  }
});


// GET all orders (latest first)
router.get('/', authenticateToken, authorizeRole('superadmin'), async (req, res) => {
  try {
    const orders = await Order.find().sort({ placedAt: -1 }); // latest first
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});


module.exports = router;
