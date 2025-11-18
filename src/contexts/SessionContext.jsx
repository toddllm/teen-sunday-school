import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios';

const SessionContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export function SessionProvider({ children }) {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch sessions with filters
  const fetchSessions = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.groupId) params.append('groupId', filters.groupId);
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await axios.get(`${API_URL}/api/sessions?${params}`);
      setSessions(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      setError(err.response?.data?.error || 'Failed to fetch sessions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single session by ID
  const fetchSession = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/sessions/${sessionId}`);
      setCurrentSession(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch session:', err);
      setError(err.response?.data?.error || 'Failed to fetch session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new session
  const createSession = useCallback(async (sessionData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/api/sessions`, sessionData);
      const newSession = response.data;

      setSessions((prev) => [...prev, newSession]);
      return newSession;
    } catch (err) {
      console.error('Failed to create session:', err);
      setError(err.response?.data?.error || 'Failed to create session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a session
  const updateSession = useCallback(async (sessionId, updates) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(`${API_URL}/api/sessions/${sessionId}`, updates);
      const updatedSession = response.data;

      setSessions((prev) =>
        prev.map((session) => (session.id === sessionId ? updatedSession : session))
      );

      if (currentSession?.id === sessionId) {
        setCurrentSession(updatedSession);
      }

      return updatedSession;
    } catch (err) {
      console.error('Failed to update session:', err);
      setError(err.response?.data?.error || 'Failed to update session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  // Delete a session
  const deleteSession = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError(null);

      await axios.delete(`${API_URL}/api/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((session) => session.id !== sessionId));

      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
      setError(err.response?.data?.error || 'Failed to delete session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  // Start a session
  const startSession = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/api/sessions/${sessionId}/start`);
      const updatedSession = response.data;

      setSessions((prev) =>
        prev.map((session) => (session.id === sessionId ? updatedSession : session))
      );

      if (currentSession?.id === sessionId) {
        setCurrentSession(updatedSession);
      }

      return updatedSession;
    } catch (err) {
      console.error('Failed to start session:', err);
      setError(err.response?.data?.error || 'Failed to start session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  // End a session
  const endSession = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/api/sessions/${sessionId}/end`);
      const updatedSession = response.data;

      setSessions((prev) =>
        prev.map((session) => (session.id === sessionId ? updatedSession : session))
      );

      if (currentSession?.id === sessionId) {
        setCurrentSession(updatedSession);
      }

      return updatedSession;
    } catch (err) {
      console.error('Failed to end session:', err);
      setError(err.response?.data?.error || 'Failed to end session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  // Cancel a session
  const cancelSession = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/api/sessions/${sessionId}/cancel`);
      const updatedSession = response.data;

      setSessions((prev) =>
        prev.map((session) => (session.id === sessionId ? updatedSession : session))
      );

      if (currentSession?.id === sessionId) {
        setCurrentSession(updatedSession);
      }

      return updatedSession;
    } catch (err) {
      console.error('Failed to cancel session:', err);
      setError(err.response?.data?.error || 'Failed to cancel session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  // Check-in to a session
  const checkIn = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/api/sessions/${sessionId}/check-in`);
      return response.data;
    } catch (err) {
      console.error('Failed to check in:', err);
      setError(err.response?.data?.error || 'Failed to check in');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark attendance manually (leader functionality)
  const markAttendance = useCallback(async (sessionId, userId, status, notes) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/api/sessions/${sessionId}/attendance`, {
        userId,
        status,
        notes,
      });

      return response.data;
    } catch (err) {
      console.error('Failed to mark attendance:', err);
      setError(err.response?.data?.error || 'Failed to mark attendance');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get attendance for a session
  const getSessionAttendance = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/sessions/${sessionId}/attendance`);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
      setError(err.response?.data?.error || 'Failed to fetch attendance');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get attendance report
  const getAttendanceReport = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/sessions/${sessionId}/attendance/report`);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch attendance report:', err);
      setError(err.response?.data?.error || 'Failed to fetch attendance report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get session stats
  const getSessionStats = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/sessions/${sessionId}/stats`);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch session stats:', err);
      setError(err.response?.data?.error || 'Failed to fetch session stats');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    sessions,
    currentSession,
    loading,
    error,
    fetchSessions,
    fetchSession,
    createSession,
    updateSession,
    deleteSession,
    startSession,
    endSession,
    cancelSession,
    checkIn,
    markAttendance,
    getSessionAttendance,
    getAttendanceReport,
    getSessionStats,
    setCurrentSession,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessions() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessions must be used within a SessionProvider');
  }
  return context;
}
