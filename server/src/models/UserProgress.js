const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readingPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReadingPlan',
    required: true
  },
  currentDay: {
    type: Number,
    default: 1
  },
  completedDays: [{
    dayNumber: {
      type: Number,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      default: ''
    }
  }],
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastReadAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  percentComplete: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to ensure one active plan per user
userProgressSchema.index({ user: 1, readingPlan: 1 }, { unique: true });

// Calculate completion percentage
userProgressSchema.methods.calculateProgress = function(totalDays) {
  this.percentComplete = Math.round((this.completedDays.length / totalDays) * 100);
};

// Mark day as complete
userProgressSchema.methods.completeDay = function(dayNumber, notes = '') {
  const alreadyCompleted = this.completedDays.some(
    day => day.dayNumber === dayNumber
  );

  if (!alreadyCompleted) {
    this.completedDays.push({
      dayNumber,
      completedAt: new Date(),
      notes
    });
    this.lastReadAt = new Date();
  }
};

// Check if today's reading is completed
userProgressSchema.methods.isTodayCompleted = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return this.completedDays.some(day => {
    const completedDate = new Date(day.completedAt);
    completedDate.setHours(0, 0, 0, 0);
    return completedDate.getTime() === today.getTime();
  });
};

module.exports = mongoose.model('UserProgress', userProgressSchema);
