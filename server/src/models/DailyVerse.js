const mongoose = require('mongoose');

const dailyVerseSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  reference: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  reflection: {
    type: String,
    default: ''
  },
  theme: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for quick date lookup
dailyVerseSchema.index({ date: 1 });

module.exports = mongoose.model('DailyVerse', dailyVerseSchema);
