const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinary');
const Category = require('../models/Category');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'food-categories',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    public_id: file.originalname.split('.')[0] + '-' + Date.now()
  }),
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ✅ GET all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST a new category
router.post('/', authenticateToken, authorizeRole('superadmin'), upload.single('image'), async (req, res) => {
  try {
    console.log('BODY:', req.body);
    console.log('FILE:', req.file); // <== DEBUG HERE

    const { name, slug } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imageUrl = req.file.path;
    const category = new Category({ name, slug, image: imageUrl });
    await category.save();

    res.status(201).json(category);
  } catch (err) {
    console.error('Error adding category:', err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a category
router.put('/:id', authenticateToken, authorizeRole('superadmin'), upload.single('image'), async (req, res) => {
  try {
    const { name, slug } = req.body;
    const updateData = { name, slug };

    if (req.file) {
      updateData.image = req.file.path; // Cloudinary URL
    }

    const updated = await Category.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Update error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE category by ID
router.delete('/:id', authenticateToken, authorizeRole('superadmin'), async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Category not found' });
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
