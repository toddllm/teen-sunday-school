import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios';

const AttendanceContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export function AttendanceProvider({ children }) {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [followUpSuggestions, setFollowUpSuggestions] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Record attendance for a single student
  const recordAttendance = async (groupId, userId, classDate, status, notes = '') => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/api/attendance/record`, {
        groupId,
        userId,
        classDate,
        status,
        notes,
      });

      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to record attendance';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Record bulk attendance
  const recordBulkAttendance = async (groupId, classDate, attendanceData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/api/attendance/record-bulk`, {
        groupId,
        classDate,
        attendanceData,
      });

      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to record bulk attendance';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Get attendance records for a group
  const getGroupAttendance = useCallback(async (groupId, startDate = null, endDate = null) => {
    try {
      setLoading(true);
      setError(null);

      let url = `${API_URL}/api/attendance/group/${groupId}`;
      const params = new URLSearchParams();

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      setAttendanceRecords(response.data);

      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch attendance records';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get attendance statistics for a group
  const getGroupStats = useCallback(async (groupId, weeks = 12) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${API_URL}/api/attendance/group/${groupId}/stats?weeks=${weeks}`
      );

      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch statistics';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get student attendance pattern
  const getStudentPattern = useCallback(async (userId, groupId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${API_URL}/api/attendance/patterns/${userId}/${groupId}`
      );

      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch student pattern';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Recalculate student pattern
  const recalculatePattern = async (userId, groupId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_URL}/api/attendance/patterns/${userId}/${groupId}/recalculate`
      );

      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to recalculate pattern';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Get follow-up suggestions
  const getFollowUpSuggestions = useCallback(async (groupId = null, status = null, priority = null) => {
    try {
      setLoading(true);
      setError(null);

      let url = `${API_URL}/api/attendance/follow-ups`;
      const params = new URLSearchParams();

      if (groupId) params.append('groupId', groupId);
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      setFollowUpSuggestions(response.data);

      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch follow-up suggestions';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a specific follow-up suggestion
  const getFollowUpSuggestion = async (suggestionId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${API_URL}/api/attendance/follow-ups/${suggestionId}`
      );

      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch follow-up suggestion';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Update a follow-up suggestion
  const updateFollowUpSuggestion = async (suggestionId, updates) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.patch(
        `${API_URL}/api/attendance/follow-ups/${suggestionId}`,
        updates
      );

      // Update in local state
      setFollowUpSuggestions(prev =>
        prev.map(s => s.id === suggestionId ? response.data : s)
      );

      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update follow-up suggestion';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Dismiss a follow-up suggestion
  const dismissFollowUpSuggestion = async (suggestionId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.delete(
        `${API_URL}/api/attendance/follow-ups/${suggestionId}`
      );

      // Remove from local state
      setFollowUpSuggestions(prev =>
        prev.filter(s => s.id !== suggestionId)
      );

      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to dismiss follow-up suggestion';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Get dashboard overview
  const getDashboardOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/attendance/dashboard`);
      setDashboardData(response.data);

      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch dashboard data';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    attendanceRecords,
    followUpSuggestions,
    dashboardData,
    loading,
    error,
    recordAttendance,
    recordBulkAttendance,
    getGroupAttendance,
    getGroupStats,
    getStudentPattern,
    recalculatePattern,
    getFollowUpSuggestions,
    getFollowUpSuggestion,
    updateFollowUpSuggestion,
    dismissFollowUpSuggestion,
    getDashboardOverview,
  };

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>;
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within AttendanceProvider');
  }
  return context;
}

export default AttendanceContext;
