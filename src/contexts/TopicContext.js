import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const TopicContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const useTopics = () => {
  const context = useContext(TopicContext);
  if (!context) {
    throw new Error('useTopics must be used within a TopicProvider');
  }
  return context;
};

export const TopicProvider = ({ children }) => {
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all topics
  const fetchTopics = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/topics`, { params });
      setTopics(response.data.topics || []);
      return response.data.topics;
    } catch (err) {
      console.error('Error fetching topics:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/topics/categories`);
      setCategories(response.data.categories || []);
      return response.data.categories;
    } catch (err) {
      console.error('Error fetching categories:', err);
      return [];
    }
  }, []);

  // Get topic by ID
  const getTopic = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API_URL}/topics/${id}`, { headers });
      return response.data.topic;
    } catch (err) {
      console.error('Error fetching topic:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search topics
  const searchTopics = useCallback(async (searchTerm) => {
    return fetchTopics({ search: searchTerm });
  }, [fetchTopics]);

  // Filter topics by category
  const filterByCategory = useCallback(async (category) => {
    return fetchTopics({ category });
  }, [fetchTopics]);

  // Track plan start
  const trackPlanStart = useCallback(async (topicId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('User not authenticated, skipping plan start tracking');
        return;
      }

      await axios.post(
        `${API_URL}/topics/${topicId}/plan-start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Error tracking plan start:', err);
    }
  }, []);

  // Admin functions
  const createTopic = useCallback(async (topicData) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${API_URL}/topics`,
        topicData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchTopics(); // Refresh the list
      return response.data.topic;
    } catch (err) {
      console.error('Error creating topic:', err);
      throw err;
    }
  }, [fetchTopics]);

  const updateTopic = useCallback(async (id, updates) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(
        `${API_URL}/topics/${id}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchTopics(); // Refresh the list
      return response.data.topic;
    } catch (err) {
      console.error('Error updating topic:', err);
      throw err;
    }
  }, [fetchTopics]);

  const deleteTopic = useCallback(async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`${API_URL}/topics/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchTopics(); // Refresh the list
    } catch (err) {
      console.error('Error deleting topic:', err);
      throw err;
    }
  }, [fetchTopics]);

  const addVerse = useCallback(async (topicId, verseData) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${API_URL}/topics/${topicId}/verses`,
        verseData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.verse;
    } catch (err) {
      console.error('Error adding verse:', err);
      throw err;
    }
  }, []);

  const updateVerse = useCallback(async (verseId, updates) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(
        `${API_URL}/topics/verses/${verseId}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.verse;
    } catch (err) {
      console.error('Error updating verse:', err);
      throw err;
    }
  }, []);

  const deleteVerse = useCallback(async (verseId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`${API_URL}/topics/verses/${verseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Error deleting verse:', err);
      throw err;
    }
  }, []);

  const getTopicMetrics = useCallback(async (topicId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/topics/${topicId}/metrics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.metrics;
    } catch (err) {
      console.error('Error fetching topic metrics:', err);
      throw err;
    }
  }, []);

  // Load topics and categories on mount
  useEffect(() => {
    fetchTopics();
    fetchCategories();
  }, [fetchTopics, fetchCategories]);

  const value = {
    topics,
    categories,
    loading,
    error,
    fetchTopics,
    fetchCategories,
    getTopic,
    searchTopics,
    filterByCategory,
    trackPlanStart,
    createTopic,
    updateTopic,
    deleteTopic,
    addVerse,
    updateVerse,
    deleteVerse,
    getTopicMetrics,
  };

  return <TopicContext.Provider value={value}>{children}</TopicContext.Provider>;
};
