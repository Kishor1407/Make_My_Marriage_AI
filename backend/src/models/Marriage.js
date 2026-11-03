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
      default: 'The Leela Palace Seaside, South Goa'
    },
    dates: {
      type: String,
      default: 'December 14–16, 2026'
    },
    status: {
      type: String,
      default: 'Live Realtime'
    },
    coverImage: {
      type: String,
      default: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwZlcHb_KVUMvBiZhacxOUxbjv9rYLP52FrP0hNeO5AuTcxEUpEnjINTU_47yEacFb_9IlmAslUSaFNBYVtJ3uTPDgVQRMVRh-nJlO3WnRTF9ebW2trgiHhtykoYA8O7bM5PNbzgeS8HBzOwYuFSXJmuaYXjz8rUBRBjcBXe58Yor5miYy_VkclG4OdFRA2SoWL4_6DHNwLl5-z6ziJgt7_w_0DU7nns2FViIwomk'
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
