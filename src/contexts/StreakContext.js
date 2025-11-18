import React, { createContext, useContext, useState, useEffect } from 'react';

const StreakContext = createContext();

// Activity types
export const ACTIVITY_TYPES = {
  READING_PLAN_COMPLETED: 'reading_plan_completed',
  CHAPTER_READ: 'chapter_read',
  PRAYER_LOGGED: 'prayer_logged',
  VERSE_MEMORIZED: 'verse_memorized',
  LESSON_COMPLETED: 'lesson_completed'
};

// Badge definitions
export const BADGES = [
  {
    id: 'first_step',
    name: 'First Steps',
    description: 'Complete your first activity',
    icon: '🌱',
    criteria: (stats) => stats.totalActivities >= 1
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    criteria: (stats) => stats.currentStreak >= 7
  },
  {
    id: 'faithful_fortnight',
    name: 'Faithful Fortnight',
    description: 'Maintain a 14-day streak',
    icon: '⭐',
    criteria: (stats) => stats.currentStreak >= 14
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: '🏆',
    criteria: (stats) => stats.currentStreak >= 30
  },
  {
    id: 'prayer_warrior',
    name: 'Prayer Warrior',
    description: 'Log 10 prayers',
    icon: '🙏',
    criteria: (stats) => stats.activityCounts.prayer_logged >= 10
  },
  {
    id: 'scripture_scholar',
    name: 'Scripture Scholar',
    description: 'Read 25 chapters',
    icon: '📖',
    criteria: (stats) => stats.activityCounts.chapter_read >= 25
  },
  {
    id: 'memory_master',
    name: 'Memory Master',
    description: 'Memorize 10 verses',
    icon: '🧠',
    criteria: (stats) => stats.activityCounts.verse_memorized >= 10
  },
  {
    id: 'dedicated_disciple',
    name: 'Dedicated Disciple',
    description: 'Complete 50 activities total',
    icon: '✨',
    criteria: (stats) => stats.totalActivities >= 50
  },
  {
    id: 'longest_streak_10',
    name: 'Consistency Champion',
    description: 'Achieve a 10-day streak (lifetime best)',
    icon: '🎯',
    criteria: (stats) => stats.longestStreak >= 10
  },
  {
    id: 'longest_streak_30',
    name: 'Habit Hero',
    description: 'Achieve a 30-day streak (lifetime best)',
    icon: '👑',
    criteria: (stats) => stats.longestStreak >= 30
  },
  {
    id: 'streak_saver',
    name: 'Streak Saver',
    description: 'Use your first grace day',
    icon: '🛡️',
    criteria: (stats) => stats.graceDaysUsed > 0
  },
  {
    id: 'wise_pauser',
    name: 'Wise Pauser',
    description: 'Use a freeze day for the first time',
    icon: '⏸️',
    criteria: (stats) => stats.freezeDaysUsed > 0
  },
  {
    id: 'protected_streak',
    name: 'Protected Streak',
    description: 'Maintain a 20-day streak with grace/freeze protection',
    icon: '🛡️',
    criteria: (stats) => stats.currentStreak >= 20 && (stats.graceDaysUsed > 0 || stats.freezeDaysUsed > 0)
  }
];

export const useStreak = () => {
  const context = useContext(StreakContext);
  if (!context) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
};

