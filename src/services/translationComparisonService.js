/**
 * Translation Comparison Service
 *
 * Provides API functions for accessing teen-friendly translation comparison notes.
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Get authorization header with JWT token
 */
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * List all translation comparison notes
 * @param {Object} filters - Optional filters { category, difficulty, passageRef, search }
 * @returns {Promise<Array>} Array of comparison notes
 */
export const listComparisonNotes = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.difficulty) {
      params.append('difficulty', filters.difficulty);
    }
    if (filters.passageRef) {
      params.append('passageRef', filters.passageRef);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }

    const response = await axios.get(
      `${API_URL}/translation-comparisons?${params.toString()}`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching comparison notes:', error);
    throw error;
  }
};

/**
 * Get a specific comparison note by ID
 * @param {string} noteId - Comparison note ID
 * @returns {Promise<Object>} Comparison note object
 */
export const getComparisonNote = async (noteId) => {
  try {
    const response = await axios.get(
      `${API_URL}/translation-comparisons/${noteId}`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching comparison note:', error);
    throw error;
  }
};

/**
 * Create a new comparison note (admin only)
 * @param {Object} noteData - Comparison note data
 * @returns {Promise<Object>} Created comparison note
 */
export const createComparisonNote = async (noteData) => {
  try {
    const response = await axios.post(
      `${API_URL}/translation-comparisons`,
      noteData,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error creating comparison note:', error);
    throw error;
  }
};

/**
 * Update a comparison note (admin only)
 * @param {string} noteId - Comparison note ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated comparison note
 */
export const updateComparisonNote = async (noteId, updates) => {
  try {
    const response = await axios.patch(
      `${API_URL}/translation-comparisons/${noteId}`,
      updates,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error updating comparison note:', error);
    throw error;
  }
};

/**
 * Delete a comparison note (admin only)
 * @param {string} noteId - Comparison note ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteComparisonNote = async (noteId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/translation-comparisons/${noteId}`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error deleting comparison note:', error);
    throw error;
  }
};

/**
 * Record a comparison note view for metrics
 * @param {string} noteId - Comparison note ID
 * @param {Object} viewData - View metadata { featureContext, timeSpentMs, usedInLesson, lessonId, wasHelpful }
 * @returns {Promise<Object>} Result
 */
export const recordComparisonNoteView = async (noteId, viewData = {}) => {
  try {
    const response = await axios.post(
      `${API_URL}/translation-comparisons/${noteId}/view`,
      viewData,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error recording comparison note view:', error);
    throw error;
  }
};

/**
 * Get metrics for a comparison note (admin only)
 * @param {string} noteId - Comparison note ID
 * @param {Object} options - Query options { startDate, endDate, limit, offset }
 * @returns {Promise<Object>} Metrics data
 */
export const getComparisonNoteMetrics = async (noteId, options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.startDate) {
      params.append('startDate', options.startDate);
    }
    if (options.endDate) {
      params.append('endDate', options.endDate);
    }
    if (options.limit) {
      params.append('limit', options.limit.toString());
    }
    if (options.offset) {
      params.append('offset', options.offset.toString());
    }

    const response = await axios.get(
      `${API_URL}/translation-comparisons/${noteId}/metrics?${params.toString()}`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching comparison note metrics:', error);
    throw error;
  }
};

/**
 * Get aggregated metrics summary (admin only)
 * @param {Object} options - Query options { startDate, endDate }
 * @returns {Promise<Object>} Metrics summary
 */
export const getComparisonNoteMetricsSummary = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.startDate) {
      params.append('startDate', options.startDate);
    }
    if (options.endDate) {
      params.append('endDate', options.endDate);
    }

    const response = await axios.get(
      `${API_URL}/translation-comparisons/metrics/summary?${params.toString()}`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching metrics summary:', error);
    throw error;
  }
};

/**
 * Predefined comparison note categories
 */
export const COMPARISON_CATEGORIES = [
  'word-choice',
  'context',
  'cultural',
  'theological',
  'historical',
  'literary-style',
  'idiom',
  'grammar',
];

/**
 * Difficulty levels
 */
export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];

/**
 * Available Bible translations for comparison
 */
export const AVAILABLE_TRANSLATIONS = [
  { code: 'NIV', name: 'New International Version' },
  { code: 'KJV', name: 'King James Version' },
  { code: 'ESV', name: 'English Standard Version' },
  { code: 'NKJV', name: 'New King James Version' },
  { code: 'NLT', name: 'New Living Translation' },
  { code: 'NASB', name: 'New American Standard Bible' },
  { code: 'MSG', name: 'The Message' },
  { code: 'CSB', name: 'Christian Standard Bible' },
  { code: 'NRSV', name: 'New Revised Standard Version' },
  { code: 'AMP', name: 'Amplified Bible' },
];
