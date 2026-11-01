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
    }
  },
  {
    timestamps: true
  }
);

marriageSchema.index({ adminId: 1 });

module.exports = mongoose.model('Marriage', marriageSchema);

