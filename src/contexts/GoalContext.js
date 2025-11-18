import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import goalService from '../services/goalService';

const GoalContext = createContext();

export const useGoals = () => {
  const context = useContext(GoalContext);
  if (!context) {
    throw new Error('useGoals must be used within GoalProvider');
  }
  return context;
};

export const GoalProvider = ({ children }) => {
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load goals on mount
  useEffect(() => {
    loadGoals();
    loadStats();
  }, []);

  /**
   * Load all goals from API
   */
  const loadGoals = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await goalService.list(filters);
      setGoals(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load goals');
      console.error('Error loading goals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load goal statistics
   */
  const loadStats = useCallback(async () => {
    try {
      const data = await goalService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, []);

  /**
   * Add a new goal
   */
  const addGoal = useCallback(async (goalData) => {
    setError(null);
    try {
      const newGoal = await goalService.create(goalData);
      setGoals((prev) => [newGoal, ...prev]);
      await loadStats(); // Update stats
      return newGoal;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create goal');
      throw err;
    }
  }, [loadStats]);

  /**
   * Update an existing goal
   */
  const updateGoal = useCallback(async (id, updates) => {
    setError(null);
    try {
      const updatedGoal = await goalService.update(id, updates);
      setGoals((prev) =>
        prev.map((goal) => (goal.id === id ? updatedGoal : goal))
      );
      await loadStats(); // Update stats
      return updatedGoal;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update goal');
      throw err;
    }
  }, [loadStats]);

  /**
   * Delete a goal
   */
  const deleteGoal = useCallback(async (id) => {
    setError(null);
    try {
      await goalService.delete(id);
      setGoals((prev) => prev.filter((goal) => goal.id !== id));
      await loadStats(); // Update stats
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete goal');
      throw err;
    }
  }, [loadStats]);

  /**
   * Log progress for a goal
   */
  const logProgress = useCallback(async (goalId, progressData) => {
    setError(null);
    try {
      const progressUpdate = await goalService.logProgress(goalId, progressData);

      // Update the goal in the list to reflect the new progress
      const updatedGoal = await goalService.get(goalId);
      setGoals((prev) =>
        prev.map((goal) => (goal.id === goalId ? updatedGoal : goal))
      );

      await loadStats(); // Update stats
      return progressUpdate;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to log progress');
      throw err;
    }
  }, [loadStats]);

  /**
   * Get a specific goal with full details
   */
  const getGoal = useCallback(async (id) => {
    try {
      const goal = await goalService.get(id);
      return goal;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch goal');
      throw err;
    }
  }, []);

  /**
   * Filter goals by status
   */
  const getGoalsByStatus = useCallback((status) => {
    return goals.filter((goal) => goal.status === status);
  }, [goals]);

  /**
   * Filter goals by category
   */
  const getGoalsByCategory = useCallback((category) => {
    return goals.filter((goal) => goal.category === category);
  }, [goals]);

  /**
   * Get active goals (not completed or abandoned)
   */
  const getActiveGoals = useCallback(() => {
    return goals.filter(
      (goal) => goal.status !== 'COMPLETED' && goal.status !== 'ABANDONED'
    );
  }, [goals]);

  /**
   * Get completed goals
   */
  const getCompletedGoals = useCallback(() => {
    return goals.filter((goal) => goal.status === 'COMPLETED');
  }, [goals]);

  /**
   * Get latest progress for a goal
   */
  const getLatestProgress = useCallback((goal) => {
    if (!goal.progressUpdates || goal.progressUpdates.length === 0) {
      return 0;
    }
    return goal.progressUpdates[0].progress;
  }, []);

  /**
   * Calculate completion percentage
   */
  const getCompletionPercentage = useCallback(() => {
    if (goals.length === 0) return 0;
    const completed = goals.filter((g) => g.status === 'COMPLETED').length;
    return Math.round((completed / goals.length) * 100);
  }, [goals]);

  const value = {
    // State
    goals,
    stats,
    loading,
    error,

    // Actions
    loadGoals,
    loadStats,
    addGoal,
    updateGoal,
    deleteGoal,
    logProgress,
    getGoal,

    // Filters
    getGoalsByStatus,
    getGoalsByCategory,
    getActiveGoals,
    getCompletedGoals,

    // Helpers
    getLatestProgress,
    getCompletionPercentage,
  };

  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>;
};

export default GoalContext;
