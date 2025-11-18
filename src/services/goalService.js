import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
api.interceptors.request.use(
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

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE}/api/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Goal Service
 * Handles all API calls for personal spiritual goals
 */
export const goalService = {
  /**
   * List all user's goals with optional filters
   * @param {Object} filters - { status, category, priority }
   * @returns {Promise<Array>}
   */
  list: async (filters = {}) => {
    try {
      const response = await api.get('/goals', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error listing goals:', error);
      throw error;
    }
  },

  /**
   * Get a specific goal with progress history
   * @param {string} id - Goal ID
   * @returns {Promise<Object>}
   */
  get: async (id) => {
    try {
      const response = await api.get(`/goals/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching goal:', error);
      throw error;
    }
  },

  /**
   * Create a new goal
   * @param {Object} goalData - Goal details
   * @returns {Promise<Object>}
   */
  create: async (goalData) => {
    try {
      const response = await api.post('/goals', goalData);
      return response.data;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  },

  /**
   * Update an existing goal
   * @param {string} id - Goal ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>}
   */
  update: async (id, updates) => {
    try {
      const response = await api.patch(`/goals/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  },

  /**
   * Delete a goal
   * @param {string} id - Goal ID
   * @returns {Promise<Object>}
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/goals/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },

  /**
   * Log progress for a goal
   * @param {string} id - Goal ID
   * @param {Object} progressData - { progress, note }
   * @returns {Promise<Object>}
   */
  logProgress: async (id, progressData) => {
    try {
      const response = await api.post(`/goals/${id}/progress`, progressData);
      return response.data;
    } catch (error) {
      console.error('Error logging progress:', error);
      throw error;
    }
  },

  /**
   * Get progress history for a goal
   * @param {string} id - Goal ID
   * @returns {Promise<Array>}
   */
  getProgress: async (id) => {
    try {
      const response = await api.get(`/goals/${id}/progress`);
      return response.data;
    } catch (error) {
      console.error('Error fetching progress:', error);
      throw error;
    }
  },

  /**
   * Get user's goal statistics
   * @returns {Promise<Object>}
   */
  getStats: async () => {
    try {
      const response = await api.get('/goals/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },
};

export default goalService;
