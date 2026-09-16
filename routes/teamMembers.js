const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinary');
const TeamMember = require('../models/TeamMember');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'team-members',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET all team members
router.get('/', async (req, res) => {
  const members = await TeamMember.find();
  res.json(members);
});

// POST new member
router.post('/', authenticateToken, authorizeRole('superadmin'), upload.single('image'), async (req, res) => {
  try {
    const { name, role } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Image required' });

    const member = new TeamMember({
      name,
      role,
      image: req.file.path,
    });

    await member.save();
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update
router.put('/:id', authenticateToken, authorizeRole('superadmin'), upload.single('image'), async (req, res) => {
  try {
    const { name, role } = req.body;
    const updateData = { name, role };
    if (req.file) updateData.image = req.file.path;

    const updated = await TeamMember.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', authenticateToken, authorizeRole('superadmin'), async (req, res) => {
  try {
    const deleted = await TeamMember.findByIdAndDelete(req.params.id);
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
