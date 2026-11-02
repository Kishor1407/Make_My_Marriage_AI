const mongoose = require('mongoose');
const { Event } = require('../models/Event');
const Marriage = require('../models/Marriage');

// @desc    Get all 6 events for a marriage
// @route   GET /api/v1/marriages/:marriageId/events
// @access  Admin or Authorized Guest
const getEventsForMarriage = async (req, res, next) => {
  try {
    const { marriageId } = req.params;
    let targetMarriageId = marriageId;

    if (!mongoose.Types.ObjectId.isValid(marriageId)) {
      const m = await Marriage.findOne({ marriageCode: marriageId.toUpperCase() });
      if (!m) {
        return res.status(404).json({ error: 'Marriage not found.' });
      }
      targetMarriageId = m._id;
    }

    // Verify guest access restriction if signed in as guest
    if (req.user && req.user.role === 'GUEST' && req.user.assignedMarriageId !== targetMarriageId.toString()) {
      return res.status(403).json({
        error: 'You do not have permission to access events for this marriage.'
      });
    }

    const events = await Event.find({ marriageId: targetMarriageId });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Event details (venue, date, time, liveStreamUrl, streamStatus)
// @route   PUT /api/v1/events/:eventId
// @access  Admin Only
const updateEventDetails = async (req, res, next) => {
  try {
    const { eventDate, eventTime, venueAddress, liveStreamUrl, customTitle, streamStatus, viewerCount } = req.body;

    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // Verify Admin owns the parent marriage
    const marriage = await Marriage.findById(event.marriageId);
    if (!marriage || marriage.adminId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this event.' });
    }

    // Update allowed fields
    if (eventDate !== undefined) event.eventDate = eventDate;
    if (eventTime !== undefined) event.eventTime = eventTime;
    if (venueAddress !== undefined) event.venueAddress = venueAddress;
    if (liveStreamUrl !== undefined) event.liveStreamUrl = liveStreamUrl;
    if (customTitle !== undefined) event.customTitle = customTitle;
    if (streamStatus !== undefined) event.streamStatus = streamStatus.toUpperCase();
    if (viewerCount !== undefined) event.viewerCount = viewerCount;

    const updatedEvent = await event.save();

    res.status(200).json({
      success: true,
      data: updatedEvent
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Stream configuration for an event rite by marriage code & rite (PRD 4.6)
// @route   PUT /api/v1/events/config/stream
// @access  Admin Only
const updateStreamConfig = async (req, res, next) => {
  try {
    const {
      marriageCode,
      ceremony,
      eventType,
      liveStreamUrl,
      streamStatus = 'LIVE',
      customTitle,
      venueAddress,
      eventTime
    } = req.body;

    const code = (marriageCode || '').trim().toUpperCase();
    const riteType = (eventType || ceremony || 'HALDI').trim().toUpperCase();

    const marriage = await Marriage.findOne({ marriageCode: code });
    if (!marriage) {
      return res.status(404).json({ error: 'Marriage vault not found.' });
    }

    // Verify Admin ownership
    if (marriage.adminId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to configure stream for this marriage.' });
    }

    let event = await Event.findOne({ marriageId: marriage._id, eventType: riteType });
    if (!event) {
      event = await Event.create({
        marriageId: marriage._id,
        eventType: riteType,
        customTitle: customTitle || riteType,
        liveStreamUrl: liveStreamUrl || null,
        streamStatus: streamStatus.toUpperCase()
      });
    } else {
      if (liveStreamUrl !== undefined) event.liveStreamUrl = liveStreamUrl;
      if (streamStatus !== undefined) event.streamStatus = streamStatus.toUpperCase();
      if (customTitle !== undefined) event.customTitle = customTitle;
      if (venueAddress !== undefined) event.venueAddress = venueAddress;
      if (eventTime !== undefined) event.eventTime = eventTime;
      await event.save();
    }

    res.status(200).json({
      success: true,
      message: `Live stream configuration for ${riteType} updated successfully!`,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEventsForMarriage,
  updateEventDetails,
  updateStreamConfig
};

