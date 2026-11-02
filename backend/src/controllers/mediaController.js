const mongoose = require('mongoose');
const { Event } = require('../models/Event');
const Marriage = require('../models/Marriage');
const { getGridFSBucket } = require('../config/db');

// Helper to pipe in-memory buffer directly into GridFS
const uploadBufferToGridFS = (bucket, file, metadata) => {
  return new Promise((resolve, reject) => {
    const filename = `${Date.now()}-${file.originalname || 'photo.webp'}`;
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: file.mimetype || 'image/jpeg',
      metadata
    });

    uploadStream.on('error', (err) => reject(err));
    uploadStream.on('finish', (saved) => {
      resolve(saved || {
        _id: uploadStream.id,
        id: uploadStream.id,
        filename,
        contentType: file.mimetype || 'image/jpeg',
        uploadDate: new Date(),
        metadata
      });
    });

    uploadStream.end(file.buffer);
  });
};

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

    const bucket = getGridFSBucket();
    const savedFiles = [];

    for (const file of req.files) {
      const metadata = {
        marriageId: event.marriageId.toString(),
        eventId: event._id.toString(),
        mediaType,
        uploaderName: req.user ? req.user.name : (req.body.uploaderName || 'Host Concierge'),
        uploaderEmail: req.user ? req.user.email : (req.body.uploaderEmail || 'host@makemymarriage.com'),
        uploadDate: new Date()
      };

      const saved = await uploadBufferToGridFS(bucket, file, metadata);
      savedFiles.push(saved);
    }

    const uploadCount = savedFiles.length;
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
      files: savedFiles.map((file) => ({
        id: file._id.toString(),
        filename: file.filename,
        contentType: file.contentType,
        uploadDate: file.uploadDate,
        metadata: file.metadata,
        streamUrl: `/api/v1/media/stream/${file._id.toString()}`
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

// @desc    Guest QR Photo Dump upload with Name & Email attribution (PRD 4.4)
// @route   POST /api/v1/media/guest-upload  AND  POST /api/v1/photos/upload
// @access  Public (Guest Standee QR Flow)
const guestUploadMedia = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Please attach at least one photo to upload.' });
    }

    const { passcode, marriageCode, ceremony, uploaderName, uploader, uploaderEmail } = req.body;
    const code = (passcode || marriageCode || 'RAHUL24').trim().toUpperCase();
    const guestAuthor = (uploaderName || uploader || 'Wedding Guest').trim();
    const guestMail = (uploaderEmail || 'guest@wedding.local').trim();
    const ceremonyKey = (ceremony || 'HALDI').trim().toUpperCase();

    // Find Marriage by passcode
    let marriage = await Marriage.findOne({ marriageCode: code });
    if (!marriage && mongoose.Types.ObjectId.isValid(code)) {
      marriage = await Marriage.findById(code);
    }

    const uploadCount = req.files.length;
    const db = mongoose.connection.db;

    let eventId = null;
    let marriageId = marriage ? marriage._id.toString() : null;

    if (marriage) {
      // Find or create Event for this ceremony
      let event = await Event.findOne({ marriageId: marriage._id, eventType: ceremonyKey });
      if (!event) {
        try {
          event = await Event.create({
            marriageId: marriage._id,
            eventType: ceremonyKey,
            eventStats: { photoCount: 0, videoCount: 0 }
          });
        } catch {
          event = await Event.findOne({ marriageId: marriage._id, eventType: ceremonyKey });
        }
      }

      if (event) {
        eventId = event._id.toString();
        // Increment event photo count
        await Event.findByIdAndUpdate(event._id, {
          $inc: { 'eventStats.photoCount': uploadCount }
        });
      }

      // Increment marriage total photos & guests engaged
      await Marriage.findByIdAndUpdate(marriage._id, {
        $inc: { 'globalStats.totalPhotos': uploadCount, 'globalStats.totalGuestsEngaged': 1 }
      });
    }

    const bucket = getGridFSBucket();
    const savedFiles = [];

    // Save each file buffer directly into GridFS with guest attribution metadata
    for (const file of req.files) {
      const metadata = {
        marriageId,
        marriageCode: code,
        eventId,
        ceremony: ceremonyKey,
        uploaderName: guestAuthor,
        uploaderEmail: guestMail,
        mediaType: 'PHOTO',
        uploadDate: new Date()
      };

      const saved = await uploadBufferToGridFS(bucket, file, metadata);
      savedFiles.push(saved);
    }

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${savedFiles.length} memory(s) attributed to ${guestAuthor}!`,
      count: savedFiles.length,
      files: savedFiles.map((file) => ({
        id: (file._id || file.id).toString(),
        filename: file.filename,
        uploaderName: guestAuthor,
        uploaderEmail: guestMail,
        ceremony: ceremonyKey,
        streamUrl: `/api/v1/media/stream/${(file._id || file.id).toString()}`
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all photos uploaded for a marriage gallery (with attribution badges)
// @route   GET /api/v1/media/gallery/:marriageCode
// @access  Public / Guest
const getMarriageGallery = async (req, res, next) => {
  try {
    const { marriageCode } = req.params;
    const { ceremony, limit = 60 } = req.query;

    let marriage = null;
    if (mongoose.Types.ObjectId.isValid(marriageCode)) {
      marriage = await Marriage.findById(marriageCode);
    }
    if (!marriage) {
      marriage = await Marriage.findOne({ marriageCode: marriageCode.toUpperCase() });
    }

    const db = mongoose.connection.db;
    const query = {};

    if (req.query.mediaType && req.query.mediaType.toUpperCase() !== 'ALL') {
      query['metadata.mediaType'] = req.query.mediaType.toUpperCase();
    } else {
      query['metadata.mediaType'] = { $in: ['PHOTO', 'VIDEO'] };
    }

    if (marriage) {
      query.$or = [
        { 'metadata.marriageCode': marriage.marriageCode },
        { 'metadata.marriageId': marriage._id.toString() }
      ];
    } else {
      query['metadata.marriageCode'] = marriageCode.toUpperCase();
    }

    if (ceremony && ceremony.toUpperCase() !== 'ALL') {
      query['metadata.ceremony'] = ceremony.toUpperCase();
    }

    const files = await db
      .collection('uploads.files')
      .find(query)
      .sort({ uploadDate: -1, _id: -1 })
      .limit(Number(limit))
      .toArray();

    res.status(200).json({
      success: true,
      count: files.length,
      marriage: marriage ? {
        id: marriage._id,
        partnerOneName: marriage.partnerOneName,
        partnerTwoName: marriage.partnerTwoName,
        code: marriage.marriageCode,
        qrCodeUrl: marriage.qrCodeUrl,
        venue: marriage.venue,
        dates: marriage.dates,
        status: marriage.status,
        totalPhotos: marriage.globalStats?.totalPhotos || files.filter(f => f.metadata?.mediaType === 'PHOTO').length,
        totalVideos: marriage.globalStats?.totalVideos || files.filter(f => f.metadata?.mediaType === 'VIDEO').length
      } : null,
      photos: files.map((f) => ({
        id: f._id.toString(),
        filename: f.filename,
        uploadDate: f.uploadDate || f.metadata?.uploadDate,
        uploaderName: f.metadata?.uploaderName || 'Wedding Guest',
        uploaderEmail: f.metadata?.uploaderEmail || 'guest@wedding.local',
        ceremony: f.metadata?.ceremony || 'HALDI',
        mediaType: f.metadata?.mediaType || 'PHOTO',
        contentType: f.contentType || (f.metadata?.mediaType === 'VIDEO' ? 'video/mp4' : 'image/png'),
        streamUrl: `/api/v1/media/stream/${f._id.toString()}`
      }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadMedia,
  guestUploadMedia,
  getEventMedia,
  getMarriageGallery,
  streamMedia,
  deleteMedia
};

