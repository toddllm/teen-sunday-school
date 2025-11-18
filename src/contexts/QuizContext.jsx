import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios';

const QuizContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export function QuizProvider({ children }) {
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get all quizzes for a lesson
  const getQuizzesForLesson = useCallback(async (lessonId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/lessons/${lessonId}/quizzes`);
      setQuizzes(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch quizzes:', err);
      setError(err.response?.data?.error || 'Failed to fetch quizzes');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a specific quiz by ID
  const getQuizById = useCallback(async (quizId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/quizzes/${quizId}`);
      setCurrentQuiz(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch quiz:', err);
      setError(err.response?.data?.error || 'Failed to fetch quiz');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new quiz
  const createQuiz = useCallback(async (lessonId, quizData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(
        `${API_URL}/api/lessons/${lessonId}/quizzes`,
        quizData
      );
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Failed to create quiz:', err);
      const errorMessage = err.response?.data?.error || 'Failed to create quiz';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an existing quiz
  const updateQuiz = useCallback(async (lessonId, quizId, quizData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put(
        `${API_URL}/api/lessons/${lessonId}/quizzes/${quizId}`,
        quizData
      );
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Failed to update quiz:', err);
      const errorMessage = err.response?.data?.error || 'Failed to update quiz';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a quiz
  const deleteQuiz = useCallback(async (lessonId, quizId) => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`${API_URL}/api/lessons/${lessonId}/quizzes/${quizId}`);
      return { success: true };
    } catch (err) {
      console.error('Failed to delete quiz:', err);
      const errorMessage = err.response?.data?.error || 'Failed to delete quiz';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Submit a quiz attempt
  const submitQuizAttempt = useCallback(async (quizId, answers, timeSpent) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/api/quizzes/${quizId}/attempts`, {
        answers,
        timeSpent,
      });
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      const errorMessage = err.response?.data?.error || 'Failed to submit quiz';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get current user's quiz attempts
  const getMyQuizAttempts = useCallback(async (quizId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/quizzes/${quizId}/attempts/me`);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch quiz attempts:', err);
      setError(err.response?.data?.error || 'Failed to fetch quiz attempts');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get quiz analytics (for teachers/admins)
  const getQuizAnalytics = useCallback(async (quizId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/quizzes/${quizId}/analytics`);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch quiz analytics:', err);
      setError(err.response?.data?.error || 'Failed to fetch quiz analytics');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all attempts for a quiz (for teachers/admins)
  const getAllQuizAttempts = useCallback(async (quizId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/quizzes/${quizId}/attempts`);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch all quiz attempts:', err);
      setError(err.response?.data?.error || 'Failed to fetch quiz attempts');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    quizzes,
    currentQuiz,
    loading,
    error,
    getQuizzesForLesson,
    getQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    submitQuizAttempt,
    getMyQuizAttempts,
    getQuizAnalytics,
    getAllQuizAttempts,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}

export default QuizContext;
