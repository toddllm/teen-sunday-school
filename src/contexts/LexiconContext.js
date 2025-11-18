/**
 * LexiconContext
 *
 * Manages state for the Original Language Tools feature including:
 * - User's lexeme lookup history
 * - Favorite/bookmarked lexemes
 * - Analytics tracking
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLexemeById } from '../services/lexiconAPI';

const LexiconContext = createContext();

export const useLexicon = () => {
  const context = useContext(LexiconContext);
  if (!context) {
    throw new Error('useLexicon must be used within a LexiconProvider');
  }
  return context;
};

export const LexiconProvider = ({ children }) => {
  // State for lexeme lookup history
  const [lookupHistory, setLookupHistory] = useState([]);

  // State for bookmarked/favorite lexemes
  const [bookmarkedLexemes, setBookmarkedLexemes] = useState([]);

  // State for analytics
  const [analytics, setAnalytics] = useState({
    totalLookups: 0,
    uniqueLexemes: new Set(),
    lastLookup: null,
    mostLookedUpLexeme: null
  });

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('lexiconHistory');
      if (storedHistory) {
        setLookupHistory(JSON.parse(storedHistory));
      }

      const storedBookmarks = localStorage.getItem('lexiconBookmarks');
      if (storedBookmarks) {
        setBookmarkedLexemes(JSON.parse(storedBookmarks));
      }

      const storedAnalytics = localStorage.getItem('lexiconAnalytics');
      if (storedAnalytics) {
        const parsed = JSON.parse(storedAnalytics);
        // Convert uniqueLexemes array back to Set
        parsed.uniqueLexemes = new Set(parsed.uniqueLexemes || []);
        setAnalytics(parsed);
      }
    } catch (error) {
      console.error('Error loading lexicon data from localStorage:', error);
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('lexiconHistory', JSON.stringify(lookupHistory));
    } catch (error) {
      console.error('Error saving lexicon history:', error);
    }
  }, [lookupHistory]);

  // Save bookmarks to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('lexiconBookmarks', JSON.stringify(bookmarkedLexemes));
    } catch (error) {
      console.error('Error saving lexicon bookmarks:', error);
    }
  }, [bookmarkedLexemes]);

  // Save analytics to localStorage when they change
  useEffect(() => {
    try {
      const analyticsToStore = {
        ...analytics,
        uniqueLexemes: Array.from(analytics.uniqueLexemes) // Convert Set to Array for JSON
      };
      localStorage.setItem('lexiconAnalytics', JSON.stringify(analyticsToStore));
    } catch (error) {
      console.error('Error saving lexicon analytics:', error);
    }
  }, [analytics]);

  /**
   * Record a lexeme lookup
   * @param {string} strongsNumber - Strong's number of the looked-up lexeme
   * @param {string} verseRef - Verse reference where the word was clicked
   * @param {string} word - The actual word that was clicked
   */
  const recordLookup = (strongsNumber, verseRef, word) => {
    const lexeme = getLexemeById(strongsNumber);
    if (!lexeme) return;

    const lookupEntry = {
      id: `lookup-${Date.now()}`,
      strongsNumber,
      lemma: lexeme.lemma,
      transliteration: lexeme.transliteration,
      primaryGloss: lexeme.primaryGloss,
      language: lexeme.language,
      verseRef,
      word,
      timestamp: new Date().toISOString()
    };

    // Add to history (keep last 100 entries)
    setLookupHistory(prev => {
      const newHistory = [lookupEntry, ...prev];
      return newHistory.slice(0, 100);
    });

    // Update analytics
    setAnalytics(prev => {
      const newUniqueLexemes = new Set(prev.uniqueLexemes);
      newUniqueLexemes.add(strongsNumber);

      // Count occurrences to find most looked-up
      const counts = {};
      [lookupEntry, ...lookupHistory].forEach(entry => {
        counts[entry.strongsNumber] = (counts[entry.strongsNumber] || 0) + 1;
      });

      const mostLookedUp = Object.entries(counts).reduce((max, [key, count]) => {
        return count > (max.count || 0) ? { strongsNumber: key, count } : max;
      }, {});

      return {
        totalLookups: prev.totalLookups + 1,
        uniqueLexemes: newUniqueLexemes,
        lastLookup: lookupEntry,
        mostLookedUpLexeme: mostLookedUp.strongsNumber || null
      };
    });
  };

  /**
   * Toggle bookmark status for a lexeme
   * @param {string} strongsNumber - Strong's number to bookmark/unbookmark
   */
  const toggleBookmark = (strongsNumber) => {
    const lexeme = getLexemeById(strongsNumber);
    if (!lexeme) return;

    const isBookmarked = bookmarkedLexemes.some(b => b.strongsNumber === strongsNumber);

    if (isBookmarked) {
      // Remove bookmark
      setBookmarkedLexemes(prev => prev.filter(b => b.strongsNumber !== strongsNumber));
    } else {
      // Add bookmark
      const bookmark = {
        id: `bookmark-${Date.now()}`,
        strongsNumber,
        lemma: lexeme.lemma,
        transliteration: lexeme.transliteration,
        primaryGloss: lexeme.primaryGloss,
        language: lexeme.language,
        timestamp: new Date().toISOString()
      };
      setBookmarkedLexemes(prev => [...prev, bookmark]);
    }
  };

  /**
   * Check if a lexeme is bookmarked
   * @param {string} strongsNumber - Strong's number to check
   * @returns {boolean}
   */
  const isBookmarked = (strongsNumber) => {
    return bookmarkedLexemes.some(b => b.strongsNumber === strongsNumber);
  };

  /**
   * Clear lookup history
   */
  const clearHistory = () => {
    setLookupHistory([]);
    setAnalytics({
      totalLookups: 0,
      uniqueLexemes: new Set(),
      lastLookup: null,
      mostLookedUpLexeme: null
    });
  };

  /**
   * Remove a specific entry from history
   * @param {string} entryId - ID of the history entry to remove
   */
  const removeFromHistory = (entryId) => {
    setLookupHistory(prev => prev.filter(entry => entry.id !== entryId));
  };

  /**
   * Clear all bookmarks
   */
  const clearBookmarks = () => {
    setBookmarkedLexemes([]);
  };

  /**
   * Get recent lookups (last N entries)
   * @param {number} limit - Number of recent entries to return
   * @returns {Array}
   */
  const getRecentLookups = (limit = 10) => {
    return lookupHistory.slice(0, limit);
  };

  const value = {
    // State
    lookupHistory,
    bookmarkedLexemes,
    analytics,

    // Actions
    recordLookup,
    toggleBookmark,
    isBookmarked,
    clearHistory,
    removeFromHistory,
    clearBookmarks,
    getRecentLookups
  };

  return (
    <LexiconContext.Provider value={value}>
      {children}
    </LexiconContext.Provider>
  );
};

export default LexiconContext;
