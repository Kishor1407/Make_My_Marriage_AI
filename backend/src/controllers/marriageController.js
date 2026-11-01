const mongoose = require('mongoose');
const Marriage = require('../models/Marriage');
const { Event, EVENT_TYPES } = require('../models/Event');
const { generateQRCodeDataUrl } = require('../utils/qrcode');
const { getGridFSBucket } = require('../config/db');

// @desc    Create new Marriage & automatically generate 6 timeline events
// @route   POST /api/v1/marriages
// @access  Admin Only
const createMarriage = async (req, res, next) => {
  try {
    const { partnerOneName, partnerTwoName, customCode } = req.body;

    if (!partnerOneName || !partnerTwoName) {
      return res.status(400).json({ error: 'Both partner names are required.' });
    }

    // Generate marriage passcode e.g., RAHUL2026 or custom
    const code = customCode
      ? customCode.trim().toUpperCase()
      : `${partnerOneName.slice(0, 4).toUpperCase()}${new Date().getFullYear()}`;

    // Ensure unique code
    const existingMarriage = await Marriage.findOne({ marriageCode: code });
    if (existingMarriage) {
      return res.status(400).json({
        error: `Marriage code "${code}" already exists. Please choose a custom passcode.`
      });
    }

    // Generate QR Code data URL pointing to guest upload page
    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const uploadUrl = `${frontendBaseUrl}/guest/upload?code=${code}`;
    const qrCodeUrl = await generateQRCodeDataUrl(uploadUrl);

    // 1. Create Marriage
    const marriage = await Marriage.create({
      partnerOneName,
      partnerTwoName,
      marriageCode: code,
      adminId: req.user.id,
      qrCodeUrl,
      globalStats: {
        totalPhotos: 0,
        totalVideos: 0,
        totalGuestsEngaged: 0
      }
    });

    // 2. Data Integrity Rule: Batch-insert exactly 6 events
    const initialEvents = EVENT_TYPES.map((type) => ({
      marriageId: marriage._id,
      eventType: type,
      customTitle: type === 'OTHERS' ? 'Reception' : null,
      eventDate: null,
      eventTime: null,
      venueAddress: null,
      liveStreamUrl: null,
      eventStats: {
        photoCount: 0,
        videoCount: 0
      }
    }));

    await Event.insertMany(initialEvents);

    res.status(201).json({
      success: true,
      data: marriage
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all marriages for public homepage grid (safe projection)
// @route   GET /api/v1/marriages
// @access  Public
const getAllMarriages = async (req, res, next) => {
  try {
    // Only project safe public display fields
    const marriages = await Marriage.find({}, 'partnerOneName partnerTwoName createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: marriages.length,
      data: marriages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Marriage details & dashboard data
// @route   GET /api/v1/marriages/:marriageId
// @access  Admin or Authorized Guest
const getMarriageById = async (req, res, next) => {
  try {
    const marriage = await Marriage.findById(req.params.marriageId);

    if (!marriage) {
      return res.status(404).json({ error: 'Marriage not found.' });
    }

    // If guest, verify assigned marriage
    if (req.user.role === 'GUEST' && req.user.assignedMarriageId !== marriage._id.toString()) {
      return res.status(403).json({
        error: 'You do not have permission to access this marriage dashboard.'
      });
    }

    res.status(200).json({
      success: true,
      data: marriage
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Marriage (Cascades to all 6 events and GridFS files)
// @route   DELETE /api/v1/marriages/:marriageId
// @access  Admin Only (Creator)
const deleteMarriage = async (req, res, next) => {
  try {
    const marriage = await Marriage.findById(req.params.marriageId);

    if (!marriage) {
      return res.status(404).json({ error: 'Marriage not found.' });
    }

    // Verify ownership
    if (marriage.adminId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this marriage.' });
    }

    const bucket = getGridFSBucket();

    // 1. Delete all media from GridFS
    const db = mongoose.connection.db;
    const files = await db
      .collection('uploads.files')
      .find({ 'metadata.marriageId': marriage._id.toString() })
      .toArray();

    for (const file of files) {
      try {
        await bucket.delete(file._id);
      } catch (err) {
        console.error(`Failed to delete GridFS file ${file._id}:`, err.message);
      }
    }

    // 2. Delete all 6 events
    await Event.deleteMany({ marriageId: marriage._id });

    // 3. Delete Marriage document
    await marriage.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Marriage and all associated events and media have been purged.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMarriage,
  getAllMarriages,
  getMarriageById,
  deleteMarriage
};

