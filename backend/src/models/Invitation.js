const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema(
  {
    marriageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Marriage',
      required: true
    },
    marriageCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    ceremony: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    templateStyle: {
      type: String,
      enum: ['mandap', 'botanical', 'sunset'],
      default: 'mandap'
    },
    cardRatio: {
      type: String,
      enum: ['4:5', '9:16'],
      default: '4:5'
    },
    coupleNames: {
      type: String,
      required: true,
      trim: true
    },
    riteTitle: {
      type: String,
      required: true,
      trim: true
    },
    invocation: {
      type: String,
      default: '॥ श्री गणेशाय नमः ॥ • || Shubham Bhavatu ||',
      trim: true
    },
    dateTime: {
      type: String,
      required: true,
      trim: true
    },
    venue: {
      type: String,
      required: true,
      trim: true
    },
    blessing: {
      type: String,
      default: 'With the unconditional blessings of elders & boundless joy in our hearts, we request your presence.',
      trim: true
    },
    rsvp: {
      type: String,
      default: 'Sharma & Mehta Families • +91 98765 43210',
      trim: true
    },
    includeQr: {
      type: Boolean,
      default: true
    },
    cardImageUrl: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

invitationSchema.index({ marriageId: 1, ceremony: 1 }, { unique: true });

module.exports = mongoose.model('Invitation', invitationSchema);

