/**
 * Doctrine Card Service
 *
 * Provides API functions for accessing simple, non-denominational doctrine overview cards.
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
 * List all doctrine cards
 * @param {Object} filters - Optional filters { category, search }
 * @returns {Promise<Array>} Array of doctrine cards
 */
export const listDoctrineCards = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }

    const response = await axios.get(`${API_URL}/doctrine-cards?${params.toString()}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching doctrine cards:', error);
    throw error;
  }
};

/**
 * Get a specific doctrine card by ID
 * @param {string} cardId - Doctrine card ID
 * @returns {Promise<Object>} Doctrine card object
 */
export const getDoctrineCard = async (cardId) => {
  try {
    const response = await axios.get(`${API_URL}/doctrine-cards/${cardId}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching doctrine card:', error);
    throw error;
  }
};

/**
 * Create a new doctrine card (admin only)
 * @param {Object} cardData - Doctrine card data
 * @returns {Promise<Object>} Created doctrine card
 */
export const createDoctrineCard = async (cardData) => {
  try {
    const response = await axios.post(`${API_URL}/doctrine-cards`, cardData, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error creating doctrine card:', error);
    throw error;
  }
};

/**
 * Update a doctrine card (admin only)
 * @param {string} cardId - Doctrine card ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated doctrine card
 */
export const updateDoctrineCard = async (cardId, updates) => {
  try {
    const response = await axios.patch(`${API_URL}/doctrine-cards/${cardId}`, updates, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error updating doctrine card:', error);
    throw error;
  }
};

/**
 * Delete a doctrine card (admin only)
 * @param {string} cardId - Doctrine card ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteDoctrineCard = async (cardId) => {
  try {
    const response = await axios.delete(`${API_URL}/doctrine-cards/${cardId}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting doctrine card:', error);
    throw error;
  }
};

/**
 * Record a doctrine card view for metrics
 * @param {string} cardId - Doctrine card ID
 * @param {Object} viewData - View metadata { featureContext, timeSpentMs, usedInLesson, lessonId }
 * @returns {Promise<Object>} Result
 */
export const recordDoctrineCardView = async (cardId, viewData = {}) => {
  try {
    const response = await axios.post(
      `${API_URL}/doctrine-cards/${cardId}/view`,
      viewData,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error recording doctrine card view:', error);
    throw error;
  }
};

/**
 * Get metrics for a doctrine card (admin only)
 * @param {string} cardId - Doctrine card ID
 * @param {Object} options - Query options { startDate, endDate, limit, offset }
 * @returns {Promise<Object>} Metrics data
 */
export const getDoctrineCardMetrics = async (cardId, options = {}) => {
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
      `${API_URL}/doctrine-cards/${cardId}/metrics?${params.toString()}`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching doctrine card metrics:', error);
    throw error;
  }
};

/**
 * Get aggregated metrics summary (admin only)
 * @param {Object} options - Query options { startDate, endDate }
 * @returns {Promise<Object>} Metrics summary
 */
export const getDoctrineCardMetricsSummary = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.startDate) {
      params.append('startDate', options.startDate);
    }
    if (options.endDate) {
      params.append('endDate', options.endDate);
    }

    const response = await axios.get(
      `${API_URL}/doctrine-cards/metrics/summary?${params.toString()}`,
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
 * Doctrine categories (matching backend enum)
 */
export const DOCTRINE_CATEGORIES = {
  GOD: 'GOD',
  JESUS_CHRIST: 'JESUS_CHRIST',
  HOLY_SPIRIT: 'HOLY_SPIRIT',
  SCRIPTURE: 'SCRIPTURE',
  SALVATION: 'SALVATION',
  CHURCH: 'CHURCH',
  END_TIMES: 'END_TIMES',
  HUMANITY: 'HUMANITY',
  CHRISTIAN_LIVING: 'CHRISTIAN_LIVING',
};

/**
 * Human-readable category labels
 */
export const DOCTRINE_CATEGORY_LABELS = {
  GOD: 'God',
  JESUS_CHRIST: 'Jesus Christ',
  HOLY_SPIRIT: 'Holy Spirit',
  SCRIPTURE: 'Scripture',
  SALVATION: 'Salvation',
  CHURCH: 'Church',
  END_TIMES: 'End Times',
  HUMANITY: 'Humanity',
  CHRISTIAN_LIVING: 'Christian Living',
};
