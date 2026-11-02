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
    const { partnerOneName, partnerTwoName, customCode, venue, dates, coverImage, status } = req.body;

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
    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const uploadUrl = `${frontendBaseUrl}/guest/upload?code=${code}`;
    const qrCodeUrl = await generateQRCodeDataUrl(uploadUrl);

    // 1. Create Marriage
    const marriage = await Marriage.create({
      partnerOneName: partnerOneName.trim(),
      partnerTwoName: partnerTwoName.trim(),
      marriageCode: code,
      adminId: req.user.id,
      qrCodeUrl,
      venue: venue || 'The Leela Palace Seaside, South Goa',
      dates: dates || 'December 14–16, 2026',
      status: status || 'Scheduled',
      coverImage: coverImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwZlcHb_KVUMvBiZhacxOUxbjv9rYLP52FrP0hNeO5AuTcxEUpEnjINTU_47yEacFb_9IlmAslUSaFNBYVtJ3uTPDgVQRMVRh-nJlO3WnRTF9ebW2trgiHhtykoYA8O7bM5PNbzgeS8HBzOwYuFSXJmuaYXjz8rUBRBjcBXe58Yor5miYy_VkclG4OdFRA2SoWL4_6DHNwLl5-z6ziJgt7_w_0DU7nns2FViIwomk',
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

// @desc    Get all marriages
// @route   GET /api/v1/marriages
// @access  Public / Admin
const getAllMarriages = async (req, res, next) => {
  try {
    const marriages = await Marriage.find().sort({ createdAt: -1 });

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
    let marriage = null;
    if (mongoose.Types.ObjectId.isValid(req.params.marriageId)) {
      marriage = await Marriage.findById(req.params.marriageId);
    }
    if (!marriage) {
      marriage = await Marriage.findOne({ marriageCode: req.params.marriageId.toUpperCase() });
    }

    if (!marriage) {
      return res.status(404).json({ error: 'Marriage not found.' });
    }

    // Ensure QR code URL exists
    if (!marriage.qrCodeUrl) {
      try {
        const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        marriage.qrCodeUrl = await generateQRCodeDataUrl(`${frontendBaseUrl}/guest/upload?code=${marriage.marriageCode}`);
        await marriage.save();
      } catch (err) {
        console.error('Error generating fallback QR code:', err);
      }
    }

    res.status(200).json({
      success: true,
      data: marriage
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Marriage
// @route   PUT /api/v1/marriages/:marriageId
// @access  Admin Only
const updateMarriage = async (req, res, next) => {
  try {
    let marriage = null;
    if (mongoose.Types.ObjectId.isValid(req.params.marriageId)) {
      marriage = await Marriage.findById(req.params.marriageId);
    }
    if (!marriage) {
      marriage = await Marriage.findOne({ marriageCode: req.params.marriageId.toUpperCase() });
    }

    if (!marriage) {
      return res.status(404).json({ error: 'Marriage vault not found.' });
    }

    const { partnerOneName, partnerTwoName, marriageCode, venue, dates, status, coverImage, guestsEngaged, totalPhotos } = req.body;

    if (partnerOneName) marriage.partnerOneName = partnerOneName.trim();
    if (partnerTwoName) marriage.partnerTwoName = partnerTwoName.trim();
    if (venue) marriage.venue = venue.trim();
    if (dates) marriage.dates = dates.trim();
    if (status) marriage.status = status.trim();
    if (coverImage) marriage.coverImage = coverImage;
    if (guestsEngaged !== undefined) marriage.globalStats.totalGuestsEngaged = Number(guestsEngaged);
    if (totalPhotos !== undefined) marriage.globalStats.totalPhotos = Number(totalPhotos);

    if (marriageCode && marriageCode.trim().toUpperCase() !== marriage.marriageCode) {
      const newCode = marriageCode.trim().toUpperCase();
      const existing = await Marriage.findOne({ marriageCode: newCode });
      if (existing && existing._id.toString() !== marriage._id.toString()) {
        return res.status(400).json({ error: `Marriage code "${newCode}" is already in use.` });
      }
      marriage.marriageCode = newCode;
      const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      marriage.qrCodeUrl = await generateQRCodeDataUrl(`${frontendBaseUrl}/guest/upload?code=${newCode}`);
    }

    await marriage.save();

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
    let marriage = null;
    if (mongoose.Types.ObjectId.isValid(req.params.marriageId)) {
      marriage = await Marriage.findById(req.params.marriageId);
    }
    if (!marriage) {
      marriage = await Marriage.findOne({ marriageCode: req.params.marriageId.toUpperCase() });
    }

    if (!marriage) {
      return res.status(404).json({ error: 'Marriage vault not found.' });
    }

    const bucket = getGridFSBucket();

    // 1. Delete all media from GridFS
    try {
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
    } catch (e) {
      console.warn('GridFS purge skipped:', e.message);
    }

    // 2. Delete all 6 events
    await Event.deleteMany({ marriageId: marriage._id });

    // 3. Delete Marriage document
    await marriage.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Marriage and all associated events and media have been permanently purged.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMarriage,
  getAllMarriages,
  getMarriageById,
  updateMarriage,
  deleteMarriage
};
