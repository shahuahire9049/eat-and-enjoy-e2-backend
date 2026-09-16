// routes/admins.js
const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// GET all admins (superadmin only)
router.get('/', authenticateToken, authorizeRole('superadmin'), async (req, res) => {
  const admins = await Admin.find().select('-password');
  res.json(admins);
});

// POST add new admin
router.post('/', authenticateToken, authorizeRole('superadmin'), async (req, res) => {
  const { username, password, role } = req.body;
  const existing = await Admin.findOne({ username });
  if (existing) return res.status(400).json({ error: 'Username already exists' });

  const newAdmin = new Admin({ username, password, role });
  await newAdmin.save();
  res.status(201).json({ message: 'Admin created successfully' });
});

// PUT update admin
router.put('/:id', authenticateToken, authorizeRole('superadmin'), async (req, res) => {
  const { password, role } = req.body;
  const updateData = {};
  if (role) updateData.role = role;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(password, salt);
  }

  const updated = await Admin.findByIdAndUpdate(req.params.id, updateData, { new: true });
  res.json(updated);
});

// DELETE admin
router.delete('/:id', authenticateToken, authorizeRole('superadmin'), async (req, res) => {
  const deleted = await Admin.findByIdAndDelete(req.params.id);
  res.json(deleted);
});

module.exports = router;
