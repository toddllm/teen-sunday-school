import React, { createContext, useContext, useState, useEffect } from 'react';

const MemoryVerseContext = createContext();

export const useMemoryVerse = () => {
  const context = useContext(MemoryVerseContext);
  if (!context) {
    throw new Error('useMemoryVerse must be used within a MemoryVerseProvider');
  }
  return context;
};

export const MemoryVerseProvider = ({ children }) => {
  const [memoryVerses, setMemoryVerses] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('memory-verses');
    if (stored) {
      try {
        setMemoryVerses(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load memory verses:', error);
      }
    }
  }, []);

  // Save to localStorage whenever memoryVerses changes
  useEffect(() => {
    localStorage.setItem('memory-verses', JSON.stringify(memoryVerses));
  }, [memoryVerses]);

  // Add a new verse to memory
  const addMemoryVerse = (reference, text, translation = 'NIV') => {
    const newVerse = {
      id: Date.now().toString(),
      reference,
      text,
      translation,
      addedAt: new Date().toISOString(),
      interval: 1, // days until next review
      easeFactor: 2.5, // SM-2 algorithm ease factor
      repetitions: 0,
      nextReviewDate: new Date().toISOString(), // Available for review immediately
      lastReviewedAt: null,
      lastDifficulty: null,
    };

    setMemoryVerses(prev => [...prev, newVerse]);
    return newVerse;
  };

  // Remove a verse from memory
  const removeMemoryVerse = (id) => {
    setMemoryVerses(prev => prev.filter(v => v.id !== id));
  };

  // Calculate next review date using SM-2 algorithm
  const calculateNextReview = (verse, difficulty) => {
    let { interval, easeFactor, repetitions } = verse;

    if (difficulty === 'forgot') {
      // Reset the card
      repetitions = 0;
      interval = 1;
    } else {
      repetitions += 1;

      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }

      // Adjust ease factor based on difficulty
      if (difficulty === 'hard') {
        easeFactor = Math.max(1.3, easeFactor - 0.15);
      } else if (difficulty === 'easy') {
        easeFactor = easeFactor + 0.1;
      } else {
        // 'good'
        easeFactor = easeFactor - 0.05;
      }
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);

    return {
      interval,
      easeFactor,
      repetitions,
      nextReviewDate: nextDate.toISOString(),
      lastReviewedAt: new Date().toISOString(),
      lastDifficulty: difficulty,
    };
  };

  // Record a review
  const reviewVerse = (id, difficulty) => {
    setMemoryVerses(prev =>
      prev.map(verse => {
        if (verse.id === id) {
          const updates = calculateNextReview(verse, difficulty);
          return { ...verse, ...updates };
        }
        return verse;
      })
    );
  };

  // Get verses due for review today
  const getDueVerses = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return memoryVerses.filter(verse => {
      const nextReview = new Date(verse.nextReviewDate);
      nextReview.setHours(0, 0, 0, 0);
      return nextReview <= today;
    });
  };

  // Get upcoming verses (due in next 7 days)
  const getUpcomingVerses = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    return memoryVerses.filter(verse => {
      const nextReview = new Date(verse.nextReviewDate);
      nextReview.setHours(0, 0, 0, 0);
      return nextReview > today && nextReview <= weekFromNow;
    });
  };

  // Get all verses
  const getAllVerses = () => {
    return memoryVerses;
  };

  // Check if a verse is already in memory
  const isVerseInMemory = (reference) => {
    return memoryVerses.some(v =>
      v.reference.toLowerCase() === reference.toLowerCase()
    );
  };

  // Get statistics
  const getStats = () => {
    const dueCount = getDueVerses().length;
    const totalCount = memoryVerses.length;
    const reviewedToday = memoryVerses.filter(v => {
      if (!v.lastReviewedAt) return false;
      const reviewDate = new Date(v.lastReviewedAt);
      const today = new Date();
      return reviewDate.toDateString() === today.toDateString();
    }).length;

    return {
      total: totalCount,
      dueToday: dueCount,
      reviewedToday,
      upcoming: getUpcomingVerses().length,
    };
  };

  const value = {
    memoryVerses,
    addMemoryVerse,
    removeMemoryVerse,
    reviewVerse,
    getDueVerses,
    getUpcomingVerses,
    getAllVerses,
    isVerseInMemory,
    getStats,
  };

  return (
    <MemoryVerseContext.Provider value={value}>
      {children}
    </MemoryVerseContext.Provider>
  );
};
