import React, { createContext, useContext, useState, useEffect } from 'react';
import { format, parseISO, isToday } from 'date-fns';

const ActivityContext = createContext();

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};

export const ACTIVITY_TYPES = {
  LESSON_VIEWED: 'lesson_viewed',
  LESSON_COMPLETED: 'lesson_completed',
  BIBLE_VERSE_READ: 'bible_verse_read',
  GAME_PLAYED: 'game_played',
  PRAYER_LOGGED: 'prayer_logged',
  VERSE_MEMORIZED: 'verse_memorized'
};

export const ActivityProvider = ({ children }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load activities from localStorage on mount
  useEffect(() => {
    try {
      const storedActivities = localStorage.getItem('user-activities');
      if (storedActivities) {
        setActivities(JSON.parse(storedActivities));
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save activities to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('user-activities', JSON.stringify(activities));
      } catch (error) {
        console.error('Error saving activities:', error);
      }
    }
  }, [activities, loading]);

  const logActivity = (activityType, metadata = {}) => {
    const activity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: activityType,
      timestamp: new Date().toISOString(),
      date: format(new Date(), 'yyyy-MM-dd'),
      metadata
    };

    setActivities(prev => [activity, ...prev]);
    return activity;
  };

  const getActivitiesByDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return activities.filter(activity => activity.date === dateStr);
  };

  const getActivitiesByType = (type) => {
    return activities.filter(activity => activity.type === type);
  };

  const getTodayActivities = () => {
    return activities.filter(activity => {
      try {
        return isToday(parseISO(activity.timestamp));
      } catch {
        return false;
      }
    });
  };

  const hasActivityToday = () => {
    return getTodayActivities().length > 0;
  };

  const getActiveDays = () => {
    // Get unique dates with activity
    const uniqueDates = [...new Set(activities.map(a => a.date))];
    return uniqueDates.sort((a, b) => b.localeCompare(a)); // Most recent first
  };

  const clearActivities = () => {
    setActivities([]);
  };

  const value = {
    activities,
    loading,
    logActivity,
    getActivitiesByDate,
    getActivitiesByType,
    getTodayActivities,
    hasActivityToday,
    getActiveDays,
    clearActivities
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
};
