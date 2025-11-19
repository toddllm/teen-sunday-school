import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BIBLE_BOOKS, getBookByName, parseReference } from '../data/bibleBooks';

const BibleProgressContext = createContext();

const STORAGE_KEY = 'bible-progress-data';

/**
 * What counts as "read"?
 * - A chapter is marked read if user views it for 3+ seconds
 * - Or if they manually mark it as read
 * - Tracking is at the chapter level for simplicity
 */

const getInitialState = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse bible progress data:', e);
    }
  }

  // Initialize empty progress for all books
  const bookProgress = {};
  const chapterProgress = {};

  BIBLE_BOOKS.forEach(book => {
    bookProgress[book.name] = {
      chaptersRead: 0,
      totalChapters: book.chapters,
      percentage: 0,
      lastReadDate: null
    };
    chapterProgress[book.name] = Array(book.chapters).fill(false);
  });

  return {
    readingEvents: [],
    bookProgress,
    chapterProgress
  };
};

export const BibleProgressProvider = ({ children }) => {
  const [progressData, setProgressData] = useState(getInitialState);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
  }, [progressData]);

  /**
   * Log a reading event
   * @param {string} reference - e.g., "John 3:16" or "John 3" or "John 3:1-21"
   * @param {string} type - "chapter" | "verse_range" | "manual"
   */
  const logReading = useCallback((reference, type = 'manual') => {
    const parsed = parseReference(reference);

    if (!parsed) {
      console.error('Invalid reference:', reference);
      return;
    }

    const { book, chapter } = parsed;
    const timestamp = new Date().toISOString();

    setProgressData(prev => {
      const newData = { ...prev };

      // Add reading event
      const event = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        reference,
        book,
        chapter,
        timestamp,
        type
      };
      newData.readingEvents = [...prev.readingEvents, event];

      // Update chapter progress (mark as read if not already)
      const chapterIndex = chapter - 1; // chapters are 1-indexed
      const bookChapterProgress = [...prev.chapterProgress[book]];

      if (!bookChapterProgress[chapterIndex]) {
        bookChapterProgress[chapterIndex] = true;

        // Recalculate book progress
        const chaptersRead = bookChapterProgress.filter(Boolean).length;
        const bookInfo = getBookByName(book);
        const totalChapters = bookInfo.chapters;
        const percentage = Math.round((chaptersRead / totalChapters) * 100);

        newData.bookProgress = {
          ...prev.bookProgress,
          [book]: {
            chaptersRead,
            totalChapters,
            percentage,
            lastReadDate: timestamp
          }
        };

        newData.chapterProgress = {
          ...prev.chapterProgress,
          [book]: bookChapterProgress
        };
      }

      return newData;
    });

    return parsed;
  }, []);

  /**
   * Mark a chapter as read manually
   */
  const markChapterRead = useCallback((bookName, chapterNumber) => {
    const reference = `${bookName} ${chapterNumber}`;
    return logReading(reference, 'manual');
  }, [logReading]);

  /**
   * Mark a chapter as unread
   */
  const markChapterUnread = useCallback((bookName, chapterNumber) => {
    setProgressData(prev => {
      const newData = { ...prev };
      const chapterIndex = chapterNumber - 1;

      // Update chapter progress
      const bookChapterProgress = [...prev.chapterProgress[bookName]];
      bookChapterProgress[chapterIndex] = false;

      // Recalculate book progress
      const chaptersRead = bookChapterProgress.filter(Boolean).length;
      const bookInfo = getBookByName(bookName);
      const totalChapters = bookInfo.chapters;
      const percentage = Math.round((chaptersRead / totalChapters) * 100);

      newData.bookProgress = {
        ...prev.bookProgress,
        [bookName]: {
          chaptersRead,
          totalChapters,
          percentage,
          lastReadDate: chaptersRead > 0 ? prev.bookProgress[bookName].lastReadDate : null
        }
      };

      newData.chapterProgress = {
        ...prev.chapterProgress,
        [bookName]: bookChapterProgress
      };

      return newData;
    });
  }, []);

  /**
   * Get progress for a specific book
   */
  const getBookProgress = useCallback((bookName) => {
    return {
      ...progressData.bookProgress[bookName],
      chapters: progressData.chapterProgress[bookName]
    };
  }, [progressData]);

  /**
   * Get overall progress statistics
   */
  const getOverallProgress = useCallback(() => {
    let totalChapters = 0;
    let totalRead = 0;

    BIBLE_BOOKS.forEach(book => {
      totalChapters += book.chapters;
      totalRead += progressData.bookProgress[book.name].chaptersRead;
    });

    const oldTestamentBooks = BIBLE_BOOKS.filter(b => b.testament === 'old');
    const newTestamentBooks = BIBLE_BOOKS.filter(b => b.testament === 'new');

    const oldTestamentRead = oldTestamentBooks.reduce((sum, book) =>
      sum + progressData.bookProgress[book.name].chaptersRead, 0
    );
    const oldTestamentTotal = oldTestamentBooks.reduce((sum, book) =>
      sum + book.chapters, 0
    );

    const newTestamentRead = newTestamentBooks.reduce((sum, book) =>
      sum + progressData.bookProgress[book.name].chaptersRead, 0
    );
    const newTestamentTotal = newTestamentBooks.reduce((sum, book) =>
      sum + book.chapters, 0
    );

    return {
      totalChapters,
      totalRead,
      percentage: Math.round((totalRead / totalChapters) * 100),
      oldTestament: {
        read: oldTestamentRead,
        total: oldTestamentTotal,
        percentage: Math.round((oldTestamentRead / oldTestamentTotal) * 100)
      },
      newTestament: {
        read: newTestamentRead,
        total: newTestamentTotal,
        percentage: Math.round((newTestamentRead / newTestamentTotal) * 100)
      },
      booksStarted: BIBLE_BOOKS.filter(book =>
        progressData.bookProgress[book.name].chaptersRead > 0
      ).length,
      booksCompleted: BIBLE_BOOKS.filter(book =>
        progressData.bookProgress[book.name].percentage === 100
      ).length
    };
  }, [progressData]);

  /**
   * Get next unread chapter in a book
   */
  const getNextUnreadChapter = useCallback((bookName) => {
    const chapters = progressData.chapterProgress[bookName];
    const firstUnread = chapters.findIndex(isRead => !isRead);
    return firstUnread === -1 ? null : firstUnread + 1; // convert to 1-indexed
  }, [progressData]);

  /**
   * Get next unread chapter across the entire Bible
   */
  const getNextUnreadChapterGlobal = useCallback(() => {
    for (const book of BIBLE_BOOKS) {
      const nextChapter = getNextUnreadChapter(book.name);
      if (nextChapter !== null) {
        return {
          book: book.name,
          chapter: nextChapter,
          reference: `${book.name} ${nextChapter}`
        };
      }
    }
    return null; // Entire Bible read!
  }, [getNextUnreadChapter]);

  /**
   * Get recent reading activity
   */
  const getRecentActivity = useCallback((limit = 10) => {
    return [...progressData.readingEvents]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }, [progressData]);

  /**
   * Get books by progress level
   */
  const getBooksByProgress = useCallback((minPercentage = 0, maxPercentage = 100) => {
    return BIBLE_BOOKS.filter(book => {
      const progress = progressData.bookProgress[book.name].percentage;
      return progress >= minPercentage && progress <= maxPercentage;
    });
  }, [progressData]);

  /**
   * Reset all progress (with confirmation in UI)
   */
  const resetProgress = useCallback(() => {
    setProgressData(getInitialState());
  }, []);

  const value = {
    // State
    progressData,

    // Actions
    logReading,
    markChapterRead,
    markChapterUnread,
    resetProgress,

    // Getters
    getBookProgress,
    getOverallProgress,
    getNextUnreadChapter,
    getNextUnreadChapterGlobal,
    getRecentActivity,
    getBooksByProgress
  };

  return (
    <BibleProgressContext.Provider value={value}>
      {children}
    </BibleProgressContext.Provider>
  );
};

export const useBibleProgress = () => {
  const context = useContext(BibleProgressContext);
  if (!context) {
    throw new Error('useBibleProgress must be used within BibleProgressProvider');
  }
  return context;
};

export default BibleProgressContext;
