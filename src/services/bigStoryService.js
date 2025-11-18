/**
 * Big Story Service
 *
 * Provides API functions for accessing the Big Story Overview (Creation → New Creation).
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
 * List all big story sections
 * @param {Object} filters - Optional filters { timelineEra, search }
 * @returns {Promise<Array>} Array of sections
 */
export const listSections = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.timelineEra) {
      params.append('timelineEra', filters.timelineEra);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }

    const response = await axios.get(`${API_URL}/big-story?${params.toString()}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching big story sections:', error);
    throw error;
  }
};

/**
 * Get a specific section by ID or slug
 * @param {string} sectionIdOrSlug - Section ID or slug
 * @returns {Promise<Object>} Section object
 */
export const getSection = async (sectionIdOrSlug) => {
  try {
    const response = await axios.get(`${API_URL}/big-story/${sectionIdOrSlug}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching section:', error);
    throw error;
  }
};

/**
 * Create a new big story section (admin only)
 * @param {Object} sectionData - Section data
 * @returns {Promise<Object>} Created section
 */
export const createSection = async (sectionData) => {
  try {
    const response = await axios.post(`${API_URL}/big-story`, sectionData, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error creating section:', error);
    throw error;
  }
};

/**
 * Update a section (admin only)
 * @param {string} sectionId - Section ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated section
 */
export const updateSection = async (sectionId, updates) => {
  try {
    const response = await axios.patch(`${API_URL}/big-story/${sectionId}`, updates, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error updating section:', error);
    throw error;
  }
};

/**
 * Delete a section (admin only)
 * @param {string} sectionId - Section ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteSection = async (sectionId) => {
  try {
    const response = await axios.delete(`${API_URL}/big-story/${sectionId}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting section:', error);
    throw error;
  }
};

/**
 * Record a section view for metrics
 * @param {string} sectionId - Section ID
 * @param {Object} viewData - View metadata { featureContext, timeSpentMs, usedInLesson, lessonId }
 * @returns {Promise<Object>} Result
 */
export const recordSectionView = async (sectionId, viewData = {}) => {
  try {
    const response = await axios.post(
      `${API_URL}/big-story/${sectionId}/view`,
      viewData,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error recording section view:', error);
    throw error;
  }
};

/**
 * Get metrics for a section (admin only)
 * @param {string} sectionId - Section ID
 * @param {Object} options - Query options { startDate, endDate, limit, offset }
 * @returns {Promise<Object>} Metrics data
 */
export const getSectionMetrics = async (sectionId, options = {}) => {
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
      `${API_URL}/big-story/${sectionId}/metrics?${params.toString()}`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching section metrics:', error);
    throw error;
  }
};

/**
 * Get aggregated metrics summary (admin only)
 * @param {Object} options - Query options { startDate, endDate }
 * @returns {Promise<Object>} Metrics summary
 */
export const getSectionMetricsSummary = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.startDate) {
      params.append('startDate', options.startDate);
    }
    if (options.endDate) {
      params.append('endDate', options.endDate);
    }

    const response = await axios.get(
      `${API_URL}/big-story/metrics/summary?${params.toString()}`,
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
 * Timeline eras for filtering
 */
export const TIMELINE_ERAS = [
  'Beginning',
  'Old Testament',
  'Gospels',
  'Church Age',
  'Future',
];
