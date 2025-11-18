/**
 * Tagging Taxonomy Service
 *
 * Provides API functions for managing topic and theme tags.
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
 * List all tags
 * @param {Object} filters - Optional filters { parentId, search }
 * @returns {Promise<Array>} Array of tags
 */
export const listTags = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.parentId !== undefined) {
      params.append('parentId', filters.parentId || '');
    }
    if (filters.search) {
      params.append('search', filters.search);
    }

    const response = await axios.get(`${API_URL}/taxonomy?${params.toString()}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
};

/**
 * Search tags by name or description
 * @param {string} query - Search query
 * @param {number} limit - Maximum results to return
 * @returns {Promise<Array>} Array of matching tags
 */
export const searchTags = async (query, limit = 20) => {
  try {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit.toString());

    const response = await axios.get(`${API_URL}/taxonomy/search?${params.toString()}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error searching tags:', error);
    throw error;
  }
};

/**
 * Get taxonomy hierarchy (tree structure)
 * @returns {Promise<Array>} Hierarchical array of tags
 */
export const getTaxonomyHierarchy = async () => {
  try {
    const response = await axios.get(`${API_URL}/taxonomy/hierarchy`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching taxonomy hierarchy:', error);
    throw error;
  }
};

/**
 * Get a specific tag by ID
 * @param {string} tagId - Tag ID
 * @returns {Promise<Object>} Tag object
 */
export const getTag = async (tagId) => {
  try {
    const response = await axios.get(`${API_URL}/taxonomy/${tagId}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching tag:', error);
    throw error;
  }
};

/**
 * Create a new tag (admin only)
 * @param {Object} tagData - Tag data { name, slug?, description?, color?, icon?, parentTagId?, isPublic?, order? }
 * @returns {Promise<Object>} Created tag
 */
export const createTag = async (tagData) => {
  try {
    const response = await axios.post(`${API_URL}/taxonomy`, tagData, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error creating tag:', error);
    throw error;
  }
};

/**
 * Update a tag (admin only)
 * @param {string} tagId - Tag ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated tag
 */
export const updateTag = async (tagId, updates) => {
  try {
    const response = await axios.patch(`${API_URL}/taxonomy/${tagId}`, updates, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error updating tag:', error);
    throw error;
  }
};

/**
 * Delete a tag (admin only)
 * @param {string} tagId - Tag ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteTag = async (tagId) => {
  try {
    const response = await axios.delete(`${API_URL}/taxonomy/${tagId}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw error;
  }
};

/**
 * Add tag to a lesson (admin only)
 * @param {string} tagId - Tag ID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Object>} Association result
 */
export const addTagToLesson = async (tagId, lessonId) => {
  try {
    const response = await axios.post(
      `${API_URL}/taxonomy/${tagId}/lesson/${lessonId}`,
      {},
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error adding tag to lesson:', error);
    throw error;
  }
};

/**
 * Remove tag from a lesson (admin only)
 * @param {string} tagId - Tag ID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Object>} Result
 */
export const removeTagFromLesson = async (tagId, lessonId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/taxonomy/${tagId}/lesson/${lessonId}`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error removing tag from lesson:', error);
    throw error;
  }
};

/**
 * Add tag to a theme (admin only)
 * @param {string} tagId - Tag ID
 * @param {string} themeId - Theme ID
 * @returns {Promise<Object>} Association result
 */
export const addTagToTheme = async (tagId, themeId) => {
  try {
    const response = await axios.post(
      `${API_URL}/taxonomy/${tagId}/theme/${themeId}`,
      {},
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error adding tag to theme:', error);
    throw error;
  }
};

/**
 * Remove tag from a theme (admin only)
 * @param {string} tagId - Tag ID
 * @param {string} themeId - Theme ID
 * @returns {Promise<Object>} Result
 */
export const removeTagFromTheme = async (tagId, themeId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/taxonomy/${tagId}/theme/${themeId}`,
      {
        headers: getAuthHeader(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error removing tag from theme:', error);
    throw error;
  }
};

/**
 * Get all tags for a specific lesson
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Array>} Array of tags
 */
export const getLessonTags = async (lessonId) => {
  try {
    const response = await axios.get(`${API_URL}/taxonomy/lesson/${lessonId}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching lesson tags:', error);
    throw error;
  }
};

/**
 * Get all tags for a specific theme
 * @param {string} themeId - Theme ID
 * @returns {Promise<Array>} Array of tags
 */
export const getThemeTags = async (themeId) => {
  try {
    const response = await axios.get(`${API_URL}/taxonomy/theme/${themeId}`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching theme tags:', error);
    throw error;
  }
};

/**
 * Get metrics for a specific tag (admin only)
 * @param {string} tagId - Tag ID
 * @returns {Promise<Object>} Metrics data
 */
export const getTagMetrics = async (tagId) => {
  try {
    const response = await axios.get(`${API_URL}/taxonomy/${tagId}/metrics`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching tag metrics:', error);
    throw error;
  }
};

/**
 * Get aggregated metrics summary (admin only)
 * @returns {Promise<Object>} Metrics summary
 */
export const getTagMetricsSummary = async () => {
  try {
    const response = await axios.get(`${API_URL}/taxonomy/admin/metrics/summary`, {
      headers: getAuthHeader(),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching metrics summary:', error);
    throw error;
  }
};

/**
 * Predefined tag icon options
 */
export const TAG_ICONS = [
  'book',
  'heart',
  'star',
  'cross',
  'dove',
  'crown',
  'shield',
  'light',
  'anchor',
  'tree',
  'fire',
  'water',
  'mountain',
  'key',
  'compass',
];

/**
 * Predefined color palette for tags
 */
export const TAG_COLORS = [
  '#4A90E2', // Blue
  '#7ED321', // Green
  '#F5A623', // Orange
  '#D0021B', // Red
  '#9013FE', // Purple
  '#50E3C2', // Teal
  '#BD10E0', // Magenta
  '#4A4A4A', // Dark Gray
  '#B8E986', // Light Green
  '#F8E71C', // Yellow
  '#8B572A', // Brown
  '#417505', // Dark Green
];
