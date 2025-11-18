const mongoose = require('mongoose');

const readingPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a plan name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  duration: {
    type: Number,
    required: [true, 'Please provide duration in days']
  },
  category: {
    type: String,
    enum: ['gospels', 'epistles', 'old-testament', 'wisdom', 'prophets', 'custom'],
    default: 'custom'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  days: [{
    dayNumber: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    readings: [{
      reference: {
        type: String,
        required: true
      },
      book: String,
      chapter: Number,
      verses: String
    }],
    reflection: {
      type: String,
      default: ''
    },
    questions: [{
      type: String
    }]
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  completionCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for searching plans
readingPlanSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('ReadingPlan', readingPlanSchema);
