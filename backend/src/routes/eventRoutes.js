const express = require('express');
const router = express.Router();
const {
  getEventsForMarriage,
  updateEventDetails,
  updateStreamConfig
} = require('../controllers/eventController');
const { protect, requireAdmin } = require('../middlewares/authMiddleware');

// Get all events for a marriage code or ID
router.get('/marriage/:marriageId', getEventsForMarriage);

// Update stream configuration for an event rite (PRD 4.6)
router.put('/config/stream', protect, requireAdmin, updateStreamConfig);

// Update timeline event details by Event ID
router.put('/:eventId', protect, requireAdmin, updateEventDetails);

module.exports = router;

