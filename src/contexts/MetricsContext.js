import React, { createContext, useContext } from 'react';
import { useStreak } from './StreakContext';
import { useLessons } from './LessonContext';

const MetricsContext = createContext();

export const useMetrics = () => {
  const context = useContext(MetricsContext);
  if (!context) {
    throw new Error('useMetrics must be used within a MetricsProvider');
  }
  return context;
};

export const MetricsProvider = ({ children }) => {
  const { activities, getStats, getAllBadges } = useStreak();
  const { lessons } = useLessons();

  // Helper: Get date range
  const getDateRange = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return { startDate, endDate };
  };

  // Helper: Filter activities by date range
  const filterActivitiesByDateRange = (startDate, endDate) => {
    return activities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      return activityDate >= startDate && activityDate <= endDate;
    });
  };

  // Get unique active dates in a date range (simulating users by unique dates)
  const getActiveDates = (startDate, endDate) => {
    const filtered = filterActivitiesByDateRange(startDate, endDate);
    const uniqueDates = [...new Set(filtered.map(a => a.date))];
    return uniqueDates;
  };

  // Calculate DAU (Daily Active "Users" - unique dates with activity)
  const getDailyActiveUsers = () => {
    const { startDate, endDate } = getDateRange(1);
    return getActiveDates(startDate, endDate).length > 0 ? 1 : 0;
  };

  // Calculate WAU (Weekly Active "Users")
  const getWeeklyActiveUsers = () => {
    const { startDate, endDate } = getDateRange(7);
    return getActiveDates(startDate, endDate).length;
  };

  // Calculate MAU (Monthly Active "Users")
  const getMonthlyActiveUsers = () => {
    const { startDate, endDate } = getDateRange(30);
    return getActiveDates(startDate, endDate).length;
  };

  // Get new "signups" (first activity in date range)
  const getNewSignups = (startDate, endDate) => {
    const filtered = filterActivitiesByDateRange(startDate, endDate);
    if (filtered.length === 0) return 0;

    // If activities in range and it's the first ever activity
    if (activities.length > 0) {
      const firstActivity = activities.sort((a, b) =>
        new Date(a.timestamp) - new Date(b.timestamp)
      )[0];
      const firstDate = new Date(firstActivity.timestamp);
      if (firstDate >= startDate && firstDate <= endDate) {
        return 1;
      }
    }
    return 0;
  };

  // Get activity breakdown by type for date range
  const getActivityBreakdown = (startDate, endDate) => {
    const filtered = filterActivitiesByDateRange(startDate, endDate);
    const breakdown = {};

    filtered.forEach(activity => {
      const type = activity.activityType;
      breakdown[type] = (breakdown[type] || 0) + 1;
    });

    return breakdown;
  };

  // Get activity trend over time (daily counts)
  const getActivityTrend = (days) => {
    const trend = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toLocaleDateString('en-CA');

      const count = activities.filter(a => a.date === dateString).length;

      trend.push({
        date: dateString,
        count,
        label: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : dateString
      });
    }

    return trend;
  };

  // Get badge completion rate
  const getBadgeCompletionRate = () => {
    const allBadges = getAllBadges();
    const earnedCount = allBadges.filter(b => b.earned).length;
    const totalCount = allBadges.length;

    return {
      earned: earnedCount,
      total: totalCount,
      percentage: totalCount > 0 ? (earnedCount / totalCount) * 100 : 0
    };
  };

  // Get most popular activity types
  const getMostPopularActivities = (startDate, endDate) => {
    const breakdown = getActivityBreakdown(startDate, endDate);
    const sorted = Object.entries(breakdown)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    return sorted;
  };

  // Get lesson completion stats
  const getLessonStats = (startDate, endDate) => {
    const filtered = filterActivitiesByDateRange(startDate, endDate);
    const lessonActivities = filtered.filter(a => a.activityType === 'lesson_completed');

    return {
      completions: lessonActivities.length,
      totalLessons: lessons.length,
      completionRate: lessons.length > 0
        ? (lessonActivities.length / lessons.length) * 100
        : 0
    };
  };

  // Get reading plan stats
  const getReadingPlanStats = (startDate, endDate) => {
    const filtered = filterActivitiesByDateRange(startDate, endDate);
    const planActivities = filtered.filter(a =>
      a.activityType === 'reading_plan_completed'
    );

    return {
      starts: planActivities.length,
      completions: planActivities.length
    };
  };

  // Get most popular Bible books (from chapter reads)
  const getMostPopularBooks = (startDate, endDate) => {
    const filtered = filterActivitiesByDateRange(startDate, endDate);
    const chapterReads = filtered.filter(a => a.activityType === 'chapter_read');

    // In a real app, we'd track which books were read
    // For now, return a count of chapter reads
    return {
      totalChaptersRead: chapterReads.length
    };
  };

  // Get comprehensive dashboard metrics for a date range
  const getDashboardMetrics = (startDate, endDate) => {
    const stats = getStats();

    return {
      overview: {
        totalActivities: stats.totalActivities,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        dau: getDailyActiveUsers(),
        wau: getWeeklyActiveUsers(),
        mau: getMonthlyActiveUsers()
      },
      users: {
        newSignups: getNewSignups(startDate, endDate),
        activeDates: getActiveDates(startDate, endDate).length
      },
      activities: {
        breakdown: getActivityBreakdown(startDate, endDate),
        trend: getActivityTrend(30),
        mostPopular: getMostPopularActivities(startDate, endDate)
      },
      badges: {
        ...getBadgeCompletionRate(),
        allBadges: getAllBadges()
      },
      lessons: getLessonStats(startDate, endDate),
      readingPlans: getReadingPlanStats(startDate, endDate),
      bibleBooks: getMostPopularBooks(startDate, endDate)
    };
  };

  // Get metrics for preset time ranges
  const getMetricsForRange = (range) => {
    let days;
    switch (range) {
      case '7d':
        days = 7;
        break;
      case '30d':
        days = 30;
        break;
      case '90d':
        days = 90;
        break;
      default:
        days = 30;
    }

    const { startDate, endDate } = getDateRange(days);
    return getDashboardMetrics(startDate, endDate);
  };

  // Get custom range metrics
  const getMetricsForCustomRange = (startDate, endDate) => {
    return getDashboardMetrics(new Date(startDate), new Date(endDate));
  };

  const value = {
    getDashboardMetrics,
    getMetricsForRange,
    getMetricsForCustomRange,
    getActivityTrend,
    getBadgeCompletionRate,
    getMostPopularActivities,
    getLessonStats,
    getReadingPlanStats
  };

  return (
    <MetricsContext.Provider value={value}>
      {children}
    </MetricsContext.Provider>
  );
};
