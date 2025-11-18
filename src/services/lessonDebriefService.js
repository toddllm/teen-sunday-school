/**
 * Lesson Debrief Service
 *
 * Provides API functions for managing lesson debriefs.
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Create a new lesson debrief
 * @param {string} lessonId - The lesson ID
 * @param {object} data - Debrief data { notes, sessionDate?, groupId? }
 * @returns {Promise<object>} Created debrief
 */
export const createDebrief = async (lessonId, data) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/lessons/${lessonId}/debriefs`,
      data
    );
    return { success: true, debrief: response.data.debrief };
  } catch (error) {
    console.error('Failed to create debrief:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to create debrief',
    };
  }
};

/**
 * Get all debriefs for a lesson
 * @param {string} lessonId - The lesson ID
 * @param {object} filters - Optional filters { authorId?, groupId?, startDate?, endDate? }
 * @returns {Promise<object>} List of debriefs
 */
export const getDebriefs = async (lessonId, filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.authorId) params.append('authorId', filters.authorId);
    if (filters.groupId) params.append('groupId', filters.groupId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString();
    const url = queryString
      ? `${API_URL}/api/lessons/${lessonId}/debriefs?${queryString}`
      : `${API_URL}/api/lessons/${lessonId}/debriefs`;

    const response = await axios.get(url);
    return { success: true, debriefs: response.data.debriefs };
  } catch (error) {
    console.error('Failed to fetch debriefs:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch debriefs',
    };
  }
};

/**
 * Get a single debrief by ID
 * @param {string} debriefId - The debrief ID
 * @returns {Promise<object>} Debrief details
 */
export const getDebrief = async (debriefId) => {
  try {
    const response = await axios.get(`${API_URL}/api/debriefs/${debriefId}`);
    return { success: true, debrief: response.data.debrief };
  } catch (error) {
    console.error('Failed to fetch debrief:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch debrief',
    };
  }
};

/**
 * Update a debrief
 * @param {string} debriefId - The debrief ID
 * @param {object} data - Updated data { notes?, sessionDate?, groupId? }
 * @returns {Promise<object>} Updated debrief
 */
export const updateDebrief = async (debriefId, data) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/debriefs/${debriefId}`,
      data
    );
    return { success: true, debrief: response.data.debrief };
  } catch (error) {
    console.error('Failed to update debrief:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to update debrief',
    };
  }
};

/**
 * Delete a debrief
 * @param {string} debriefId - The debrief ID
 * @returns {Promise<object>} Success status
 */
export const deleteDebrief = async (debriefId) => {
  try {
    await axios.delete(`${API_URL}/api/debriefs/${debriefId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete debrief:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to delete debrief',
    };
  }
};

/**
 * Format a debrief for display
 * @param {object} debrief
 * @returns {object} Formatted debrief
 */
export const formatDebrief = (debrief) => {
  return {
    ...debrief,
    authorName: `${debrief.author.firstName} ${debrief.author.lastName}`,
    formattedDate: debrief.sessionDate
      ? new Date(debrief.sessionDate).toLocaleDateString()
      : 'No date',
    formattedCreatedAt: new Date(debrief.createdAt).toLocaleDateString(),
  };
};

const lessonDebriefService = {
  createDebrief,
  getDebriefs,
  getDebrief,
  updateDebrief,
  deleteDebrief,
  formatDebrief,
};

export default lessonDebriefService;
