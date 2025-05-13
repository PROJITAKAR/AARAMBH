const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'job',
    required: true
  },
  title:
  {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'application',
    required: false // make it optional
  },
  type: {
    type: String,
    enum: ['Job Alert', 'Application Reviewed', 'Application Accepted', 'Application Rejected','New Application'],
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('notification', notificationSchema);
