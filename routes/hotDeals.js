const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinary');
const HotDeal = require('../models/HotDeal');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'hot-deals',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET all deals
router.get('/', async (req, res) => {
  const items = await HotDeal.find();
  res.json(items);
});

// POST a new deal
router.post('/', authenticateToken, authorizeRole('superadmin'), upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, originalPrice } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Image is required' });

    const deal = new HotDeal({
      name,
      description,
      price,
      originalPrice,
      image: req.file.path,
    });

    await deal.save();
    res.status(201).json(deal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put('/:id', authenticateToken, authorizeRole('superadmin'), upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, originalPrice } = req.body;
    const updateData = { name, description, price, originalPrice };

    if (req.file) updateData.image = req.file.path;

    const updated = await HotDeal.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', authenticateToken, authorizeRole('superadmin'), async (req, res) => {
  try {
    const deleted = await HotDeal.findByIdAndDelete(req.params.id);
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