export const StreakProvider = ({ children }) => {
  const [activities, setActivities] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [lastActivityDate, setLastActivityDate] = useState(null);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [graceDaysAvailable, setGraceDaysAvailable] = useState(2); // Start with 2 grace days
  const [freezeDaysAvailable, setFreezeDaysAvailable] = useState(1); // Start with 1 freeze day
  const [graceDaysUsedHistory, setGraceDaysUsedHistory] = useState([]); // Array of {date, streakAtTime}
  const [freezeDaysUsedHistory, setFreezeDaysUsedHistory] = useState([]); // Array of {date, streakAtTime}
  const [activeFreezes, setActiveFreezes] = useState([]); // Array of dates with active freeze
  const [loading, setLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('streakData');
      if (savedData) {
        const data = JSON.parse(savedData);
        setActivities(data.activities || []);
        setCurrentStreak(data.currentStreak || 0);
        setLongestStreak(data.longestStreak || 0);
        setLastActivityDate(data.lastActivityDate || null);
        setEarnedBadges(data.earnedBadges || []);
        setGraceDaysAvailable(data.graceDaysAvailable !== undefined ? data.graceDaysAvailable : 2);
        setFreezeDaysAvailable(data.freezeDaysAvailable !== undefined ? data.freezeDaysAvailable : 1);
        setGraceDaysUsedHistory(data.graceDaysUsedHistory || []);
        setFreezeDaysUsedHistory(data.freezeDaysUsedHistory || []);
        setActiveFreezes(data.activeFreezes || []);
      }
    } catch (error) {
      console.error('Error loading streak data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      const data = {
        activities,
        currentStreak,
        longestStreak,
        lastActivityDate,
        earnedBadges,
        graceDaysAvailable,
        freezeDaysAvailable,
        graceDaysUsedHistory,
        freezeDaysUsedHistory,
        activeFreezes
      };
      localStorage.setItem('streakData', JSON.stringify(data));
    }
  }, [activities, currentStreak, longestStreak, lastActivityDate, earnedBadges, graceDaysAvailable, freezeDaysAvailable, graceDaysUsedHistory, freezeDaysUsedHistory, activeFreezes, loading]);

  // Helper: Get today's date in YYYY-MM-DD format (local timezone)
  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  };

  // Helper: Get yesterday's date
  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toLocaleDateString('en-CA');
  };

  // Helper: Check if user had activity on a specific date
  const hasActivityOnDate = (dateString) => {
    return activities.some(activity => activity.date === dateString);
  };

  // Log an activity
  const logActivity = (activityType) => {
    const today = getTodayDate();

    const newActivity = {
      date: today,
      activityType,
      timestamp: new Date().toISOString()
    };

    const updatedActivities = [...activities, newActivity];
    setActivities(updatedActivities);
    setLastActivityDate(today);

    // Recalculate streaks
    const newStreak = calculateStreakFromActivities(updatedActivities);
    setCurrentStreak(newStreak);

    if (newStreak > longestStreak) {
      setLongestStreak(newStreak);
    }

    // Check for new badges
    checkAndAwardBadges(updatedActivities, newStreak, Math.max(newStreak, longestStreak));

    // Check for grace/freeze day rewards
    checkAndAwardGraceFreezeDays(newStreak);
  };

  // Calculate streak from activities array
  const calculateStreakFromActivities = (activitiesArray, freezes = activeFreezes, graceHistory = graceDaysUsedHistory) => {
    if (activitiesArray.length === 0) return 0;

    const today = getTodayDate();
    const yesterday = getYesterdayDate();

    const uniqueDates = [...new Set(activitiesArray.map(a => a.date))].sort().reverse();
    const freezeDates = freezes.map(f => f.date || f);
    const graceDates = graceHistory.map(g => g.date || g);

    // Check if streak is still valid (today, yesterday, or protected by freeze)
    const hasActivityToday = uniqueDates.includes(today);
    const hasActivityYesterday = uniqueDates.includes(yesterday);
    const hasFreezeToday = freezeDates.includes(today);
    const hasFreezeYesterday = freezeDates.includes(yesterday);

    if (!hasActivityToday && !hasActivityYesterday && !hasFreezeToday && !hasFreezeYesterday) {
      return 0;
    }

    let streak = 0;
    let currentDate = new Date();

    // Start from today or yesterday
    if (!hasActivityToday && !hasFreezeToday) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Count backwards, allowing for grace and freeze days
    while (true) {
      const dateString = currentDate.toLocaleDateString('en-CA');
      const hasActivity = uniqueDates.includes(dateString);
      const hasFreezeDay = freezeDates.includes(dateString);
      const hasGraceDay = graceDates.includes(dateString);

      if (hasActivity || hasFreezeDay || hasGraceDay) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  // Get activity statistics
  const getStats = () => {
    const activityCounts = {};
    Object.values(ACTIVITY_TYPES).forEach(type => {
      activityCounts[type] = activities.filter(a => a.activityType === type).length;
    });

    return {
      totalActivities: activities.length,
      currentStreak,
      longestStreak,
      activityCounts,
      lastActivityDate,
      graceDaysAvailable,
      freezeDaysAvailable,
      graceDaysUsed: graceDaysUsedHistory.length,
      freezeDaysUsed: freezeDaysUsedHistory.length
    };
  };

  // Check and award badges
  const checkAndAwardBadges = (activitiesArray, current, longest) => {
    const stats = {
      totalActivities: activitiesArray.length,
      currentStreak: current,
      longestStreak: longest,
      activityCounts: {},
      lastActivityDate,
      graceDaysAvailable,
      freezeDaysAvailable,
      graceDaysUsed: graceDaysUsedHistory.length,
      freezeDaysUsed: freezeDaysUsedHistory.length
    };

    Object.values(ACTIVITY_TYPES).forEach(type => {
      stats.activityCounts[type] = activitiesArray.filter(a => a.activityType === type).length;
    });

    const newlyEarnedBadges = [];

    BADGES.forEach(badge => {
      const alreadyEarned = earnedBadges.some(b => b.badgeId === badge.id);
      if (!alreadyEarned && badge.criteria(stats)) {
        newlyEarnedBadges.push({
          badgeId: badge.id,
          awardedAt: new Date().toISOString()
        });
      }
    });

    if (newlyEarnedBadges.length > 0) {
      setEarnedBadges([...earnedBadges, ...newlyEarnedBadges]);
      return newlyEarnedBadges;
    }

    return [];
  };

  // Check and award grace/freeze days for milestones
  const checkAndAwardGraceFreezeDays = (current) => {
    const rewards = [];

    // Award grace days for streak milestones
    if (current === 7) {
      const result = earnGraceDays(1, 'Completed 7-day streak!');
      if (result.success) rewards.push(result.message);
    }
    if (current === 14) {
      const result = earnGraceDays(1, 'Completed 14-day streak!');
      if (result.success) rewards.push(result.message);
    }
    if (current === 30) {
      const graceResult = earnGraceDays(2, 'Completed 30-day streak!');
      const freezeResult = earnFreezeDays(1, 'Completed 30-day streak!');
      if (graceResult.success) rewards.push(graceResult.message);
      if (freezeResult.success) rewards.push(freezeResult.message);
    }
    if (current === 50) {
      const freezeResult = earnFreezeDays(1, 'Completed 50-day streak!');
      if (freezeResult.success) rewards.push(freezeResult.message);
    }
    if (current === 100) {
      const graceResult = earnGraceDays(2, 'Completed 100-day streak!');
      const freezeResult = earnFreezeDays(2, 'Completed 100-day streak!');
      if (graceResult.success) rewards.push(graceResult.message);
      if (freezeResult.success) rewards.push(freezeResult.message);
    }

    return rewards;
  };

  // Get all badges with earned status
  const getAllBadges = () => {
    return BADGES.map(badge => {
      const earned = earnedBadges.find(b => b.badgeId === badge.id);
      return {
        ...badge,
        earned: !!earned,
        awardedAt: earned?.awardedAt || null
      };
    });
  };

  // Get only earned badges
  const getEarnedBadges = () => {
    return earnedBadges.map(earned => {
      const badge = BADGES.find(b => b.id === earned.badgeId);
      return {
        ...badge,
        awardedAt: earned.awardedAt
      };
    });
  };

  // Check if streak is at risk (no activity today)
  const isStreakAtRisk = () => {
    const today = getTodayDate();
    return currentStreak > 0 && !hasActivityOnDate(today);
  };

  // Get encouraging message
  const getEncouragementMessage = () => {
    if (currentStreak === 0 && activities.length > 0) {
      return "Every journey begins with a single step. Start a new streak today!";
    }
    if (isStreakAtRisk()) {
      return `Don't break your ${currentStreak}-day streak! Take a moment for spiritual growth today.`;
    }
    if (currentStreak >= 30) {
      return `Amazing! ${currentStreak} days of consistency. You're building lasting habits!`;
    }
    if (currentStreak >= 14) {
      return `Fantastic! ${currentStreak} days strong. Keep up the great work!`;
    }
    if (currentStreak >= 7) {
      return `Great job! ${currentStreak} days in a row. You're on a roll!`;
    }
    if (currentStreak >= 3) {
      return `Nice! ${currentStreak} days of consistency. Every day counts!`;
    }
    if (currentStreak === 1) {
      return "Great start! Come back tomorrow to build your streak!";
    }
    return "Start your spiritual journey today!";
  };

  // Activate a freeze day for today
  const activateFreezeDay = () => {
    const today = getTodayDate();

    // Check if already frozen today
    if (activeFreezes.some(f => (f.date || f) === today)) {
      return { success: false, message: 'Today is already frozen!' };
    }

    // Check if user has freeze days available
    if (freezeDaysAvailable <= 0) {
      return { success: false, message: 'No freeze days available!' };
    }

    // Check if user has an active streak
    if (currentStreak === 0) {
      return { success: false, message: 'You need an active streak to use a freeze day!' };
    }

    // Activate freeze
    const newFreeze = { date: today, streakAtTime: currentStreak, activatedAt: new Date().toISOString() };
    const updatedFreezes = [...activeFreezes, newFreeze];
    const updatedHistory = [...freezeDaysUsedHistory, newFreeze];

    setActiveFreezes(updatedFreezes);
    setFreezeDaysUsedHistory(updatedHistory);
    setFreezeDaysAvailable(freezeDaysAvailable - 1);

    // Recalculate streak with the new freeze
    const newStreak = calculateStreakFromActivities(activities, updatedFreezes, graceDaysUsedHistory);
    setCurrentStreak(newStreak);

    return { success: true, message: `Freeze day activated! Your ${currentStreak}-day streak is protected.` };
  };

  // Auto-consume grace day if needed (called during streak calculation checks)
  const tryUseGraceDay = (dateString) => {
    // Check if grace day already used for this date
    if (graceDaysUsedHistory.some(g => (g.date || g) === dateString)) {
      return false;
    }

    // Check if user has grace days available
    if (graceDaysAvailable <= 0) {
      return false;
    }

    // Use grace day
    const newGrace = { date: dateString, streakAtTime: currentStreak, usedAt: new Date().toISOString() };
    const updatedHistory = [...graceDaysUsedHistory, newGrace];

    setGraceDaysUsedHistory(updatedHistory);
    setGraceDaysAvailable(graceDaysAvailable - 1);

    return true;
  };

  // Check if today is protected (has activity, freeze, or can use grace)
  const checkStreakProtection = () => {
    const today = getTodayDate();
    const hasActivity = hasActivityOnDate(today);
    const hasFreezeToday = activeFreezes.some(f => (f.date || f) === today);
    const hasGraceToday = graceDaysUsedHistory.some(g => (g.date || g) === today);

    return {
      hasActivity,
      hasFreezeToday,
      hasGraceToday,
      isProtected: hasActivity || hasFreezeToday || hasGraceToday,
      canUseGrace: !hasActivity && !hasFreezeToday && !hasGraceToday && graceDaysAvailable > 0,
      canUseFreeze: !hasActivity && !hasFreezeToday && freezeDaysAvailable > 0
    };
  };

  // Earn grace days (e.g., from completing milestones)
  const earnGraceDays = (count = 1, reason = '') => {
    const maxGraceDays = 5; // Maximum stockpile
    const newTotal = Math.min(graceDaysAvailable + count, maxGraceDays);
    const actualEarned = newTotal - graceDaysAvailable;

    if (actualEarned > 0) {
      setGraceDaysAvailable(newTotal);
      return { success: true, earned: actualEarned, message: `Earned ${actualEarned} grace day(s)! ${reason}` };
    }

    return { success: false, earned: 0, message: 'Grace days already at maximum!' };
  };

  // Earn freeze days (e.g., from completing milestones)
  const earnFreezeDays = (count = 1, reason = '') => {
    const maxFreezeDays = 3; // Maximum stockpile
    const newTotal = Math.min(freezeDaysAvailable + count, maxFreezeDays);
    const actualEarned = newTotal - freezeDaysAvailable;

    if (actualEarned > 0) {
      setFreezeDaysAvailable(newTotal);
      return { success: true, earned: actualEarned, message: `Earned ${actualEarned} freeze day(s)! ${reason}` };
    }

    return { success: false, earned: 0, message: 'Freeze days already at maximum!' };
  };

  // Get grace/freeze stats
  const getGraceFreezStats = () => {
    return {
      graceDaysAvailable,
      freezeDaysAvailable,
      graceDaysUsed: graceDaysUsedHistory.length,
      freezeDaysUsed: freezeDaysUsedHistory.length,
      graceDaysUsedHistory,
      freezeDaysUsedHistory,
      activeFreezes
    };
  };

  const value = {
    activities,
    currentStreak,
    longestStreak,
    lastActivityDate,
    loading,
    logActivity,
    getStats,
    getAllBadges,
    getEarnedBadges,
    isStreakAtRisk,
    getEncouragementMessage,
    hasActivityToday: () => hasActivityOnDate(getTodayDate()),
    // Grace and Freeze day functions
    graceDaysAvailable,
    freezeDaysAvailable,
    activateFreezeDay,
    tryUseGraceDay,
    checkStreakProtection,
    earnGraceDays,
    earnFreezeDays,
    getGraceFreezStats
  };

  return (
    <StreakContext.Provider value={value}>
      {children}
    </StreakContext.Provider>
  );
};
