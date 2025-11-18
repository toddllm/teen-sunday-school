/**
 * Parables Explorer Service
 *
 * Provides API functions for accessing biblical parables with interpretation and context.
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
 * List all parables
 * @param {Object} filters - Optional filters { category, search }
 * @returns {Promise<Array>} Array of parables
 */
export const listParables = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }

    const response = await axios.get(`${API_URL}/parables?${params.toString()}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching parables:', error);
    throw error;
  }
};

/**
 * Get a specific parable by ID
 * @param {string} parableId - Parable ID
 * @returns {Promise<Object>} Parable object
 */
export const getParable = async (parableId) => {
  try {
    const response = await axios.get(`${API_URL}/parables/${parableId}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching parable:', error);
    throw error;
  }
};

/**
 * Create a new parable (admin only)
 * @param {Object} parableData - Parable data
 * @returns {Promise<Object>} Created parable
 */
export const createParable = async (parableData) => {
  try {
    const response = await axios.post(`${API_URL}/parables`, parableData, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error creating parable:', error);
    throw error;
  }
};

/**
 * Update a parable (admin only)
 * @param {string} parableId - Parable ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated parable
 */
export const updateParable = async (parableId, updates) => {
  try {
    const response = await axios.patch(`${API_URL}/parables/${parableId}`, updates, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error updating parable:', error);
    throw error;
  }
};

/**
 * Delete a parable (admin only)
 * @param {string} parableId - Parable ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteParable = async (parableId) => {
  try {
    const response = await axios.delete(`${API_URL}/parables/${parableId}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting parable:', error);
    throw error;
  }
};

/**
 * Record a parable view for metrics
 * @param {string} parableId - Parable ID
 * @param {Object} viewData - View metadata { featureContext, timeSpentMs, usedInLesson, lessonId }
 * @returns {Promise<Object>} Result
 */
export const recordParableView = async (parableId, viewData = {}) => {
  try {
    const response = await axios.post(
      `${API_URL}/parables/${parableId}/view`,
      viewData,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error recording parable view:', error);
    throw error;
  }
};

/**
 * Get metrics for a parable (admin only)
 * @param {string} parableId - Parable ID
 * @param {Object} options - Query options { startDate, endDate, limit, offset }
 * @returns {Promise<Object>} Metrics data
 */
export const getParableMetrics = async (parableId, options = {}) => {
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
      `${API_URL}/parables/${parableId}/metrics?${params.toString()}`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching parable metrics:', error);
    throw error;
  }
};

/**
 * Get aggregated metrics summary (admin only)
 * @param {Object} options - Query options { startDate, endDate }
 * @returns {Promise<Object>} Metrics summary
 */
export const getParableMetricsSummary = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.startDate) {
      params.append('startDate', options.startDate);
    }
    if (options.endDate) {
      params.append('endDate', options.endDate);
    }

    const response = await axios.get(
      `${API_URL}/parables/metrics/summary?${params.toString()}`,
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
 * Predefined parable categories
 */
export const PARABLE_CATEGORIES = [
  'Kingdom of God',
  'Grace and Forgiveness',
  'Judgment and Accountability',
  'Faith and Trust',
  'Stewardship',
  'Prayer',
  'Love and Compassion',
  'Discipleship',
  'Humility',
  'Wisdom',
  'Preparation',
  'Perseverance',
];
