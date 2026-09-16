const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinary');
const Deal = require('../models/Deal');

// Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'todays-deals',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    public_id: (req, file) => file.originalname.split('.')[0] + '-' + Date.now()
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET all deals
router.get('/', async (req, res) => {
  try {
    const deals = await Deal.find().sort({ createdAt: -1 });
    res.json(deals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new deal
router.post('/', authenticateToken, authorizeRole('superadmin'), upload.single('image'), async (req, res) => {
  try {
    const { name, price, description } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Image is required' });

    const image = req.file.path;
    const deal = new Deal({ name, price, description, image });
    await deal.save();
    res.status(201).json(deal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update a deal
router.put('/:id', authenticateToken, authorizeRole('superadmin'), upload.single('image'), async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const updateData = { name, price, description };
    if (req.file) updateData.image = req.file.path;

    const updated = await Deal.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: 'Deal not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a deal
router.delete('/:id', authenticateToken, authorizeRole('superadmin'), async (req, res) => {
  try {
    const deleted = await Deal.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Deal not found' });
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
