import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const CurriculumContext = createContext();

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const useCurriculum = () => {
  const context = useContext(CurriculumContext);
  if (!context) {
    throw new Error('useCurriculum must be used within a CurriculumProvider');
  }
  return context;
};

export const CurriculumProvider = ({ children }) => {
  const [schedules, setSchedules] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Fetch calendar schedules
  const fetchSchedules = useCallback(async (groupId, startDate, endDate, view = 'month') => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const params = new URLSearchParams({
        groupId,
        startDate: startDate.toISOString(),
        ...(endDate && { endDate: endDate.toISOString() }),
        view,
      });

      const response = await axios.get(
        `${API_BASE_URL}/api/admin/calendar?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSchedules(response.data.schedules);
      return response.data;
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError(err.response?.data?.error || 'Failed to fetch schedules');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch calendar metrics
  const fetchMetrics = useCallback(async (groupId, startDate, endDate) => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const params = new URLSearchParams({
        groupId,
        ...(startDate && { startDate: startDate.toISOString() }),
        ...(endDate && { endDate: endDate.toISOString() }),
      });

      const response = await axios.get(
        `${API_BASE_URL}/api/admin/calendar/metrics?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMetrics(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError(err.response?.data?.error || 'Failed to fetch metrics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Assign a lesson to a date
  const assignLesson = useCallback(async (scheduleData) => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/calendar/assign`,
        scheduleData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Add the new schedule to the local state
      setSchedules(prev => [...prev, response.data.schedule]);
      return response.data.schedule;
    } catch (err) {
      console.error('Error assigning lesson:', err);
      setError(err.response?.data?.error || 'Failed to assign lesson');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a scheduled lesson
  const updateSchedule = useCallback(async (scheduleId, updates) => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await axios.patch(
        `${API_BASE_URL}/api/admin/calendar/${scheduleId}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Update the schedule in local state
      setSchedules(prev =>
        prev.map(schedule =>
          schedule.id === scheduleId ? response.data.schedule : schedule
        )
      );
      return response.data.schedule;
    } catch (err) {
      console.error('Error updating schedule:', err);
      setError(err.response?.data?.error || 'Failed to update schedule');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a scheduled lesson
  const deleteSchedule = useCallback(async (scheduleId) => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      await axios.delete(`${API_BASE_URL}/api/admin/calendar/${scheduleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove the schedule from local state
      setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
    } catch (err) {
      console.error('Error deleting schedule:', err);
      setError(err.response?.data?.error || 'Failed to delete schedule');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get schedule details
  const getSchedule = useCallback(async (scheduleId) => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/calendar/${scheduleId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.schedule;
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError(err.response?.data?.error || 'Failed to fetch schedule');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    schedules,
    metrics,
    loading,
    error,
    fetchSchedules,
    fetchMetrics,
    assignLesson,
    updateSchedule,
    deleteSchedule,
    getSchedule,
  };

  return (
    <CurriculumContext.Provider value={value}>
      {children}
    </CurriculumContext.Provider>
  );
};
