import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Weekly Word API Service
 * Handles all API calls for the Weekly Word feature
 */

// Get the current week's word
export const getCurrentWord = async (source = 'today_page') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/weekly-word/current`, {
      params: { source },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching current word:', error);
    throw error;
  }
};

// Get archive of past words
export const getWordArchive = async (page = 1, limit = 20) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/weekly-word/archive`, {
      params: { page, limit },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching word archive:', error);
    throw error;
  }
};

// Get a specific word by ID
export const getWordById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/weekly-word/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching word:', error);
    throw error;
  }
};

// Track an interaction (verse click, share, etc.)
export const trackInteraction = async (wordId, eventType, verseRef = null, viewSource = null) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/weekly-word/${wordId}/track`,
      {
        eventType,
        verseRef,
        viewSource,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error tracking interaction:', error);
    // Don't throw - tracking failures shouldn't break the UI
  }
};

// ============================================================================
// ADMIN FUNCTIONS
// ============================================================================

// Get metrics
export const getWordMetrics = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/weekly-word/admin/metrics`, {
      params: filters,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching metrics:', error);
    throw error;
  }
};

// Create a new word
export const createWord = async (wordData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/weekly-word/admin`,
      wordData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating word:', error);
    throw error;
  }
};

// Update a word
export const updateWord = async (id, wordData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/weekly-word/admin/${id}`,
      wordData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating word:', error);
    throw error;
  }
};

// Delete a word
export const deleteWord = async (id) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/weekly-word/admin/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting word:', error);
    throw error;
  }
};
