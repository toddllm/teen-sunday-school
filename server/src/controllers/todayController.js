const User = require('../models/User');
const ReadingPlan = require('../models/ReadingPlan');
const UserProgress = require('../models/UserProgress');
const DailyVerse = require('../models/DailyVerse');

// @desc    Get today screen data
// @route   GET /api/me/today-screen
// @access  Private
exports.getTodayScreen = async (req, res) => {
  try {
    const userId = req.user._id;

    // Update user streak
    req.user.updateStreak();
    await req.user.save();

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get verse of the day
    const verseOfDay = await DailyVerse.findOne({ date: today });

    // Get current reading plan progress
    let currentPlan = null;
    let planProgress = null;
    let todayAssignment = null;

    if (req.user.currentReadingPlan) {
      const progress = await UserProgress.findOne({
        user: userId,
        readingPlan: req.user.currentReadingPlan,
        isActive: true
      }).populate('readingPlan');

      if (progress) {
        planProgress = progress;
        currentPlan = progress.readingPlan;

        // Get today's assignment
        if (currentPlan && currentPlan.days) {
          const todayDay = currentPlan.days.find(
            day => day.dayNumber === progress.currentDay
          );
          if (todayDay) {
            todayAssignment = todayDay;
          }
        }
      }
    }

    // Determine primary CTA based on user behavior
    const priorityFeature = req.user.getPriorityFeature();
    const todayCompleted = planProgress ? planProgress.isTodayCompleted() : false;

    let primaryCTA = {
      type: 'reading',
      text: 'Start Reading Plan',
      action: '/plans'
    };

    if (currentPlan && !todayCompleted && todayAssignment) {
      primaryCTA = {
        type: 'reading',
        text: `Continue ${todayAssignment.title}`,
        action: `/reading/${currentPlan._id}`,
        progress: planProgress.percentComplete
      };
    } else if (todayCompleted) {
      // Today's reading is done, suggest next action based on priority
      if (priorityFeature === 'prayer') {
        primaryCTA = {
          type: 'prayer',
          text: 'Add to Prayer List',
          action: '/prayer'
        };
      } else if (priorityFeature === 'journal') {
        primaryCTA = {
          type: 'journal',
          text: 'Write Journal Entry',
          action: '/journal'
        };
      } else {
        primaryCTA = {
          type: 'explore',
          text: 'Explore More Plans',
          action: '/plans'
        };
      }
    }

    // Get greeting based on time of day
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';

    // Build response
    const todayScreen = {
      header: {
        greeting: `${greeting}, ${req.user.name}`,
        date: today.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        streak: req.user.streak
      },
      dailyVerse: verseOfDay ? {
        reference: verseOfDay.reference,
        text: verseOfDay.text,
        reflection: verseOfDay.reflection,
        theme: verseOfDay.theme
      } : null,
      myPlan: currentPlan ? {
        planId: currentPlan._id,
        name: currentPlan.name,
        todayTitle: todayAssignment ? todayAssignment.title : null,
        todayReadings: todayAssignment ? todayAssignment.readings : [],
        currentDay: planProgress.currentDay,
        totalDays: currentPlan.duration,
        progress: planProgress.percentComplete,
        completedToday: todayCompleted
      } : null,
      primaryCTA,
      quickActions: [
        {
          icon: 'prayer',
          label: 'Prayer List',
          action: '/prayer',
          count: req.user.stats.prayersLogged
        },
        {
          icon: 'journal',
          label: 'Journal',
          action: '/journal',
          count: 0
        },
        {
          icon: 'explore',
          label: 'Explore Plans',
          action: '/plans',
          count: req.user.stats.plansCompleted
        },
        {
          icon: 'lessons',
          label: 'Lessons',
          action: '/lessons',
          count: 0
        }
      ],
      stats: {
        totalDaysActive: req.user.stats.totalDaysActive,
        chaptersRead: req.user.stats.chaptersRead,
        plansCompleted: req.user.stats.plansCompleted
      }
    };

    res.status(200).json({
      success: true,
      data: todayScreen
    });
  } catch (error) {
    console.error('Error in getTodayScreen:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get verse of the day
// @route   GET /api/verse-of-the-day
// @access  Public
exports.getVerseOfDay = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let verse = await DailyVerse.findOne({ date: today });

    // If no verse exists for today, create a default one
    if (!verse) {
      // Default verses rotation
      const defaultVerses = [
        {
          reference: 'John 3:16',
          text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
          theme: 'Love'
        },
        {
          reference: 'Philippians 4:13',
          text: 'I can do all this through him who gives me strength.',
          theme: 'Strength'
        },
        {
          reference: 'Jeremiah 29:11',
          text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
          theme: 'Hope'
        },
        {
          reference: 'Proverbs 3:5-6',
          text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
          theme: 'Trust'
        },
        {
          reference: 'Romans 8:28',
          text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
          theme: 'Purpose'
        }
      ];

      const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
      const selectedVerse = defaultVerses[dayOfYear % defaultVerses.length];

      verse = await DailyVerse.create({
        date: today,
        ...selectedVerse
      });
    }

    res.status(200).json({
      success: true,
      data: verse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current reading plan
// @route   GET /api/me/current-plan
// @access  Private
exports.getCurrentPlan = async (req, res) => {
  try {
    if (!req.user.currentReadingPlan) {
      return res.status(200).json({
        success: true,
        data: null
      });
    }

    const progress = await UserProgress.findOne({
      user: req.user._id,
      readingPlan: req.user.currentReadingPlan,
      isActive: true
    }).populate('readingPlan');

    if (!progress) {
      return res.status(200).json({
        success: true,
        data: null
      });
    }

    res.status(200).json({
      success: true,
      data: {
        plan: progress.readingPlan,
        progress: {
          currentDay: progress.currentDay,
          completedDays: progress.completedDays,
          percentComplete: progress.percentComplete,
          startedAt: progress.startedAt,
          lastReadAt: progress.lastReadAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
