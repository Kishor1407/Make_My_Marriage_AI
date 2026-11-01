const express = require('express');
const router = express.Router();
const { updateEventDetails } = require('../controllers/eventController');
const { protect, requireAdmin } = require('../middlewares/authMiddleware');

// Update timeline event details
router.put('/:eventId', protect, requireAdmin, updateEventDetails);

module.exports = router;

