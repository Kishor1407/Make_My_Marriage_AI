const mongoose = require('mongoose');

const marriageSchema = new mongoose.Schema(
  {
    partnerOneName: {
      type: String,
      required: [true, 'Partner one name is required'],
      trim: true
    },
    partnerTwoName: {
      type: String,
      required: [true, 'Partner two name is required'],
      trim: true
    },
    marriageCode: {
      type: String,
      required: [true, 'Marriage passcode is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    qrCodeUrl: {
      type: String,
      required: true
    },
    venue: {
      type: String,
      default: ''
    },
    dates: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: 'Scheduled'
    },
    coverImage: {
      type: String,
      default: ''
    },
    globalStats: {
      totalPhotos: {
        type: Number,
        default: 0
      },
      totalVideos: {
        type: Number,
        default: 0
      },
      totalGuestsEngaged: {
        type: Number,
        default: 0
      }
    },
    blessings: {
      magic: { type: Number, default: 382 },
      prem: { type: Number, default: 419 },
      rose: { type: Number, default: 294 },
      cheers: { type: Number, default: 198 },
      aashirwaad: { type: Number, default: 136 },
      totalSent: { type: Number, default: 1429 }
    },
    liveStream: {
      rtmpUrl: { type: String, default: 'rtmp://stream.makemymarriage.com/live' },
      streamKey: { type: String, default: 'stream_key_ultra_4k' },
      isActive: { type: Boolean, default: true },
      viewerCount: { type: Number, default: 842 },
      activeCeremony: { type: String, default: 'Haldi & Sangeet Ceremonies' }
    }
  },
  {
    timestamps: true
  }
);

marriageSchema.index({ adminId: 1 });

module.exports = mongoose.model('Marriage', marriageSchema);
