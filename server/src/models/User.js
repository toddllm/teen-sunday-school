const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  age: {
    type: Number,
    min: 10,
    max: 100
  },
  profilePicture: {
    type: String,
    default: null
  },
  streak: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastActiveDate: {
      type: Date,
      default: null
    }
  },
  currentReadingPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReadingPlan',
    default: null
  },
  preferences: {
    dailyReminderTime: {
      type: String,
      default: '08:00'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    notificationsEnabled: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    totalDaysActive: {
      type: Number,
      default: 0
    },
    chaptersRead: {
      type: Number,
      default: 0
    },
    plansCompleted: {
      type: Number,
      default: 0
    },
    prayersLogged: {
      type: Number,
      default: 0
    },
    lastUsedFeature: {
      type: String,
      enum: ['reading', 'prayer', 'journal', 'games', 'lessons', null],
      default: null
    },
    featureUsage: {
      reading: { type: Number, default: 0 },
      prayer: { type: Number, default: 0 },
      journal: { type: Number, default: 0 },
      games: { type: Number, default: 0 },
      lessons: { type: Number, default: 0 }
    }
  },
  isAnonymous: {
    type: Boolean,
    default: false
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update streak method
userSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!this.streak.lastActiveDate) {
    // First time user is active
    this.streak.current = 1;
    this.streak.lastActiveDate = today;
    if (this.streak.current > this.streak.longest) {
      this.streak.longest = this.streak.current;
    }
    return;
  }

  const lastActive = new Date(this.streak.lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);

  const diffTime = today - lastActive;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Same day, no change
    return;
  } else if (diffDays === 1) {
    // Consecutive day, increment streak
    this.streak.current += 1;
    this.streak.lastActiveDate = today;
    if (this.streak.current > this.streak.longest) {
      this.streak.longest = this.streak.current;
    }
  } else {
    // Streak broken, reset to 1
    this.streak.current = 1;
    this.streak.lastActiveDate = today;
  }
};

// Log feature usage
userSchema.methods.logFeatureUsage = function(feature) {
  if (this.stats.featureUsage[feature] !== undefined) {
    this.stats.featureUsage[feature] += 1;
    this.stats.lastUsedFeature = feature;
  }
};

// Get priority feature (most used feature)
userSchema.methods.getPriorityFeature = function() {
  const usage = this.stats.featureUsage;
  const features = Object.keys(usage);

  if (features.length === 0) return 'reading';

  let maxFeature = features[0];
  let maxCount = usage[maxFeature];

  for (const feature of features) {
    if (usage[feature] > maxCount) {
      maxFeature = feature;
      maxCount = usage[feature];
    }
  }

  return maxFeature;
};

module.exports = mongoose.model('User', userSchema);
