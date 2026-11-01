const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    passwordHash: {
      type: String,
      required: function () {
        return this.role === 'ADMIN';
      }
    },
    role: {
      type: String,
      enum: ['ADMIN', 'GUEST'],
      default: 'GUEST'
    },
    assignedMarriageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Marriage',
      default: null
    }
  },
  {
    timestamps: true
  }
);

userSchema.index({ assignedMarriageId: 1 });

module.exports = mongoose.model('User', userSchema);

