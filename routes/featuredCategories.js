const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinary');
const FeaturedCategory = require('../models/FeaturedCategory');

// Setup Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'featured-categories',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

/**
 * GET all featured categories
 */
router.get('/', async (req, res) => {
  try {
    const items = await FeaturedCategory.find();
    res.status(200).json(items);
  } catch (err) {
    console.error('Fetch failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch featured categories.' });
  }
});

/**
 * POST - Create new featured category
 */
router.post('/', authenticateToken, authorizeRole('superadmin'), upload.single('image'), async (req, res) => {
  try {
    const { name, slug, productCount } = req.body;
    if (!name || !slug || !req.file) {
      return res.status(400).json({ error: 'Name, slug and image are required.' });
    }

    const category = new FeaturedCategory({
      name,
      slug,
      productCount: parseInt(productCount) || 0,
      imageUrl: req.file.path,
    });

    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error('Create failed:', err.message);
    res.status(500).json({ error: 'Failed to create featured category.' });
  }
});

/**
 * PUT - Update featured category
 */
router.put('/:id', authenticateToken, authorizeRole('superadmin'), upload.single('image'), async (req, res) => {
  try {
    const { name, slug, productCount } = req.body;

    const updateData = {
      name,
      slug,
      productCount: parseInt(productCount) || 0,
    };

    if (req.file) {
      updateData.imageUrl = req.file.path;
    }

    const updated = await FeaturedCategory.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updated) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error('Update failed:', err.message);
    res.status(500).json({ error: 'Failed to update featured category.' });
  }
});

/**
 * DELETE - Delete a featured category
 */
router.delete('/:id', authenticateToken, authorizeRole('superadmin'), async (req, res) => {
  try {
    const deleted = await FeaturedCategory.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully', deleted });
  } catch (err) {
    console.error('Delete failed:', err.message);
    res.status(500).json({ error: 'Failed to delete featured category.' });
  }
});

module.exports = router;
