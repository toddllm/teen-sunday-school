import React, { createContext, useContext, useState, useEffect } from 'react';
import { getVerseText } from '../services/bibleAPI';

const VerseOfDayContext = createContext();

// Curated list of popular verses for daily rotation
const VERSE_ROTATION = [
  "John 3:16",
  "Psalm 23:1",
  "Philippians 4:13",
  "Jeremiah 29:11",
  "Proverbs 3:5-6",
  "Romans 8:28",
  "Isaiah 41:10",
  "Matthew 6:33",
  "Psalm 46:1",
  "2 Corinthians 5:17",
  "Joshua 1:9",
  "Romans 12:2",
  "Ephesians 2:8-9",
  "1 John 4:19",
  "Psalm 119:105",
  "Matthew 11:28",
  "Galatians 5:22-23",
  "Hebrews 11:1",
  "James 1:2-3",
  "1 Corinthians 13:4-7",
  "Psalm 27:1",
  "Isaiah 40:31",
  "Proverbs 16:3",
  "Romans 5:8",
  "Colossians 3:23",
  "1 Peter 5:7",
  "Psalm 103:12",
  "Matthew 5:16",
  "2 Timothy 1:7",
  "Psalm 121:1-2"
];

export const VerseOfDayProvider = ({ children }) => {
  const [verseData, setVerseData] = useState({
    verse: null,
    loading: true,
    error: null,
    lastUpdated: null,
    viewCount: 0,
    history: []
  });

  const [settings, setSettings] = useState({
    autoDisplay: true,
    translation: 'NIV',
    notificationsEnabled: false
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('verseOfDayData');
    const savedSettings = localStorage.getItem('verseOfDaySettings');

    if (savedData) {
      try {
        setVerseData(JSON.parse(savedData));
      } catch (e) {
        console.error('Error loading verse data:', e);
      }
    }

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Error loading verse settings:', e);
      }
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('verseOfDayData', JSON.stringify(verseData));
  }, [verseData]);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('verseOfDaySettings', JSON.stringify(settings));
  }, [settings]);

  // Get today's date as a string (YYYY-MM-DD)
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get the verse reference for today
  const getTodaysReference = () => {
    const today = new Date();
    // Use day of year to rotate through verses
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const index = dayOfYear % VERSE_ROTATION.length;
    return VERSE_ROTATION[index];
  };

  // Fetch today's verse
  const fetchTodaysVerse = async () => {
    const today = getTodayString();

    // Check if we already have today's verse
    if (verseData.verse && verseData.lastUpdated === today) {
      return verseData.verse;
    }

    setVerseData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const reference = getTodaysReference();
      const verse = await getVerseText(reference);

      const newVerseData = {
        ...verse,
        reference: verse.reference || reference,
        date: today
      };

      setVerseData(prev => ({
        verse: newVerseData,
        loading: false,
        error: null,
        lastUpdated: today,
        viewCount: prev.lastUpdated === today ? prev.viewCount : 0,
        history: [
          newVerseData,
          ...prev.history.filter(v => v.date !== today).slice(0, 29) // Keep last 30 days
        ]
      }));

      return newVerseData;
    } catch (error) {
      console.error('Error fetching verse of the day:', error);
      setVerseData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load verse. Please try again later.'
      }));
      return null;
    }
  };

  // Mark verse as viewed (for analytics)
  const markAsViewed = () => {
    setVerseData(prev => ({
      ...prev,
      viewCount: prev.viewCount + 1
    }));
  };

  // Update settings
  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Get verse for a specific date from history
  const getVerseByDate = (dateString) => {
    return verseData.history.find(v => v.date === dateString);
  };

  // Get analytics data
  const getAnalytics = () => {
    const today = getTodayString();
    return {
      todayViewCount: verseData.viewCount,
      totalHistoryDays: verseData.history.length,
      lastViewDate: verseData.lastUpdated,
      currentStreak: calculateStreak(),
      isViewedToday: verseData.lastUpdated === today && verseData.viewCount > 0
    };
  };

  // Calculate viewing streak
  const calculateStreak = () => {
    if (verseData.history.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sort history by date descending
    const sortedHistory = [...verseData.history].sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    );

    for (let i = 0; i < sortedHistory.length; i++) {
      const verseDate = new Date(sortedHistory[i].date);
      verseDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      if (verseDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const value = {
    verse: verseData.verse,
    loading: verseData.loading,
    error: verseData.error,
    settings,
    fetchTodaysVerse,
    markAsViewed,
    updateSettings,
    getVerseByDate,
    getAnalytics,
    history: verseData.history
  };

  return (
    <VerseOfDayContext.Provider value={value}>
      {children}
    </VerseOfDayContext.Provider>
  );
};

export const useVerseOfDay = () => {
  const context = useContext(VerseOfDayContext);
  if (!context) {
    throw new Error('useVerseOfDay must be used within a VerseOfDayProvider');
  }
  return context;
};

export default VerseOfDayContext;
