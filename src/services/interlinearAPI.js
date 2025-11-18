import axios from 'axios';

// Backend API base URL
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Fetch interlinear data for a specific verse
 * @param {string} verseRef - Verse reference (e.g., "JHN.3.16")
 * @returns {Promise<Object>} Interlinear data with tokens
 */
export const fetchInterlinearVerse = async (verseRef) => {
  try {
    const response = await api.get(`/bible/interlinear/${verseRef}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // Verse not available
    }
    console.error('Error fetching interlinear verse:', error);
    throw error;
  }
};

/**
 * Fetch all key verses with interlinear data
 * @param {string} category - Optional category filter
 * @returns {Promise<Array>} Array of key verses
 */
export const fetchKeyVerses = async (category = null) => {
  try {
    const params = category ? { category } : {};
    const response = await api.get('/bible/interlinear', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching key verses:', error);
    throw error;
  }
};

/**
 * Track user interaction with interlinear data
 * @param {string} verseRef - Verse reference
 * @param {string} action - Action type (view, word_click, copy, etc.)
 * @param {Object} options - Additional tracking options
 */
export const trackInterlinearInteraction = async (verseRef, action, options = {}) => {
  try {
    await api.post(`/bible/interlinear/${verseRef}/track`, {
      action,
      ...options,
    });
  } catch (error) {
    console.error('Error tracking interlinear interaction:', error);
    // Don't throw - tracking failures shouldn't break the UI
  }
};

/**
 * Check if a verse has interlinear data available
 * @param {string} verseRef - Verse reference
 * @returns {Promise<boolean>}
 */
export const hasInterlinearData = async (verseRef) => {
  try {
    const data = await fetchInterlinearVerse(verseRef);
    return !!data;
  } catch (error) {
    return false;
  }
};

export default {
  fetchInterlinearVerse,
  fetchKeyVerses,
  trackInterlinearInteraction,
  hasInterlinearData,
};
