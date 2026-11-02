const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const marriageRoutes = require('./marriageRoutes');
const eventRoutes = require('./eventRoutes');
const mediaRoutes = require('./mediaRoutes');
const invitationRoutes = require('./invitationRoutes');

// Baseline Health Check (Crucial for Render cold-start detection)
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'Make My Marriage API Gateway'
  });
});

// Sub-route bindings
router.use('/auth', authRoutes);
router.use('/marriages', marriageRoutes);
router.use('/events', eventRoutes);
router.use('/media', mediaRoutes);
router.use('/photos', mediaRoutes);
router.use('/invitations', invitationRoutes);

module.exports = router;

