const mongoose = require('mongoose');

const clickEventSchema = new mongoose.Schema({
  linkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link',
    required: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  referer: {
    type: String,
    trim: true
  },
  fbp: {
    type: String,
    trim: true
  },
  fbc: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metaCapiSent: {
    type: Boolean,
    default: false
  },
  metaCapiResponse: {
    type: mongoose.Schema.Types.Mixed
  }
});

module.exports = mongoose.model('ClickEvent', clickEventSchema);