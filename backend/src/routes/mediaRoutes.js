const express = require('express');
const router = express.Router();
const {
  uploadMedia,
  guestUploadMedia,
  getEventMedia,
  getMarriageGallery,
  streamMedia,
  deleteMedia
} = require('../controllers/mediaController');
const { protect, requireAdmin } = require('../middlewares/authMiddleware');
const { uploadBatch } = require('../middlewares/uploadMiddleware');

// Guest QR Photo Dump upload with Name & Email attribution (PRD 4.4)
router.post('/guest-upload', uploadBatch, guestUploadMedia);
router.post('/upload', uploadBatch, guestUploadMedia);

// Batch upload directly to GridFS by eventId
router.post('/upload/:eventId', uploadBatch, uploadMedia);

// Get all photos for a marriage gallery (with guest attribution badges)
router.get('/gallery/:marriageCode', getMarriageGallery);

// Get paginated media files for an event gallery
router.get('/event/:eventId', getEventMedia);

// Stream file binary directly (e.g., for <img src="...">)
router.get('/stream/:fileId', streamMedia);

// Admin-only media moderation / deletion
router.delete('/:fileId', protect, requireAdmin, deleteMedia);

module.exports = router;

