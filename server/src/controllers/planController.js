const ReadingPlan = require('../models/ReadingPlan');
const UserProgress = require('../models/UserProgress');
const User = require('../models/User');

// @desc    Get all reading plans
// @route   GET /api/plans
// @access  Public
exports.getPlans = async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;

    let query = { isPublic: true };

    if (category) {
      query.category = category;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const plans = await ReadingPlan.find(query)
      .select('-days')
      .sort('-enrollmentCount');

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single reading plan
// @route   GET /api/plans/:id
// @access  Public
exports.getPlan = async (req, res) => {
  try {
    const plan = await ReadingPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Reading plan not found'
      });
    }

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Enroll in reading plan
// @route   POST /api/plans/:id/enroll
// @access  Private
exports.enrollPlan = async (req, res) => {
  try {
    const plan = await ReadingPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Reading plan not found'
      });
    }

    // Check if user is already enrolled
    const existingProgress = await UserProgress.findOne({
      user: req.user._id,
      readingPlan: plan._id
    });

    if (existingProgress) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this plan'
      });
    }

    // Deactivate other active plans
    await UserProgress.updateMany(
      { user: req.user._id, isActive: true },
      { isActive: false }
    );

    // Create new progress
    const progress = await UserProgress.create({
      user: req.user._id,
      readingPlan: plan._id,
      currentDay: 1,
      isActive: true
    });

    // Update user's current plan
    await User.findByIdAndUpdate(req.user._id, {
      currentReadingPlan: plan._id
    });

    // Increment enrollment count
    plan.enrollmentCount += 1;
    await plan.save();

    res.status(201).json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Complete a day's reading
// @route   POST /api/plans/:id/complete-day
// @access  Private
exports.completeDay = async (req, res) => {
  try {
    const { dayNumber, notes } = req.body;

    const progress = await UserProgress.findOne({
      user: req.user._id,
      readingPlan: req.params.id,
      isActive: true
    }).populate('readingPlan');

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Not enrolled in this plan'
      });
    }

    // Mark day as complete
    progress.completeDay(dayNumber, notes);

    // Update current day
    if (dayNumber === progress.currentDay) {
      progress.currentDay = Math.min(
        progress.currentDay + 1,
        progress.readingPlan.duration
      );
    }

    // Calculate progress
    progress.calculateProgress(progress.readingPlan.duration);

    // Check if plan is completed
    if (progress.completedDays.length >= progress.readingPlan.duration) {
      progress.completedAt = new Date();
      progress.isActive = false;

      // Update user stats
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'stats.plansCompleted': 1 },
        currentReadingPlan: null
      });

      // Increment plan completion count
      await ReadingPlan.findByIdAndUpdate(req.params.id, {
        $inc: { completionCount: 1 }
      });
    }

    // Update user stats
    const user = await User.findById(req.user._id);
    user.stats.chaptersRead += 1;
    user.logFeatureUsage('reading');
    user.updateStreak();
    await user.save();

    await progress.save();

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's reading progress
// @route   GET /api/plans/:id/progress
// @access  Private
exports.getProgress = async (req, res) => {
  try {
    const progress = await UserProgress.findOne({
      user: req.user._id,
      readingPlan: req.params.id
    }).populate('readingPlan');

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Not enrolled in this plan'
      });
    }

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all user's plans (current and past)
// @route   GET /api/me/plans
// @access  Private
exports.getUserPlans = async (req, res) => {
  try {
    const plans = await UserProgress.find({ user: req.user._id })
      .populate('readingPlan')
      .sort('-startedAt');

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
