const express = require('express');
const router = express.Router();
const {
  getInvitations,
  saveInvitation,
  uploadRenderedCard
} = require('../controllers/invitationController');

// Get invitations for a marriage (e.g. GET /api/v1/invitations/RAHUL24 or ?ceremony=HALDI)
router.get('/:marriageCode', getInvitations);

// Save / Update customized invitation for a ceremony
router.post('/', saveInvitation);

// Upload client-rendered card PNG to GridFS
router.post('/render-upload', uploadRenderedCard);

module.exports = router;

