import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { format, parseISO, differenceInDays, startOfDay, subDays } from 'date-fns';
import { useActivity } from './ActivityContext';

const StreakContext = createContext();

export const useStreak = () => {
  const context = useContext(StreakContext);
  if (!context) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
};

export const StreakProvider = ({ children }) => {
  const { getActiveDays, loading: activitiesLoading } = useActivity();
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    streakBrokenDate: null
  });
  const [loading, setLoading] = useState(true);

  // Load streak data from localStorage on mount
  useEffect(() => {
    try {
      const storedStreak = localStorage.getItem('user-streak');
      if (storedStreak) {
        const parsed = JSON.parse(storedStreak);
        setStreakData(parsed);
      }
    } catch (error) {
      console.error('Error loading streak data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save streak data to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('user-streak', JSON.stringify(streakData));
      } catch (error) {
        console.error('Error saving streak data:', error);
      }
    }
  }, [streakData, loading]);

  const calculateStreak = useCallback(() => {
    const activeDays = getActiveDays();

    if (activeDays.length === 0) {
      setStreakData(prev => ({
        ...prev,
        currentStreak: 0,
        lastActivityDate: null
      }));
      return;
    }

    const today = startOfDay(new Date());
    const todayStr = format(today, 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let previousDate = null;
    let streakBroken = false;

    // Check if there's activity today or yesterday (streak is still alive)
    const hasRecentActivity = activeDays.includes(todayStr) || activeDays.includes(yesterdayStr);

    // Calculate current streak
    if (hasRecentActivity) {
      for (let i = 0; i < activeDays.length; i++) {
        const currentDate = parseISO(activeDays[i]);

        if (i === 0) {
          currentStreak = 1;
          tempStreak = 1;
          previousDate = currentDate;
          continue;
        }

        const daysDiff = differenceInDays(previousDate, currentDate);

        if (daysDiff === 1) {
          // Consecutive day
          currentStreak++;
          tempStreak++;
        } else {
          // Streak broken
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          tempStreak = 1;
        }

        previousDate = currentDate;
      }
    } else {
      // Streak is broken
      currentStreak = 0;
      streakBroken = true;

      // Calculate longest streak from history
      for (let i = 0; i < activeDays.length; i++) {
        const currentDate = parseISO(activeDays[i]);

        if (i === 0) {
          tempStreak = 1;
          previousDate = currentDate;
          continue;
        }

        const daysDiff = differenceInDays(previousDate, currentDate);

        if (daysDiff === 1) {
          tempStreak++;
        } else {
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          tempStreak = 1;
        }

        previousDate = currentDate;
      }
    }

    // Final check for longest streak
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    // Ensure longest streak is at least as long as current streak
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    // Update state
    setStreakData(prev => {
      const newData = {
        currentStreak,
        longestStreak: Math.max(longestStreak, prev.longestStreak),
        lastActivityDate: activeDays[0] || null,
        streakBrokenDate: streakBroken && currentStreak === 0 && prev.currentStreak > 0
          ? new Date().toISOString()
          : prev.streakBrokenDate
      };
      return newData;
    });
  }, [getActiveDays]);

  // Calculate streak whenever activities change
  useEffect(() => {
    if (!activitiesLoading) {
      calculateStreak();
    }
  }, [activitiesLoading, calculateStreak]);

  const resetStreak = () => {
    setStreakData({
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      streakBrokenDate: null
    });
  };

  const getStreakStatus = () => {
    const { currentStreak, streakBrokenDate } = streakData;

    if (currentStreak === 0 && streakBrokenDate) {
      const brokenDate = parseISO(streakBrokenDate);
      const daysSinceBroken = differenceInDays(new Date(), brokenDate);

      if (daysSinceBroken <= 7) {
        return {
          status: 'broken',
          message: "Don't worry! Every day is a new opportunity to grow in faith. Start fresh today!",
          encouragement: true
        };
      }
    }

    if (currentStreak === 0) {
      return {
        status: 'none',
        message: "Start your journey today! Complete any activity to begin your streak.",
        encouragement: true
      };
    }

    if (currentStreak === 1) {
      return {
        status: 'started',
        message: "Great start! Come back tomorrow to keep your streak going.",
        encouragement: true
      };
    }

    if (currentStreak >= 7) {
      return {
        status: 'strong',
        message: `Amazing! ${currentStreak} days of faithfulness. Keep it up!`,
        encouragement: true
      };
    }

    return {
      status: 'active',
      message: `You're doing great! ${currentStreak} day${currentStreak > 1 ? 's' : ''} and counting!`,
      encouragement: true
    };
  };

  const value = {
    streakData,
    loading: loading || activitiesLoading,
    calculateStreak,
    resetStreak,
    getStreakStatus,
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak
  };

  return (
    <StreakContext.Provider value={value}>
      {children}
    </StreakContext.Provider>
  );
};
