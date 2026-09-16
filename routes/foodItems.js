const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinary');
const FoodItem = require('../models/FoodItem');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'food-items',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// 1️⃣ Fetch all food items (used by admin panel to list/manage)
router.get('/', async (req, res) => {
  try {
    const items = await FoodItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2️⃣ Fetch items by category (used in category.html frontend)
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const items = await FoodItem.find({ category });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new food item
router.post('/', authenticateToken, authorizeRole('superadmin'), upload.single('image'), async (req, res) => {
  try {
    const { name, category, price } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Image is required' });

    const item = new FoodItem({
      name,
      category,
      price,
      image: req.file.path
    });

    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete item
router.delete('/:id', authenticateToken, authorizeRole('superadmin'), async (req, res) => {
  const deleted = await FoodItem.findByIdAndDelete(req.params.id);
  res.json(deleted);
});

// Update item
router.put('/:id', authenticateToken, authorizeRole('superadmin'), upload.single('image'), async (req, res) => {
  try {
    const { name, category, price } = req.body;
    const updateData = { name, category, price };

    if (req.file) updateData.image = req.file.path;

    const updated = await FoodItem.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search items by partial name (for suggestions)
router.get('/search/:keyword', async (req, res) => {
  try {
    const regex = new RegExp(req.params.keyword, 'i');
    const items = await FoodItem.find({ name: regex }).limit(5);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
