import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import {
  getCurrentWord,
  getWordArchive,
  getWordById,
  trackInteraction,
} from '../services/weeklyWordService';

const WeeklyWordContext = createContext();

export const useWeeklyWord = () => {
  const context = useContext(WeeklyWordContext);
  if (!context) {
    throw new Error('useWeeklyWord must be used within a WeeklyWordProvider');
  }
  return context;
};

export const WeeklyWordProvider = ({ children }) => {
  const [currentWord, setCurrentWord] = useState(null);
  const [archive, setArchive] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Fetch current word
  const fetchCurrentWord = useCallback(async (source = 'today_page') => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCurrentWord(source);
      if (response.success) {
        setCurrentWord(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch current word');
      console.error('Error fetching current word:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch archive
  const fetchArchive = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getWordArchive(page, limit);
      if (response.success) {
        setArchive(response.data.words);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch archive');
      console.error('Error fetching archive:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a specific word by ID
  const fetchWordById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getWordById(id);
      if (response.success) {
        return response.data;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch word');
      console.error('Error fetching word:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Track verse click
  const trackVerseClick = useCallback(async (wordId, verseRef, viewSource) => {
    try {
      await trackInteraction(wordId, 'VERSE_CLICK', verseRef, viewSource);
    } catch (err) {
      console.error('Error tracking verse click:', err);
      // Don't throw - tracking failures shouldn't break the UI
    }
  }, []);

  // Track share
  const trackShare = useCallback(async (wordId, viewSource) => {
    try {
      await trackInteraction(wordId, 'SHARE', null, viewSource);
    } catch (err) {
      console.error('Error tracking share:', err);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    // State
    currentWord,
    archive,
    loading,
    error,
    pagination,

    // Actions
    fetchCurrentWord,
    fetchArchive,
    fetchWordById,
    trackVerseClick,
    trackShare,
    clearError,
  };

  return (
    <WeeklyWordContext.Provider value={value}>
      {children}
    </WeeklyWordContext.Provider>
  );
};
