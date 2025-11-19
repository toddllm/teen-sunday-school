import React, { createContext, useContext, useState, useEffect } from 'react';

const EngagementAnalyticsContext = createContext();

// Bible books list for reference
const BIBLE_BOOKS = [
  // Old Testament
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
  '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther',
  'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
  'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
  'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum',
  'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  // New Testament
  'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
  '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
  'Hebrews', 'James', '1 Peter', '2 Peter',
  '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

export const ENGAGEMENT_TYPES = {
  CHAPTER_READ: 'chapter_read',
  VERSE_READ: 'verse_read',
  PASSAGE_READ: 'passage_read',
  PARALLEL_VIEW: 'parallel_view',
  CROSS_REFERENCE: 'cross_reference',
  CONTEXT_CARD_VIEW: 'context_card_view',
  READING_PLAN_START: 'reading_plan_start',
  READING_PLAN_DAY_COMPLETE: 'reading_plan_day_complete'
};

export const useEngagementAnalytics = () => {
  const context = useContext(EngagementAnalyticsContext);
  if (!context) {
    throw new Error('useEngagementAnalytics must be used within an EngagementAnalyticsProvider');
  }
  return context;
};

export const EngagementAnalyticsProvider = ({ children }) => {
  const [engagements, setEngagements] = useState([]);
  const [readingPlans, setReadingPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedEngagements = localStorage.getItem('engagementAnalytics');
      const savedPlans = localStorage.getItem('readingPlanAnalytics');

      if (savedEngagements) {
        setEngagements(JSON.parse(savedEngagements));
      }

      if (savedPlans) {
        setReadingPlans(JSON.parse(savedPlans));
      }
    } catch (error) {
      console.error('Error loading engagement analytics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save engagements to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('engagementAnalytics', JSON.stringify(engagements));
    }
  }, [engagements, loading]);

  // Save reading plans to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('readingPlanAnalytics', JSON.stringify(readingPlans));
    }
  }, [readingPlans, loading]);

  // Track an engagement event
  const trackEngagement = (type, data = {}) => {
    const engagement = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
      ...data
    };

    setEngagements(prev => [...prev, engagement]);
    return engagement;
  };

  // Track scripture reading
  const trackScriptureRead = (book, chapter, verse = null, translation = 'ESV') => {
    return trackEngagement(ENGAGEMENT_TYPES.CHAPTER_READ, {
      book,
      chapter: parseInt(chapter),
      verse: verse ? parseInt(verse) : null,
      translation
    });
  };

  // Track passage reading
  const trackPassageRead = (reference, translation = 'ESV', timeSpent = null) => {
    return trackEngagement(ENGAGEMENT_TYPES.PASSAGE_READ, {
      reference,
      translation,
      timeSpent // in seconds
    });
  };

  // Track parallel translation view
  const trackParallelView = (reference, translations = []) => {
    return trackEngagement(ENGAGEMENT_TYPES.PARALLEL_VIEW, {
      reference,
      translations
    });
  };

  // Track cross-reference exploration
  const trackCrossReference = (fromReference, toReference) => {
    return trackEngagement(ENGAGEMENT_TYPES.CROSS_REFERENCE, {
      fromReference,
      toReference
    });
  };

  // Track context card view
  const trackContextCardView = (reference, cardType) => {
    return trackEngagement(ENGAGEMENT_TYPES.CONTEXT_CARD_VIEW, {
      reference,
      cardType
    });
  };

  // Track reading plan start
  const trackReadingPlanStart = (planName, planDuration) => {
    const plan = {
      id: `plan-${Date.now()}`,
      name: planName,
      duration: planDuration,
      startDate: new Date().toISOString(),
      daysCompleted: [],
      status: 'active'
    };

    setReadingPlans(prev => [...prev, plan]);
    trackEngagement(ENGAGEMENT_TYPES.READING_PLAN_START, {
      planId: plan.id,
      planName,
      planDuration
    });

    return plan;
  };

  // Track reading plan day completion
  const trackReadingPlanDayComplete = (planId, dayIndex) => {
    setReadingPlans(prev => prev.map(plan => {
      if (plan.id === planId) {
        const updatedDays = [...new Set([...plan.daysCompleted, dayIndex])];
        const status = updatedDays.length >= plan.duration ? 'completed' : 'active';

        return {
          ...plan,
          daysCompleted: updatedDays,
          status,
          lastActivityDate: new Date().toISOString()
        };
      }
      return plan;
    }));

    trackEngagement(ENGAGEMENT_TYPES.READING_PLAN_DAY_COMPLETE, {
      planId,
      dayIndex
    });
  };

  // Get aggregated stats by book
  const getBookStats = (fromDate = null, toDate = null) => {
    const filtered = filterEngagementsByDate(engagements, fromDate, toDate);

    const bookCounts = {};
    BIBLE_BOOKS.forEach(book => {
      bookCounts[book] = 0;
    });

    filtered.forEach(engagement => {
      if (engagement.book && bookCounts.hasOwnProperty(engagement.book)) {
        bookCounts[engagement.book]++;
      }
    });

    return Object.entries(bookCounts)
      .map(([book, count]) => ({ book, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Get aggregated stats by chapter
  const getChapterStats = (book, fromDate = null, toDate = null) => {
    const filtered = filterEngagementsByDate(engagements, fromDate, toDate);

    const chapterCounts = {};

    filtered.forEach(engagement => {
      if (engagement.book === book && engagement.chapter) {
        const chapter = engagement.chapter;
        chapterCounts[chapter] = (chapterCounts[chapter] || 0) + 1;
      }
    });

    return Object.entries(chapterCounts)
      .map(([chapter, count]) => ({ chapter: parseInt(chapter), count }))
      .sort((a, b) => a.chapter - b.chapter);
  };

  // Get daily engagement counts
  const getDailyEngagementStats = (fromDate = null, toDate = null) => {
    const filtered = filterEngagementsByDate(engagements, fromDate, toDate);

    const dailyCounts = {};

    filtered.forEach(engagement => {
      const date = engagement.date;
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    return Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  // Get engagement by type
  const getEngagementByType = (fromDate = null, toDate = null) => {
    const filtered = filterEngagementsByDate(engagements, fromDate, toDate);

    const typeCounts = {};
    Object.values(ENGAGEMENT_TYPES).forEach(type => {
      typeCounts[type] = 0;
    });

    filtered.forEach(engagement => {
      if (typeCounts.hasOwnProperty(engagement.type)) {
        typeCounts[engagement.type]++;
      }
    });

    return Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Get reading plan funnel data
  const getReadingPlanFunnel = (fromDate = null, toDate = null) => {
    let filtered = readingPlans;

    if (fromDate || toDate) {
      filtered = readingPlans.filter(plan => {
        const planDate = new Date(plan.startDate);
        if (fromDate && planDate < new Date(fromDate)) return false;
        if (toDate && planDate > new Date(toDate)) return false;
        return true;
      });
    }

    const totalPlans = filtered.length;
    const completedPlans = filtered.filter(p => p.status === 'completed').length;

    // Calculate completion by day index
    const dayCompletionStats = [];
    const maxDuration = Math.max(...filtered.map(p => p.duration), 0);

    for (let day = 0; day < maxDuration; day++) {
      const completedThisDay = filtered.filter(plan =>
        plan.daysCompleted.includes(day)
      ).length;

      dayCompletionStats.push({
        day: day + 1,
        completed: completedThisDay,
        percentage: totalPlans > 0 ? (completedThisDay / totalPlans) * 100 : 0
      });
    }

    return {
      totalPlans,
      completedPlans,
      activePlans: filtered.filter(p => p.status === 'active').length,
      completionRate: totalPlans > 0 ? (completedPlans / totalPlans) * 100 : 0,
      dayCompletionStats,
      averageProgress: totalPlans > 0
        ? filtered.reduce((sum, plan) => sum + plan.daysCompleted.length, 0) / totalPlans
        : 0
    };
  };

  // Get most read passages
  const getMostReadPassages = (limit = 10, fromDate = null, toDate = null) => {
    const filtered = filterEngagementsByDate(engagements, fromDate, toDate);

    const passageCounts = {};

    filtered.forEach(engagement => {
      if (engagement.book && engagement.chapter) {
        const key = `${engagement.book} ${engagement.chapter}${engagement.verse ? ':' + engagement.verse : ''}`;
        passageCounts[key] = (passageCounts[key] || 0) + 1;
      }
    });

    return Object.entries(passageCounts)
      .map(([passage, count]) => ({ passage, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  };

  // Get translation usage stats
  const getTranslationStats = (fromDate = null, toDate = null) => {
    const filtered = filterEngagementsByDate(engagements, fromDate, toDate);

    const translationCounts = {};

    filtered.forEach(engagement => {
      if (engagement.translation) {
        translationCounts[engagement.translation] = (translationCounts[engagement.translation] || 0) + 1;
      }
      if (engagement.translations && Array.isArray(engagement.translations)) {
        engagement.translations.forEach(trans => {
          translationCounts[trans] = (translationCounts[trans] || 0) + 1;
        });
      }
    });

    return Object.entries(translationCounts)
      .map(([translation, count]) => ({ translation, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Helper: Filter engagements by date range
  const filterEngagementsByDate = (items, fromDate, toDate) => {
    return items.filter(item => {
      const itemDate = new Date(item.timestamp);
      if (fromDate && itemDate < new Date(fromDate)) return false;
      if (toDate && itemDate > new Date(toDate)) return false;
      return true;
    });
  };

  // Get summary statistics
  const getSummaryStats = (fromDate = null, toDate = null) => {
    const filtered = filterEngagementsByDate(engagements, fromDate, toDate);
    const planFunnel = getReadingPlanFunnel(fromDate, toDate);

    const uniqueBooks = new Set();
    const uniqueChapters = new Set();

    filtered.forEach(engagement => {
      if (engagement.book) {
        uniqueBooks.add(engagement.book);
        if (engagement.chapter) {
          uniqueChapters.add(`${engagement.book}:${engagement.chapter}`);
        }
      }
    });

    return {
      totalEngagements: filtered.length,
      uniqueBooks: uniqueBooks.size,
      uniqueChapters: uniqueChapters.size,
      totalReadingPlans: planFunnel.totalPlans,
      completedReadingPlans: planFunnel.completedPlans,
      averageEngagementsPerDay: getDailyEngagementStats(fromDate, toDate).length > 0
        ? filtered.length / getDailyEngagementStats(fromDate, toDate).length
        : 0
    };
  };

  const value = {
    engagements,
    readingPlans,
    loading,
    // Tracking functions
    trackEngagement,
    trackScriptureRead,
    trackPassageRead,
    trackParallelView,
    trackCrossReference,
    trackContextCardView,
    trackReadingPlanStart,
    trackReadingPlanDayComplete,
    // Analytics functions
    getBookStats,
    getChapterStats,
    getDailyEngagementStats,
    getEngagementByType,
    getReadingPlanFunnel,
    getMostReadPassages,
    getTranslationStats,
    getSummaryStats
  };

  return (
    <EngagementAnalyticsContext.Provider value={value}>
      {children}
    </EngagementAnalyticsContext.Provider>
  );
};
