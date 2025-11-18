import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3014/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (updates) => {
    const response = await api.put('/auth/me', updates);
    return response.data;
  }
};

// Today Screen API
export const todayAPI = {
  getTodayScreen: async () => {
    const response = await api.get('/me/today-screen');
    return response.data;
  },

  getVerseOfDay: async () => {
    const response = await api.get('/me/verse-of-the-day');
    return response.data;
  },

  getCurrentPlan: async () => {
    const response = await api.get('/me/current-plan');
    return response.data;
  }
};

// Reading Plans API
export const plansAPI = {
  getPlans: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/plans?${params}`);
    return response.data;
  },

  getPlan: async (id) => {
    const response = await api.get(`/plans/${id}`);
    return response.data;
  },

  enrollPlan: async (id) => {
    const response = await api.post(`/plans/${id}/enroll`);
    return response.data;
  },

  completeDay: async (id, data) => {
    const response = await api.post(`/plans/${id}/complete-day`, data);
    return response.data;
  },

  getProgress: async (id) => {
    const response = await api.get(`/plans/${id}/progress`);
    return response.data;
  },

  getUserPlans: async () => {
    const response = await api.get('/plans/my-plans');
    return response.data;
  }
};

export default api;
