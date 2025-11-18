import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useActivity, ACTIVITY_TYPES } from './ActivityContext';
import { useStreak } from './StreakContext';

const BadgeContext = createContext();

export const useBadges = () => {
  const context = useContext(BadgeContext);
  if (!context) {
    throw new Error('useBadges must be used within a BadgeProvider');
  }
  return context;
};

// Badge definitions - gentle and encouraging
export const BADGE_DEFINITIONS = [
  // Streak-based badges
  {
    id: 'first-step',
    name: 'First Step',
    description: 'Complete your first activity',
    icon: '🌱',
    category: 'milestone',
    criteria: (data) => data.totalActivities >= 1
  },
  {
    id: 'week-warrior',
    name: 'Week of Faith',
    description: 'Maintain a 7-day streak',
    icon: '⭐',
    category: 'streak',
    criteria: (data) => data.currentStreak >= 7
  },
  {
    id: 'two-week-champion',
    name: 'Fortnight Faithful',
    description: 'Maintain a 14-day streak',
    icon: '🌟',
    category: 'streak',
    criteria: (data) => data.currentStreak >= 14
  },
  {
    id: 'month-master',
    name: 'Month of Growth',
    description: 'Maintain a 30-day streak',
    icon: '💫',
    category: 'streak',
    criteria: (data) => data.currentStreak >= 30
  },
  {
    id: 'committed-follower',
    name: 'Committed Follower',
    description: 'Maintain a 60-day streak',
    icon: '🏆',
    category: 'streak',
    criteria: (data) => data.longestStreak >= 60
  },
  {
    id: 'devoted-disciple',
    name: 'Devoted Disciple',
    description: 'Maintain a 100-day streak',
    icon: '👑',
    category: 'streak',
    criteria: (data) => data.longestStreak >= 100
  },

  // Activity-based badges
  {
    id: 'lesson-learner',
    name: 'Lesson Learner',
    description: 'View 5 lessons',
    icon: '📖',
    category: 'lessons',
    criteria: (data) => data.lessonViews >= 5
  },
  {
    id: 'lesson-enthusiast',
    name: 'Lesson Enthusiast',
    description: 'View 20 lessons',
    icon: '📚',
    category: 'lessons',
    criteria: (data) => data.lessonViews >= 20
  },
  {
    id: 'lesson-scholar',
    name: 'Lesson Scholar',
    description: 'View 50 lessons',
    icon: '🎓',
    category: 'lessons',
    criteria: (data) => data.lessonViews >= 50
  },
  {
    id: 'bible-explorer',
    name: 'Bible Explorer',
    description: 'Read 10 Bible verses',
    icon: '✝️',
    category: 'bible',
    criteria: (data) => data.bibleVerses >= 10
  },
  {
    id: 'scripture-seeker',
    name: 'Scripture Seeker',
    description: 'Read 50 Bible verses',
    icon: '📜',
    category: 'bible',
    criteria: (data) => data.bibleVerses >= 50
  },
  {
    id: 'word-student',
    name: 'Word Student',
    description: 'Read 100 Bible verses',
    icon: '🕊️',
    category: 'bible',
    criteria: (data) => data.bibleVerses >= 100
  },
  {
    id: 'playful-learner',
    name: 'Playful Learner',
    description: 'Play 5 games',
    icon: '🎮',
    category: 'games',
    criteria: (data) => data.gamesPlayed >= 5
  },
  {
    id: 'game-enthusiast',
    name: 'Game Enthusiast',
    description: 'Play 20 games',
    icon: '🎯',
    category: 'games',
    criteria: (data) => data.gamesPlayed >= 20
  },

  // Milestone badges
  {
    id: 'comeback-kid',
    name: 'Comeback Kid',
    description: 'Return after missing a day',
    icon: '🔄',
    category: 'milestone',
    criteria: (data) => data.hasComeback
  },
  {
    id: 'consistent-companion',
    name: 'Consistent Companion',
    description: 'Active for 7 separate days',
    icon: '🌈',
    category: 'milestone',
    criteria: (data) => data.uniqueActiveDays >= 7
  },
  {
    id: 'faithful-friend',
    name: 'Faithful Friend',
    description: 'Active for 30 separate days',
    icon: '💝',
    category: 'milestone',
    criteria: (data) => data.uniqueActiveDays >= 30
  }
];

