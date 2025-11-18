/**
 * Gratitude Service
 *
 * Provides API functions for managing daily gratitude entries.
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
 * List all gratitude entries for the current user
 * @param {Object} options - Optional filters { limit, offset, startDate, endDate }
 * @returns {Promise<Object>} Object with entries and pagination info
 */
export const listEntries = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.limit) {
      params.append('limit', options.limit.toString());
    }
    if (options.offset) {
      params.append('offset', options.offset.toString());
    }
    if (options.startDate) {
      params.append('startDate', options.startDate);
    }
    if (options.endDate) {
      params.append('endDate', options.endDate);
    }

    const response = await axios.get(`${API_URL}/gratitude?${params.toString()}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching gratitude entries:', error);
    throw error;
  }
};

/**
 * Get today's gratitude entry
 * @returns {Promise<Object>} Today's entry or null
 */
export const getTodayEntry = async () => {
  try {
    const response = await axios.get(`${API_URL}/gratitude/today`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error('Error fetching today\'s entry:', error);
    throw error;
  }
};

/**
 * Get gratitude statistics for the current user
 * @returns {Promise<Object>} Stats object with totalEntries, currentStreak, longestStreak, etc.
 */
export const getStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/gratitude/stats`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching gratitude stats:', error);
    throw error;
  }
};

/**
 * Get a specific gratitude entry by ID
 * @param {string} entryId - Entry ID
 * @returns {Promise<Object>} Entry object
 */
export const getEntry = async (entryId) => {
  try {
    const response = await axios.get(`${API_URL}/gratitude/${entryId}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching gratitude entry:', error);
    throw error;
  }
};

/**
 * Create a new gratitude entry
 * @param {Object} entryData - Entry data { gratitudeText, mood?, category?, entryDate? }
 * @returns {Promise<Object>} Created entry
 */
export const createEntry = async (entryData) => {
  try {
    const response = await axios.post(`${API_URL}/gratitude`, entryData, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error creating gratitude entry:', error);
    throw error;
  }
};

/**
 * Update a gratitude entry
 * @param {string} entryId - Entry ID
 * @param {Object} updates - Fields to update { gratitudeText?, mood?, category? }
 * @returns {Promise<Object>} Updated entry
 */
export const updateEntry = async (entryId, updates) => {
  try {
    const response = await axios.patch(`${API_URL}/gratitude/${entryId}`, updates, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error updating gratitude entry:', error);
    throw error;
  }
};

/**
 * Delete a gratitude entry
 * @param {string} entryId - Entry ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteEntry = async (entryId) => {
  try {
    const response = await axios.delete(`${API_URL}/gratitude/${entryId}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting gratitude entry:', error);
    throw error;
  }
};

/**
 * Predefined mood options
 */
export const MOOD_OPTIONS = [
  'grateful',
  'blessed',
  'joyful',
  'peaceful',
  'hopeful',
  'content',
  'thankful',
];

/**
 * Predefined category options
 */
export const CATEGORY_OPTIONS = [
  'faith',
  'family',
  'friends',
  'health',
  'school',
  'church',
  'answered-prayer',
  'provision',
  'growth',
  'other',
];
