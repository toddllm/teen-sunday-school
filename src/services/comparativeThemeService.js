/**
 * Comparative Theme Service
 *
 * Provides API functions for accessing OT vs NT theme comparisons.
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
 * List all comparative themes
 * @param {Object} filters - Optional filters { category, search }
 * @returns {Promise<Array>} Array of themes
 */
export const listThemes = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }

    const response = await axios.get(`${API_URL}/themes?${params.toString()}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching themes:', error);
    throw error;
  }
};

/**
 * Get a specific theme by ID
 * @param {string} themeId - Theme ID
 * @returns {Promise<Object>} Theme object
 */
export const getTheme = async (themeId) => {
  try {
    const response = await axios.get(`${API_URL}/themes/${themeId}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching theme:', error);
    throw error;
  }
};

/**
 * Create a new comparative theme (admin only)
 * @param {Object} themeData - Theme data
 * @returns {Promise<Object>} Created theme
 */
export const createTheme = async (themeData) => {
  try {
    const response = await axios.post(`${API_URL}/themes`, themeData, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error creating theme:', error);
    throw error;
  }
};

/**
 * Update a theme (admin only)
 * @param {string} themeId - Theme ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated theme
 */
export const updateTheme = async (themeId, updates) => {
  try {
    const response = await axios.patch(`${API_URL}/themes/${themeId}`, updates, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error updating theme:', error);
    throw error;
  }
};

/**
 * Delete a theme (admin only)
 * @param {string} themeId - Theme ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteTheme = async (themeId) => {
  try {
    const response = await axios.delete(`${API_URL}/themes/${themeId}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting theme:', error);
    throw error;
  }
};

/**
 * Record a theme view for metrics
 * @param {string} themeId - Theme ID
 * @param {Object} viewData - View metadata { featureContext, timeSpentMs, usedInLesson, lessonId }
 * @returns {Promise<Object>} Result
 */
export const recordThemeView = async (themeId, viewData = {}) => {
  try {
    const response = await axios.post(
      `${API_URL}/themes/${themeId}/view`,
      viewData,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error recording theme view:', error);
    throw error;
  }
};

/**
 * Get metrics for a theme (admin only)
 * @param {string} themeId - Theme ID
 * @param {Object} options - Query options { startDate, endDate, limit, offset }
 * @returns {Promise<Object>} Metrics data
 */
export const getThemeMetrics = async (themeId, options = {}) => {
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
      `${API_URL}/themes/${themeId}/metrics?${params.toString()}`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching theme metrics:', error);
    throw error;
  }
};

/**
 * Get aggregated metrics summary (admin only)
 * @param {Object} options - Query options { startDate, endDate }
 * @returns {Promise<Object>} Metrics summary
 */
export const getThemeMetricsSummary = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.startDate) {
      params.append('startDate', options.startDate);
    }
    if (options.endDate) {
      params.append('endDate', options.endDate);
    }

    const response = await axios.get(
      `${API_URL}/themes/metrics/summary?${params.toString()}`,
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
 * Predefined theme categories
 */
export const THEME_CATEGORIES = [
  'covenant',
  'sacrifice',
  'grace',
  'justice',
  'redemption',
  'faith',
  'love',
  'obedience',
  'holiness',
  'prophecy',
  'kingdom',
  'salvation',
];
