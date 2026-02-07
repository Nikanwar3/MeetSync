const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  meetingId: {
    type: String,
    required: true,
    unique: true
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  passcode: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  scheduledFor: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Meeting', meetingSchema);
