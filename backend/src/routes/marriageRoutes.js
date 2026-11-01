const express = require('express');
const router = express.Router();
const {
  createMarriage,
  getAllMarriages,
  getMarriageById,
  deleteMarriage
} = require('../controllers/marriageController');
const { getEventsForMarriage } = require('../controllers/eventController');
const { protect, requireAdmin } = require('../middlewares/authMiddleware');

// Public route to browse wedding grid
router.get('/', getAllMarriages);

// Admin-only creation
router.post('/', protect, requireAdmin, createMarriage);

// Single wedding dashboard (Admin or authenticated guest)
router.get('/:marriageId', protect, getMarriageById);

// Admin-only deletion with cascading cleanup
router.delete('/:marriageId', protect, requireAdmin, deleteMarriage);

// Get events for marriage
router.get('/:marriageId/events', protect, getEventsForMarriage);

module.exports = router;

