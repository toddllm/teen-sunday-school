import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const bibleMapAPI = axios.create({
  baseURL: `${API_BASE}/bible`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests if available
bibleMapAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Get all bible locations with optional filters
 * @param {Object} filters - { region, search, isActive }
 */
export const getAllLocations = async (filters = {}) => {
  try {
    const response = await bibleMapAPI.get('/locations', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching bible locations:', error);
    throw error;
  }
};

/**
 * Get a specific bible location by ID
 * @param {string} locationId
 */
export const getLocationById = async (locationId) => {
  try {
    const response = await bibleMapAPI.get(`/locations/${locationId}`);
    return response.data.location;
  } catch (error) {
    console.error(`Error fetching location ${locationId}:`, error);
    throw error;
  }
};

/**
 * Get locations by region
 * @param {string} region
 */
export const getLocationsByRegion = async (region) => {
  try {
    const response = await bibleMapAPI.get(`/locations/region/${region}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching locations for region ${region}:`, error);
    throw error;
  }
};

/**
 * Get locations associated with a lesson
 * @param {string} lessonId
 */
export const getLocationsByLessonId = async (lessonId) => {
  try {
    const response = await bibleMapAPI.get(`/lessons/${lessonId}/locations`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching locations for lesson ${lessonId}:`, error);
    throw error;
  }
};

/**
 * Create a new bible location (requires TEACHER or ORG_ADMIN role)
 * @param {Object} locationData
 */
export const createLocation = async (locationData) => {
  try {
    const response = await bibleMapAPI.post('/locations', locationData);
    return response.data.location;
  } catch (error) {
    console.error('Error creating location:', error);
    throw error;
  }
};

/**
 * Update a bible location (requires TEACHER or ORG_ADMIN role)
 * @param {string} locationId
 * @param {Object} updateData
 */
export const updateLocation = async (locationId, updateData) => {
  try {
    const response = await bibleMapAPI.put(`/locations/${locationId}`, updateData);
    return response.data.location;
  } catch (error) {
    console.error(`Error updating location ${locationId}:`, error);
    throw error;
  }
};

/**
 * Delete a bible location (requires ORG_ADMIN role)
 * @param {string} locationId
 */
export const deleteLocation = async (locationId) => {
  try {
    const response = await bibleMapAPI.delete(`/locations/${locationId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting location ${locationId}:`, error);
    throw error;
  }
};

/**
 * Link a location to a lesson (requires TEACHER or ORG_ADMIN role)
 * @param {string} lessonId
 * @param {string} locationId
 * @param {string} relevance - Optional description of why this location is relevant
 */
export const linkLocationToLesson = async (lessonId, locationId, relevance) => {
  try {
    const response = await bibleMapAPI.post(
      `/lessons/${lessonId}/locations/${locationId}`,
      { relevance }
    );
    return response.data;
  } catch (error) {
    console.error('Error linking location to lesson:', error);
    throw error;
  }
};

/**
 * Unlink a location from a lesson (requires TEACHER or ORG_ADMIN role)
 * @param {string} lessonId
 * @param {string} locationId
 */
export const unlinkLocationFromLesson = async (lessonId, locationId) => {
  try {
    const response = await bibleMapAPI.delete(
      `/lessons/${lessonId}/locations/${locationId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error unlinking location from lesson:', error);
    throw error;
  }
};

/**
 * Track a map interaction
 * @param {string} actionType - 'MAP_VIEW', 'LOCATION_VIEW', 'PASSAGE_CLICK', 'LOCATION_HOVER'
 * @param {string} locationId - Optional location ID
 * @param {Object} metadata - Optional additional data
 */
export const trackMapAction = async (actionType, locationId = null, metadata = null) => {
  try {
    await bibleMapAPI.post('/track', {
      actionType,
      locationId,
      metadata
    });
  } catch (error) {
    // Don't throw - metrics tracking shouldn't break the app
    console.warn('Error tracking map action:', error);
  }
};

/**
 * Get map usage metrics (requires ORG_ADMIN role)
 * @param {Date} startDate - Optional start date
 * @param {Date} endDate - Optional end date
 */
export const getMapMetrics = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();

    const response = await bibleMapAPI.get('/metrics', { params });
    return response.data.metrics;
  } catch (error) {
    console.error('Error fetching map metrics:', error);
    throw error;
  }
};

export default {
  getAllLocations,
  getLocationById,
  getLocationsByRegion,
  getLocationsByLessonId,
  createLocation,
  updateLocation,
  deleteLocation,
  linkLocationToLesson,
  unlinkLocationFromLesson,
  trackMapAction,
  getMapMetrics,
};
