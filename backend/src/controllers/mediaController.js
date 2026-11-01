const mongoose = require('mongoose');
const { Event } = require('../models/Event');
const Marriage = require('../models/Marriage');
const { getGridFSBucket } = require('../config/db');

// @desc    Batch upload media files directly to GridFS (Max 10 files)
// @route   POST /api/v1/media/upload/:eventId
// @access  Admin or Authorized Guest
const uploadMedia = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Please attach at least one file to upload.' });
    }

    const { eventId } = req.params;
    const mediaType = req.body.mediaType || 'PHOTO';

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // Verify Guest access if user is guest
    if (req.user && req.user.role === 'GUEST' && req.user.assignedMarriageId !== event.marriageId.toString()) {
      return res.status(403).json({ error: 'Not authorized to upload to this marriage.' });
    }

    const uploadCount = req.files.length;
    const statKey = mediaType === 'VIDEO' ? 'videoCount' : 'photoCount';
    const globalStatKey = mediaType === 'VIDEO' ? 'totalVideos' : 'totalPhotos';

    // 1. Atomic denormalized increment in Events collection
    await Event.findByIdAndUpdate(eventId, {
      $inc: { [`eventStats.${statKey}`]: uploadCount }
    });

    // 2. Atomic denormalized increment in Marriages collection
    await Marriage.findByIdAndUpdate(event.marriageId, {
      $inc: { [`globalStats.${globalStatKey}`]: uploadCount }
    });

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${uploadCount} file(s).`,
      files: req.files.map((file) => ({
        id: file.id,
        filename: file.filename,
        contentType: file.contentType,
        uploadDate: file.uploadDate,
        metadata: file.metadata
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get paginated media metadata for an event gallery
// @route   GET /api/v1/media/event/:eventId
// @access  Admin or Authorized Guest
const getEventMedia = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const mediaType = req.query.type || 'PHOTO';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const db = mongoose.connection.db;
    const query = {
      'metadata.eventId': eventId,
      'metadata.mediaType': mediaType
    };

    const total = await db.collection('uploads.files').countDocuments(query);
    const files = await db
      .collection('uploads.files')
      .find(query)
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    res.status(200).json({
      success: true,
      count: files.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: files.map((file) => ({
        _id: file._id,
        filename: file.filename,
        length: file.length,
        uploadDate: file.uploadDate,
        contentType: file.contentType,
        metadata: file.metadata,
        streamUrl: `/api/v1/media/stream/${file._id}`
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stream media file binary directly from GridFS to response
// @route   GET /api/v1/media/stream/:fileId
// @access  Admin or Authorized Guest (or Public if using embed)
const streamMedia = async (req, res, next) => {
  try {
    const { fileId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: 'Invalid file ID.' });
    }

    const bucket = getGridFSBucket();
    const db = mongoose.connection.db;
    const objId = new mongoose.Types.ObjectId(fileId);

    const file = await db.collection('uploads.files').findOne({ _id: objId });
    if (!file) {
      return res.status(404).json({ error: 'Media file not found.' });
    }

    // Set streaming headers
    res.set('Content-Type', file.contentType || 'application/octet-stream');
    res.set('Content-Length', file.length);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');

    // Direct pipe to response (zero RAM buffer overhead)
    const downloadStream = bucket.openDownloadStream(objId);
    downloadStream.on('error', (err) => {
      console.error('GridFS streaming error:', err);
      res.status(500).end();
    });

    downloadStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete media file from GridFS and decrement stats
// @route   DELETE /api/v1/media/:fileId
// @access  Admin Only
const deleteMedia = async (req, res, next) => {
  try {
    const { fileId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: 'Invalid file ID.' });
    }

    const bucket = getGridFSBucket();
    const db = mongoose.connection.db;
    const objId = new mongoose.Types.ObjectId(fileId);

    const file = await db.collection('uploads.files').findOne({ _id: objId });
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    const { eventId, marriageId, mediaType } = file.metadata || {};

    // 1. Delete from GridFS
    await bucket.delete(objId);

    // 2. Decrement counters
    const statKey = mediaType === 'VIDEO' ? 'videoCount' : 'photoCount';
    const globalStatKey = mediaType === 'VIDEO' ? 'totalVideos' : 'totalPhotos';

    if (eventId) {
      await Event.findByIdAndUpdate(eventId, {
        $inc: { [`eventStats.${statKey}`]: -1 }
      });
    }

    if (marriageId) {
      await Marriage.findByIdAndUpdate(marriageId, {
        $inc: { [`globalStats.${globalStatKey}`]: -1 }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Media file successfully removed.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadMedia,
  getEventMedia,
  streamMedia,
  deleteMedia
};

