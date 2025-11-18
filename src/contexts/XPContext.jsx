import React, { createContext, useContext, useState, useEffect } from 'react';

const XPContext = createContext();

// XP action types (matching backend)
export const XP_ACTION_TYPES = {
  CHAPTER_READ: 'CHAPTER_READ',
  READING_PLAN_DAY: 'READING_PLAN_DAY',
  LESSON_COMPLETED: 'LESSON_COMPLETED',
  QUIZ_CORRECT: 'QUIZ_CORRECT',
  PRAYER_LOGGED: 'PRAYER_LOGGED',
  VERSE_MEMORIZED: 'VERSE_MEMORIZED',
  JOURNAL_ENTRY: 'JOURNAL_ENTRY',
  DAILY_LOGIN: 'DAILY_LOGIN',
  STREAK_BONUS: 'STREAK_BONUS',
};

// XP amounts for each action
export const XP_AMOUNTS = {
  CHAPTER_READ: 10,
  READING_PLAN_DAY: 15,
  LESSON_COMPLETED: 20,
  QUIZ_CORRECT: 5,
  PRAYER_LOGGED: 10,
  VERSE_MEMORIZED: 25,
  JOURNAL_ENTRY: 10,
  DAILY_LOGIN: 5,
};

export const useXP = () => {
  const context = useContext(XPContext);
  if (!context) {
    throw new Error('useXP must be used within an XPProvider');
  }
  return context;
};

export const XPProvider = ({ children }) => {
  const [xpData, setXPData] = useState({
    xpTotal: 0,
    level: 1,
    progress: {
      level: 1,
      totalXP: 0,
      currentXP: 0,
      xpForCurrentLevel: 0,
      xpForNextLevel: 100,
      xpNeeded: 100,
      progress: 0,
    },
    recentEvents: [],
    rewards: [],
  });
  const [loading, setLoading] = useState(true);
  const [levelUpNotification, setLevelUpNotification] = useState(null);

  // Calculate level from XP (matches backend formula)
  const getLevelFromXP = (totalXP) => {
    let level = 1;
    while (getXPForLevel(level + 1) <= totalXP) {
      level++;
    }
    return level;
  };

  // Calculate XP needed for a level (matches backend formula)
  const getXPForLevel = (level) => {
    if (level <= 1) return 0;
    return Math.floor(100 * Math.pow(level, 1.5));
  };

  // Calculate level progress
  const getLevelProgress = (totalXP) => {
    const level = getLevelFromXP(totalXP);
    const xpForCurrentLevel = getXPForLevel(level);
    const xpForNextLevel = getXPForLevel(level + 1);
    const currentXP = totalXP - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const progress = (currentXP / xpNeeded) * 100;

    return {
      level,
      totalXP,
      currentXP,
      xpForCurrentLevel,
      xpForNextLevel,
      xpNeeded,
      progress: Math.min(100, Math.max(0, progress)),
    };
  };

  // Load XP data from localStorage (fallback if not logged in)
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('xpData');
      if (savedData) {
        const data = JSON.parse(savedData);
        setXPData({
          ...data,
          progress: getLevelProgress(data.xpTotal),
        });
      }
    } catch (error) {
      console.error('Error loading XP data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save XP data to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('xpData', JSON.stringify(xpData));
    }
  }, [xpData, loading]);

  // Award XP locally (for offline/demo mode)
  const awardXPLocal = (actionType, amount) => {
    const xpAmount = amount || XP_AMOUNTS[actionType] || 0;
    if (xpAmount === 0) return;

    const oldLevel = xpData.level;
    const newTotalXP = xpData.xpTotal + xpAmount;
    const progress = getLevelProgress(newTotalXP);
    const leveledUp = progress.level > oldLevel;

    const newEvent = {
      actionType,
      amount: xpAmount,
      createdAt: new Date().toISOString(),
    };

    setXPData({
      xpTotal: newTotalXP,
      level: progress.level,
      progress,
      recentEvents: [newEvent, ...xpData.recentEvents].slice(0, 10),
      rewards: xpData.rewards,
    });

    if (leveledUp) {
      setLevelUpNotification({
        oldLevel,
        newLevel: progress.level,
      });
      setTimeout(() => setLevelUpNotification(null), 5000);
    }

    return {
      xpAwarded: xpAmount,
      totalXP: newTotalXP,
      level: progress.level,
      leveledUp,
      oldLevel,
    };
  };

  // Fetch XP data from API (when logged in)
  const fetchXPData = async () => {
    // TODO: Implement API call when backend is ready
    // For now, using localStorage
    return xpData;
  };

  // Award XP via API (when logged in)
  const awardXP = async (actionType, metadata) => {
    // TODO: Implement API call when backend is ready
    // For now, using local state
    return awardXPLocal(actionType);
  };

  // Get level info
  const getLevelInfo = (level) => {
    const xpRequired = getXPForLevel(level);
    const xpForNext = getXPForLevel(level + 1);

    return {
      level,
      xpRequired,
      xpForNext,
      xpNeeded: xpForNext - xpRequired,
    };
  };

  // Get rewards for level
  const getRewardsForLevel = (level) => {
    const rewards = [];

    // Avatars every 5 levels
    if (level % 5 === 0) {
      rewards.push({
        type: 'AVATAR',
        name: `Level ${level} Avatar`,
        description: `Unlocked at level ${level}`,
      });
    }

    // Themes every 10 levels
    if (level % 10 === 0) {
      rewards.push({
        type: 'THEME',
        name: `Level ${level} Theme`,
        description: `Unlocked at level ${level}`,
      });
    }

    return rewards;
  };

  // Get next reward milestone
  const getNextReward = () => {
    const currentLevel = xpData.level;

    // Find next avatar (multiple of 5)
    const nextAvatarLevel = Math.ceil((currentLevel + 1) / 5) * 5;

    // Find next theme (multiple of 10)
    const nextThemeLevel = Math.ceil((currentLevel + 1) / 10) * 10;

    const nextMilestone = Math.min(nextAvatarLevel, nextThemeLevel);

    return {
      level: nextMilestone,
      type: nextMilestone % 10 === 0 ? 'THEME' : 'AVATAR',
      xpNeeded: getXPForLevel(nextMilestone) - xpData.xpTotal,
    };
  };

  const value = {
    xpData,
    loading,
    levelUpNotification,
    awardXP,
    fetchXPData,
    getLevelProgress,
    getLevelInfo,
    getRewardsForLevel,
    getNextReward,
    // Expose helpers
    getLevelFromXP,
    getXPForLevel,
  };

  return (
    <XPContext.Provider value={value}>
      {children}
    </XPContext.Provider>
  );
};
