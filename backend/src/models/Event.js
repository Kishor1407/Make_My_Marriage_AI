const mongoose = require('mongoose');

const EVENT_TYPES = ['ENGAGEMENT', 'MEHNDI', 'HALDI', 'SANGEET', 'MARRIAGE', 'OTHERS'];

const eventSchema = new mongoose.Schema(
  {
    marriageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Marriage',
      required: true
    },
    eventType: {
      type: String,
      enum: EVENT_TYPES,
      required: true
    },
    customTitle: {
      type: String,
      default: null,
      trim: true
    },
    eventDate: {
      type: Date,
      default: null
    },
    eventTime: {
      type: String,
      default: null,
      trim: true
    },
    venueAddress: {
      type: String,
      default: null,
      trim: true
    },
    liveStreamUrl: {
      type: String,
      default: null,
      trim: true
    },
    eventStats: {
      photoCount: {
        type: Number,
        default: 0
      },
      videoCount: {
        type: Number,
        default: 0
      }
    }
  },
  {
    timestamps: true
  }
);

eventSchema.index({ marriageId: 1, eventType: 1 }, { unique: true });

module.exports = {
  Event: mongoose.model('Event', eventSchema),
  EVENT_TYPES
};

