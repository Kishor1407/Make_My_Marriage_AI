const express = require('express');
const router = express.Router();
const {
  uploadMedia,
  getEventMedia,
  streamMedia,
  deleteMedia
} = require('../controllers/mediaController');
const { protect, requireAdmin } = require('../middlewares/authMiddleware');
const { uploadBatch } = require('../middlewares/uploadMiddleware');

// Batch upload directly to GridFS (Max 10 files)
router.post('/upload/:eventId', protect, uploadBatch, uploadMedia);

// Get paginated media files for an event gallery
router.get('/event/:eventId', protect, getEventMedia);

// Stream file binary directly (e.g., for <img src="...">)
router.get('/stream/:fileId', streamMedia);

// Admin-only media moderation / deletion
router.delete('/:fileId', protect, requireAdmin, deleteMedia);

module.exports = router;

