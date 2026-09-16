const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinary');
const BlogPost = require('../models/BlogPost');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'blog-posts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET all blog posts
router.get('/', async (req, res) => {
  const posts = await BlogPost.find().sort({ date: -1 });
  res.json(posts);
});

// POST a blog post
router.post('/', authenticateToken, authorizeRole('superadmin'), upload.fields([{ name: 'image' }, { name: 'avatar' }]), async (req, res) => {
  try {
    const { title, category, description, authorName } = req.body;

    const blog = new BlogPost({
      title,
      category,
      description,
      image: req.files.image?.[0]?.path,
      author: {
        name: authorName,
        avatar: req.files.avatar?.[0]?.path
      }
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticateToken, authorizeRole('superadmin'), upload.fields([{ name: 'image' }, { name: 'avatar' }]), async (req, res) => {
  try {
    const { title, category, description, authorName } = req.body;

    const updateData = {
      title,
      category,
      description,
      author: { name: authorName },
    };

    if (req.files.image?.[0]) updateData.image = req.files.image[0].path;
    if (req.files.avatar?.[0]) updateData.author.avatar = req.files.avatar[0].path;

    const updated = await BlogPost.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updated) return res.status(404).json({ error: 'Post not found' });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// DELETE blog
router.delete('/:id', authenticateToken, authorizeRole('superadmin'), async (req, res) => {
  try {
    const deleted = await BlogPost.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
