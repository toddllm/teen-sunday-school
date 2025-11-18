import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const IcebreakerContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const useIcebreakers = () => {
  const context = useContext(IcebreakerContext);
  if (!context) {
    throw new Error('useIcebreakers must be used within an IcebreakerProvider');
  }
  return context;
};

export const IcebreakerProvider = ({ children }) => {
  const [icebreakers, setIcebreakers] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, accessToken } = useAuth();

  // Fetch icebreakers when user changes
  useEffect(() => {
    if (user && user.organizationId) {
      fetchIcebreakers();
    } else {
      // Fallback to localStorage if no user/API
      loadFromLocalStorage();
    }
  }, [user]);

  // Fetch icebreakers from API
  const fetchIcebreakers = async (filters = {}) => {
    if (!user || !user.organizationId) {
      loadFromLocalStorage();
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams(filters).toString();
      const url = `${API_URL}/api/orgs/${user.organizationId}/icebreakers${params ? `?${params}` : ''}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setIcebreakers(response.data.icebreakers || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching icebreakers:', err);
      setError('Failed to load icebreakers');
      // Fallback to localStorage on error
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  // Fetch favorites
  const fetchFavorites = async () => {
    if (!user || !accessToken) return;

    try {
      const response = await axios.get(`${API_URL}/api/icebreakers/favorites/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setFavorites(response.data.icebreakers || []);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  // Load from localStorage (fallback)
  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('sunday-school-icebreakers');
      if (stored) {
        setIcebreakers(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Error loading from localStorage:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save to localStorage (fallback)
  const saveToLocalStorage = (data) => {
    try {
      localStorage.setItem('sunday-school-icebreakers', JSON.stringify(data));
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }
  };

  // Get random icebreaker
  const getRandomIcebreaker = async (filters = {}) => {
    if (!user || !user.organizationId) {
      // Local random selection
      const filtered = icebreakers.filter(ice => {
        return Object.keys(filters).every(key => !filters[key] || ice[key] === filters[key]);
      });
      return filtered[Math.floor(Math.random() * filtered.length)];
    }

    try {
      const params = new URLSearchParams(filters).toString();
      const url = `${API_URL}/api/orgs/${user.organizationId}/icebreakers/random${params ? `?${params}` : ''}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data.icebreaker;
    } catch (err) {
      console.error('Error getting random icebreaker:', err);
      throw err;
    }
  };

  // Get icebreaker by ID
  const getIcebreakerById = async (id) => {
    // Try local cache first
    const local = icebreakers.find(ice => ice.id === id);
    if (local) return local;

    if (!accessToken) return null;

    try {
      const response = await axios.get(`${API_URL}/api/icebreakers/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data.icebreaker;
    } catch (err) {
      console.error('Error getting icebreaker:', err);
      return null;
    }
  };

  // Create icebreaker
  const createIcebreaker = async (data) => {
    if (!user || !user.organizationId) {
      // Fallback to localStorage
      const newIcebreaker = {
        ...data,
        id: `icebreaker-${Date.now()}`,
        organizationId: 'local',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
        favoriteCount: 0,
      };
      const updated = [...icebreakers, newIcebreaker];
      setIcebreakers(updated);
      saveToLocalStorage(updated);
      return newIcebreaker.id;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/orgs/${user.organizationId}/icebreakers`,
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const newIcebreaker = response.data.icebreaker;
      setIcebreakers(prev => [...prev, newIcebreaker]);
      return newIcebreaker.id;
    } catch (err) {
      console.error('Error creating icebreaker:', err);
      throw err;
    }
  };

  // Update icebreaker
  const updateIcebreaker = async (id, updates) => {
    if (!accessToken) {
      // Fallback to localStorage
      const updated = icebreakers.map(ice =>
        ice.id === id
          ? { ...ice, ...updates, updatedAt: new Date().toISOString() }
          : ice
      );
      setIcebreakers(updated);
      saveToLocalStorage(updated);
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/api/icebreakers/${id}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const updatedIcebreaker = response.data.icebreaker;
      setIcebreakers(prev =>
        prev.map(ice => (ice.id === id ? updatedIcebreaker : ice))
      );
    } catch (err) {
      console.error('Error updating icebreaker:', err);
      throw err;
    }
  };

  // Delete icebreaker
  const deleteIcebreaker = async (id) => {
    if (!accessToken) {
      // Fallback to localStorage
      const updated = icebreakers.filter(ice => ice.id !== id);
      setIcebreakers(updated);
      saveToLocalStorage(updated);
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/icebreakers/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setIcebreakers(prev => prev.filter(ice => ice.id !== id));
    } catch (err) {
      console.error('Error deleting icebreaker:', err);
      throw err;
    }
  };

  // Duplicate icebreaker
  const duplicateIcebreaker = async (id) => {
    if (!user || !user.organizationId) {
      // Fallback to localStorage
      const original = icebreakers.find(ice => ice.id === id);
      if (!original) return null;

      const duplicate = {
        ...original,
        id: `icebreaker-${Date.now()}`,
        title: `${original.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
        favoriteCount: 0,
      };
      const updated = [...icebreakers, duplicate];
      setIcebreakers(updated);
      saveToLocalStorage(updated);
      return duplicate.id;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/icebreakers/${id}/duplicate`,
        { orgId: user.organizationId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const duplicate = response.data.icebreaker;
      setIcebreakers(prev => [...prev, duplicate]);
      return duplicate.id;
    } catch (err) {
      console.error('Error duplicating icebreaker:', err);
      throw err;
    }
  };

  // Track usage
  const trackUsage = async (id, lessonId = null, groupId = null) => {
    if (!accessToken) return;

    try {
      await axios.post(
        `${API_URL}/api/icebreakers/${id}/usage`,
        { lessonId, groupId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Update local count
      setIcebreakers(prev =>
        prev.map(ice =>
          ice.id === id ? { ...ice, usageCount: (ice.usageCount || 0) + 1 } : ice
        )
      );
    } catch (err) {
      console.error('Error tracking usage:', err);
    }
  };

  // Toggle favorite
  const toggleFavorite = async (id) => {
    if (!accessToken) return;

    try {
      const response = await axios.post(
        `${API_URL}/api/icebreakers/${id}/favorite`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const { favorited } = response.data;

      // Update local count
      setIcebreakers(prev =>
        prev.map(ice =>
          ice.id === id
            ? {
                ...ice,
                favoriteCount: favorited
                  ? (ice.favoriteCount || 0) + 1
                  : Math.max(0, (ice.favoriteCount || 0) - 1),
              }
            : ice
        )
      );

      // Refresh favorites list
      fetchFavorites();

      return favorited;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      throw err;
    }
  };

  const value = {
    icebreakers,
    favorites,
    loading,
    error,
    fetchIcebreakers,
    fetchFavorites,
    getRandomIcebreaker,
    getIcebreakerById,
    createIcebreaker,
    updateIcebreaker,
    deleteIcebreaker,
    duplicateIcebreaker,
    trackUsage,
    toggleFavorite,
  };

  return (
    <IcebreakerContext.Provider value={value}>
      {children}
    </IcebreakerContext.Provider>
  );
};
