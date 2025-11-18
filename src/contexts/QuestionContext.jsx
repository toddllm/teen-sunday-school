import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios';

const QuestionContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export function QuestionProvider({ children }) {
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Submit an anonymous question (public, no auth required)
  const submitQuestion = async (groupId, questionData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_URL}/api/groups/${groupId}/questions`,
        questionData
      );

      return { success: true, data: response.data };
    } catch (err) {
      console.error('Failed to submit question:', err);
      const errorMessage = err.response?.data?.error || 'Failed to submit question';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Fetch questions for admin (requires auth)
  const fetchQuestions = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.groupId) params.append('groupId', filters.groupId);
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.sessionId) params.append('sessionId', filters.sessionId);

      const response = await axios.get(
        `${API_URL}/api/admin/questions?${params.toString()}`
      );

      setQuestions(response.data.questions);
      setStats(response.data.stats);

      return { success: true, data: response.data };
    } catch (err) {
      console.error('Failed to fetch questions:', err);
      const errorMessage = err.response?.data?.error || 'Failed to fetch questions';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get question statistics (requires auth)
  const fetchStats = useCallback(async (groupId = null) => {
    try {
      const params = groupId ? `?groupId=${groupId}` : '';
      const response = await axios.get(
        `${API_URL}/api/admin/questions/stats${params}`
      );

      setStats(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      const errorMessage = err.response?.data?.error || 'Failed to fetch statistics';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Get a single question by ID (requires auth)
  const getQuestionById = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/admin/questions/${id}`);

      return { success: true, data: response.data };
    } catch (err) {
      console.error('Failed to fetch question:', err);
      const errorMessage = err.response?.data?.error || 'Failed to fetch question';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Mark question as answered (requires auth)
  const markAsAnswered = async (id, answerData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(
        `${API_URL}/api/admin/questions/${id}/answer`,
        answerData
      );

      // Update local state
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? response.data : q))
      );

      return { success: true, data: response.data };
    } catch (err) {
      console.error('Failed to mark as answered:', err);
      const errorMessage = err.response?.data?.error || 'Failed to update question';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update question status (requires auth)
  const updateStatus = async (id, status) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(
        `${API_URL}/api/admin/questions/${id}/status`,
        { status }
      );

      // Update local state
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? response.data : q))
      );

      return { success: true, data: response.data };
    } catch (err) {
      console.error('Failed to update status:', err);
      const errorMessage = err.response?.data?.error || 'Failed to update status';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Delete a question (requires auth)
  const deleteQuestion = async (id) => {
    try {
      setLoading(true);
      setError(null);

      await axios.delete(`${API_URL}/api/admin/questions/${id}`);

      // Update local state
      setQuestions((prev) => prev.filter((q) => q.id !== id));

      return { success: true };
    } catch (err) {
      console.error('Failed to delete question:', err);
      const errorMessage = err.response?.data?.error || 'Failed to delete question';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    questions,
    stats,
    loading,
    error,
    submitQuestion,
    fetchQuestions,
    fetchStats,
    getQuestionById,
    markAsAnswered,
    updateStatus,
    deleteQuestion,
  };

  return (
    <QuestionContext.Provider value={value}>
      {children}
    </QuestionContext.Provider>
  );
}

export function useQuestions() {
  const context = useContext(QuestionContext);
  if (!context) {
    throw new Error('useQuestions must be used within a QuestionProvider');
  }
  return context;
}

export default QuestionContext;
