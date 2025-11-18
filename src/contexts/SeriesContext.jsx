import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

const SeriesContext = createContext();

export function SeriesProvider({ children }) {
  const { accessToken, user } = useAuth();
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  // Fetch all series
  const fetchSeries = useCallback(async (filters = {}) => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${API_URL}/api/series${queryParams ? `?${queryParams}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch series');
      }

      const data = await response.json();
      setSeries(data.series || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching series:', err);
    } finally {
      setLoading(false);
    }
  }, [accessToken, API_URL]);

  // Get series by ID
  const getSeriesById = useCallback(async (id) => {
    if (!accessToken) return null;

    try {
      const response = await fetch(`${API_URL}/api/series/${id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch series');
      }

      const data = await response.json();
      return data.series;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching series:', err);
      return null;
    }
  }, [accessToken, API_URL]);

  // Create series
  const createSeries = useCallback(async (seriesData) => {
    if (!accessToken) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/admin/series`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(seriesData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create series');
      }

      const data = await response.json();
      setSeries(prev => [data.series, ...prev]);
      return data.series;
    } catch (err) {
      setError(err.message);
      console.error('Error creating series:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accessToken, API_URL]);

  // Update series
  const updateSeries = useCallback(async (id, seriesData) => {
    if (!accessToken) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/admin/series/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(seriesData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update series');
      }

      const data = await response.json();
      setSeries(prev => prev.map(s => s.id === id ? data.series : s));
      return data.series;
    } catch (err) {
      setError(err.message);
      console.error('Error updating series:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accessToken, API_URL]);

  // Update series lessons
  const updateSeriesLessons = useCallback(async (id, lessons) => {
    if (!accessToken) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/admin/series/${id}/lessons`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessons }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update series lessons');
      }

      const data = await response.json();
      setSeries(prev => prev.map(s => s.id === id ? data.series : s));
      return data.series;
    } catch (err) {
      setError(err.message);
      console.error('Error updating series lessons:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accessToken, API_URL]);

  // Delete series
  const deleteSeries = useCallback(async (id) => {
    if (!accessToken) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/admin/series/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete series');
      }

      setSeries(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error deleting series:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accessToken, API_URL]);

  // Complete a lesson in a series
  const completeLesson = useCallback(async (seriesId, lessonId) => {
    if (!accessToken) return null;

    try {
      const response = await fetch(`${API_URL}/api/series/${seriesId}/complete/${lessonId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete lesson');
      }

      const data = await response.json();
      return data.completion;
    } catch (err) {
      setError(err.message);
      console.error('Error completing lesson:', err);
      throw err;
    }
  }, [accessToken, API_URL]);

  // Get series metrics (admin only)
  const getSeriesMetrics = useCallback(async () => {
    if (!accessToken) return null;

    try {
      const response = await fetch(`${API_URL}/api/admin/series/metrics`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const data = await response.json();
      return data.metrics;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching metrics:', err);
      return null;
    }
  }, [accessToken, API_URL]);

  // Fetch series on mount if user is authenticated
  useEffect(() => {
    if (user && accessToken) {
      fetchSeries();
    }
  }, [user, accessToken, fetchSeries]);

  const value = {
    series,
    loading,
    error,
    fetchSeries,
    getSeriesById,
    createSeries,
    updateSeries,
    updateSeriesLessons,
    deleteSeries,
    completeLesson,
    getSeriesMetrics,
  };

  return (
    <SeriesContext.Provider value={value}>
      {children}
    </SeriesContext.Provider>
  );
}

export function useSeries() {
  const context = useContext(SeriesContext);
  if (!context) {
    throw new Error('useSeries must be used within a SeriesProvider');
  }
  return context;
}