export const BadgeProvider = ({ children }) => {
  const { activities, getActivitiesByType, getActiveDays } = useActivity();
  const { currentStreak, longestStreak } = useStreak();
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user badges from localStorage on mount
  useEffect(() => {
    try {
      const storedBadges = localStorage.getItem('user-badges');
      if (storedBadges) {
        setUserBadges(JSON.parse(storedBadges));
      }
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save user badges to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('user-badges', JSON.stringify(userBadges));
      } catch (error) {
        console.error('Error saving badges:', error);
      }
    }
  }, [userBadges, loading]);

  // Check for new badges whenever activities or streaks change
  useEffect(() => {
    if (!loading) {
      checkForNewBadges();
    }
  }, [activities, currentStreak, longestStreak, loading, checkForNewBadges]);

  const calculateActivityData = useCallback(() => {
    const lessonViews = getActivitiesByType(ACTIVITY_TYPES.LESSON_VIEWED).length;
    const lessonCompletes = getActivitiesByType(ACTIVITY_TYPES.LESSON_COMPLETED).length;
    const bibleVerses = getActivitiesByType(ACTIVITY_TYPES.BIBLE_VERSE_READ).length;
    const gamesPlayed = getActivitiesByType(ACTIVITY_TYPES.GAME_PLAYED).length;
    const totalActivities = activities.length;
    const uniqueActiveDays = getActiveDays().length;

    // Check for comeback (had activity, missed day(s), came back)
    const activeDays = getActiveDays();
    let hasComeback = false;
    if (activeDays.length >= 3) {
      // Simple check: if there's a gap in the activity days
      for (let i = 0; i < activeDays.length - 1; i++) {
        const date1 = new Date(activeDays[i]);
        const date2 = new Date(activeDays[i + 1]);
        const daysDiff = Math.abs((date1 - date2) / (1000 * 60 * 60 * 24));
        if (daysDiff > 1) {
          hasComeback = true;
          break;
        }
      }
    }

    return {
      lessonViews,
      lessonCompletes,
      bibleVerses,
      gamesPlayed,
      totalActivities,
      uniqueActiveDays,
      currentStreak,
      longestStreak,
      hasComeback
    };
  }, [activities, getActivitiesByType, getActiveDays, currentStreak, longestStreak]);

  const checkForNewBadges = useCallback(() => {
    const activityData = calculateActivityData();
    const newBadges = [];

    BADGE_DEFINITIONS.forEach(badge => {
      // Check if user already has this badge
      const alreadyEarned = userBadges.some(ub => ub.badgeId === badge.id);

      if (!alreadyEarned && badge.criteria(activityData)) {
        const earnedBadge = {
          badgeId: badge.id,
          awardedAt: new Date().toISOString()
        };
        newBadges.push(earnedBadge);
      }
    });

    if (newBadges.length > 0) {
      setUserBadges(prev => [...prev, ...newBadges]);
      return newBadges.map(nb =>
        BADGE_DEFINITIONS.find(bd => bd.id === nb.badgeId)
      );
    }

    return [];
  }, [userBadges, calculateActivityData]);

  const getBadgeDetails = (badgeId) => {
    return BADGE_DEFINITIONS.find(b => b.id === badgeId);
  };

  const getAllBadges = () => {
    return BADGE_DEFINITIONS.map(badge => {
      const earned = userBadges.find(ub => ub.badgeId === badge.id);
      return {
        ...badge,
        earned: !!earned,
        awardedAt: earned?.awardedAt || null
      };
    });
  };

  const getEarnedBadges = () => {
    return userBadges.map(ub => {
      const badge = getBadgeDetails(ub.badgeId);
      return {
        ...badge,
        awardedAt: ub.awardedAt
      };
    }).filter(b => b.id); // Filter out any undefined badges
  };

  const getLockedBadges = () => {
    const earnedIds = userBadges.map(ub => ub.badgeId);
    return BADGE_DEFINITIONS.filter(badge => !earnedIds.includes(badge.id));
  };

  const getBadgesByCategory = (category) => {
    return getAllBadges().filter(badge => badge.category === category);
  };

  const getProgress = () => {
    const total = BADGE_DEFINITIONS.length;
    const earned = userBadges.length;
    return {
      total,
      earned,
      percentage: total > 0 ? Math.round((earned / total) * 100) : 0
    };
  };

  const value = {
    userBadges,
    loading,
    checkForNewBadges,
    getBadgeDetails,
    getAllBadges,
    getEarnedBadges,
    getLockedBadges,
    getBadgesByCategory,
    getProgress
  };

  return (
    <BadgeContext.Provider value={value}>
      {children}
    </BadgeContext.Provider>
  );
};
