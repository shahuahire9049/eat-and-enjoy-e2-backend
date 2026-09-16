// routes/popularRestaurants.js
const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinary');
const PopularRestaurant = require('../models/PopularRestaurant');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'popular-restaurants',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    public_id: file.originalname.split('.')[0] + '-' + Date.now(),
  }),
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ✅ GET all
router.get('/', async (req, res) => {
  try {
    const restaurants = await PopularRestaurant.find();
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST new restaurant
router.post('/', authenticateToken, authorizeRole('superadmin'), upload.single('image'), async (req, res) => {
  try {
    const { name, slug, rating, openingHours, address } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Image file required' });

    const image = req.file.path;
    const newRestaurant = new PopularRestaurant({
      name,
      slug,
      image,
      rating,
      openingHours,
      address,
    });

    await newRestaurant.save();
    res.status(201).json(newRestaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ PUT update
router.put('/:id', authenticateToken, authorizeRole('superadmin'), upload.single('image'), async (req, res) => {
  try {
    const { name, slug, rating, openingHours, address } = req.body;

    const updateData = {
      name,
      slug,
      rating,
      openingHours,
      address,
    };

    if (req.file) {
      updateData.image = req.file.path;
    }

    const updated = await PopularRestaurant.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updated) return res.status(404).json({ error: 'Restaurant not found' });

    res.json(updated);
  } catch (err) {
    console.error('Update Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE
router.delete('/:id', authenticateToken, authorizeRole('superadmin'), async (req, res) => {
  try {
    const deleted = await PopularRestaurant.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
