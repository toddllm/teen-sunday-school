import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios';

const ProgressContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export function ProgressProvider({ children }) {
  const [groupProgress, setGroupProgress] = useState(null);
  const [lessonProgress, setLessonProgress] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch overall progress for a group
   */
  const fetchGroupProgress = useCallback(async (groupId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/groups/${groupId}/progress`);
      setGroupProgress(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch group progress';
      setError(errorMsg);
      console.error('Error fetching group progress:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch progress for a specific lesson
   */
  const fetchLessonProgress = useCallback(async (groupId, lessonId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_URL}/api/groups/${groupId}/lessons/${lessonId}/progress`
      );
      setLessonProgress(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch lesson progress';
      setError(errorMsg);
      console.error('Error fetching lesson progress:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch attendance records for a group
   */
  const fetchAttendance = useCallback(async (groupId, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);
      if (options.limit) params.append('limit', options.limit);
      if (options.offset) params.append('offset', options.offset);

      const response = await axios.get(
        `${API_URL}/api/groups/${groupId}/attendance?${params.toString()}`
      );
      setAttendance(response.data.attendance);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch attendance';
      setError(errorMsg);
      console.error('Error fetching attendance:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch progress timeline for a group
   */
  const fetchProgressTimeline = useCallback(async (groupId, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);

      const response = await axios.get(
        `${API_URL}/api/groups/${groupId}/progress/timeline?${params.toString()}`
      );
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch progress timeline';
      setError(errorMsg);
      console.error('Error fetching progress timeline:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch comprehensive analytics for a group
   */
  const fetchAnalytics = useCallback(async (groupId, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);

      const response = await axios.get(
        `${API_URL}/api/groups/${groupId}/analytics?${params.toString()}`
      );
      setAnalytics(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch analytics';
      setError(errorMsg);
      console.error('Error fetching analytics:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Record lesson progress
   */
  const recordProgress = useCallback(async (progressData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/api/progress`, progressData);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to record progress';
      setError(errorMsg);
      console.error('Error recording progress:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Record attendance
   */
  const recordAttendance = useCallback(async (attendanceData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/api/attendance`, attendanceData);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to record attendance';
      setError(errorMsg);
      console.error('Error recording attendance:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch progress for a specific student
   */
  const fetchStudentProgress = useCallback(async (userId, groupId = null) => {
    setLoading(true);
    setError(null);
    try {
      const params = groupId ? `?groupId=${groupId}` : '';
      const response = await axios.get(`${API_URL}/api/students/${userId}/progress${params}`);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch student progress';
      setError(errorMsg);
      console.error('Error fetching student progress:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Calculate completion percentage
   */
  const calculateCompletionRate = useCallback((completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100 * 100) / 100;
  }, []);

  /**
   * Format time duration
   */
  const formatDuration = useCallback((milliseconds) => {
    if (!milliseconds) return '0m';

    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, []);

  /**
   * Get status badge color
   */
  const getStatusColor = useCallback((status) => {
    const statusColors = {
      COMPLETED: 'green',
      IN_PROGRESS: 'blue',
      NOT_STARTED: 'gray',
      NEEDS_REVIEW: 'orange',
      PRESENT: 'green',
      ABSENT: 'red',
      EXCUSED: 'yellow',
    };
    return statusColors[status] || 'gray';
  }, []);

  /**
   * Get status icon
   */
  const getStatusIcon = useCallback((status) => {
    const statusIcons = {
      COMPLETED: '✓',
      IN_PROGRESS: '▪',
      NOT_STARTED: '—',
      NEEDS_REVIEW: '⚠',
      PRESENT: '✓',
      ABSENT: '✗',
      EXCUSED: '◎',
    };
    return statusIcons[status] || '•';
  }, []);

  /**
   * Clear all state
   */
  const clearState = useCallback(() => {
    setGroupProgress(null);
    setLessonProgress(null);
    setAttendance([]);
    setAnalytics(null);
    setError(null);
  }, []);

  const value = {
    // State
    groupProgress,
    lessonProgress,
    attendance,
    analytics,
    loading,
    error,

    // Fetch methods
    fetchGroupProgress,
    fetchLessonProgress,
    fetchAttendance,
    fetchProgressTimeline,
    fetchAnalytics,
    fetchStudentProgress,

    // Action methods
    recordProgress,
    recordAttendance,

    // Utility methods
    calculateCompletionRate,
    formatDuration,
    getStatusColor,
    getStatusIcon,
    clearState,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}

export default ProgressContext;
