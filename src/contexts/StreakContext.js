import React, { createContext, useContext, useState, useEffect } from 'react';

const StreakContext = createContext();

// Activity types
export const ACTIVITY_TYPES = {
  READING_PLAN_COMPLETED: 'reading_plan_completed',
  CHAPTER_READ: 'chapter_read',
  PRAYER_LOGGED: 'prayer_logged',
  VERSE_MEMORIZED: 'verse_memorized',
  LESSON_COMPLETED: 'lesson_completed',
  VERSE_OF_DAY_VIEWED: 'verse_of_day_viewed'
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
        earnedBadges
      };
      localStorage.setItem('streakData', JSON.stringify(data));
    }
  }, [activities, currentStreak, longestStreak, lastActivityDate, earnedBadges, loading]);

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
  };

  // Calculate streak from activities array
  const calculateStreakFromActivities = (activitiesArray) => {
    if (activitiesArray.length === 0) return 0;

    const today = getTodayDate();
    const yesterday = getYesterdayDate();

    const uniqueDates = [...new Set(activitiesArray.map(a => a.date))].sort().reverse();

    if (!uniqueDates.includes(today) && !uniqueDates.includes(yesterday)) {
      return 0;
    }

    let streak = 0;
    let currentDate = new Date();

    if (!uniqueDates.includes(today)) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    while (true) {
      const dateString = currentDate.toLocaleDateString('en-CA');
      if (uniqueDates.includes(dateString)) {
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
      lastActivityDate
    };
  };

  // Check and award badges
  const checkAndAwardBadges = (activitiesArray, current, longest) => {
    const stats = {
      totalActivities: activitiesArray.length,
      currentStreak: current,
      longestStreak: longest,
      activityCounts: {},
      lastActivityDate
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
    hasActivityToday: () => hasActivityOnDate(getTodayDate())
  };

  return (
    <StreakContext.Provider value={value}>
      {children}
    </StreakContext.Provider>
  );
};
