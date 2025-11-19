/**
 * Proverb of the Day Service
 *
 * Provides API functions for accessing daily proverbs with teen applications.
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
 * Get today's proverb
 * @param {Date} date - Optional date (defaults to today)
 * @returns {Promise<Object>} Proverb object
 */
export const getTodaysProverb = async (date = null) => {
  try {
    const params = new URLSearchParams();
    if (date) {
      params.append('date', date.toISOString());
    }

    const response = await axios.get(`${API_URL}/proverbs/today?${params.toString()}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching today\'s proverb:', error);
    throw error;
  }
};

/**
 * Get a random proverb
 * @returns {Promise<Object>} Proverb object
 */
export const getRandomProverb = async () => {
  try {
    const response = await axios.get(`${API_URL}/proverbs/random`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching random proverb:', error);
    throw error;
  }
};

/**
 * List all proverbs
 * @param {Object} options - Optional filters and pagination { category, search, isActive, page, limit }
 * @returns {Promise<Object>} Paginated proverbs data
 */
export const listProverbs = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.category) {
      params.append('category', options.category);
    }
    if (options.search) {
      params.append('search', options.search);
    }
    if (options.isActive !== undefined) {
      params.append('isActive', options.isActive.toString());
    }
    if (options.page) {
      params.append('page', options.page.toString());
    }
    if (options.limit) {
      params.append('limit', options.limit.toString());
    }

    const response = await axios.get(`${API_URL}/proverbs?${params.toString()}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching proverbs:', error);
    throw error;
  }
};

/**
 * Get a specific proverb by ID
 * @param {string} proverbId - Proverb ID
 * @returns {Promise<Object>} Proverb object
 */
export const getProverb = async (proverbId) => {
  try {
    const response = await axios.get(`${API_URL}/proverbs/${proverbId}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching proverb:', error);
    throw error;
  }
};

/**
 * Get proverbs by category
 * @param {string} category - Category name
 * @returns {Promise<Array>} Array of proverbs
 */
export const getProverbsByCategory = async (category) => {
  try {
    const response = await axios.get(`${API_URL}/proverbs/category/${category}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching proverbs by category:', error);
    throw error;
  }
};

/**
 * Create a new proverb (admin/teacher only)
 * @param {Object} proverbData - Proverb data
 * @returns {Promise<Object>} Created proverb
 */
export const createProverb = async (proverbData) => {
  try {
    const response = await axios.post(`${API_URL}/proverbs`, proverbData, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error creating proverb:', error);
    throw error;
  }
};

/**
 * Update a proverb (admin/teacher only)
 * @param {string} proverbId - Proverb ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated proverb
 */
export const updateProverb = async (proverbId, updates) => {
  try {
    const response = await axios.patch(`${API_URL}/proverbs/${proverbId}`, updates, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error updating proverb:', error);
    throw error;
  }
};

/**
 * Delete a proverb (admin only)
 * @param {string} proverbId - Proverb ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteProverb = async (proverbId) => {
  try {
    await axios.delete(`${API_URL}/proverbs/${proverbId}`, {
      headers: getAuthHeader(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting proverb:', error);
    throw error;
  }
};

/**
 * Record a proverb view for engagement metrics
 * @param {string} proverbId - Proverb ID
 * @param {number} timeSpentMs - Time spent viewing in milliseconds
 * @returns {Promise<Object>} Result
 */
export const recordProverbView = async (proverbId, timeSpentMs = null) => {
  try {
    const response = await axios.post(
      `${API_URL}/proverbs/${proverbId}/view`,
      { timeSpentMs },
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error recording proverb view:', error);
    throw error;
  }
};

/**
 * Record a proverb interaction (like, share, bookmark, etc.)
 * @param {string} proverbId - Proverb ID
 * @param {string} interactionType - Type of interaction ('like', 'share', 'save', 'discuss', 'bookmark')
 * @param {Object} data - Optional interaction data { notes, rating }
 * @returns {Promise<Object>} Result
 */
export const recordProverbInteraction = async (proverbId, interactionType, data = {}) => {
  try {
    const response = await axios.post(
      `${API_URL}/proverbs/${proverbId}/interact`,
      {
        interactionType,
        ...data,
      },
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error recording proverb interaction:', error);
    throw error;
  }
};

/**
 * Get engagement statistics for a proverb
 * @param {string} proverbId - Proverb ID
 * @returns {Promise<Object>} Stats object
 */
export const getProverbStats = async (proverbId) => {
  try {
    const response = await axios.get(`${API_URL}/proverbs/${proverbId}/stats`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching proverb stats:', error);
    throw error;
  }
};

/**
 * Predefined proverb categories
 */
export const PROVERB_CATEGORIES = [
  'wisdom',
  'integrity',
  'relationships',
  'work-ethic',
  'speech',
  'money',
  'friendship',
  'family',
  'character',
  'humility',
  'pride',
  'anger',
  'trust',
  'planning',
  'discipline',
  'generosity',
];

/**
 * Reading difficulty levels
 */
export const DIFFICULTY_LEVELS = ['EASY', 'MEDIUM', 'HARD'];

/**
 * Interaction types
 */
export const INTERACTION_TYPES = ['like', 'share', 'save', 'discuss', 'bookmark'];
