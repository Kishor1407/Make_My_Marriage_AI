const express = require('express');
const router = express.Router();
const {
  createMarriage,
  getAllMarriages,
  getMarriageById,
  updateMarriage,
  deleteMarriage,
  addBlessing,
  getBlessings,
  getAuditSeal
} = require('../controllers/marriageController');
const { getEventsForMarriage } = require('../controllers/eventController');
const { protect, requireAdmin } = require('../middlewares/authMiddleware');

// Public route to browse wedding grid
router.get('/', getAllMarriages);

// Cryptographic SHA-256 certificate and integrity seal for a marriage
router.get('/:marriageId/audit-seal', getAuditSeal);

// Admin-only creation
router.post('/', protect, requireAdmin, createMarriage);

// Single wedding dashboard (Accessible by passcode or ID)
router.get('/:marriageId', getMarriageById);

// Instant Blessings Bar endpoints
router.post('/:marriageId/blessing', addBlessing);
router.get('/:marriageId/blessings', getBlessings);

// Admin-only update
router.put('/:marriageId', protect, requireAdmin, updateMarriage);

// Admin-only deletion with cascading cleanup
router.delete('/:marriageId', protect, requireAdmin, deleteMarriage);

// Get events for marriage
router.get('/:marriageId/events', getEventsForMarriage);

module.exports = router;
