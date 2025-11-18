import React, { createContext, useContext, useState, useCallback } from 'react';
import * as plansService from '../services/readingPlansService';
import { useAuth } from './AuthContext';

const ReadingPlansContext = createContext();

/**
 * Reading Plans Context Provider
 *
 * Manages state and operations for reading plans, including:
 * - Browsing available plans
 * - Starting, pausing, resuming plans
 * - Tracking daily progress
 */
export function ReadingPlansProvider({ children }) {
  const { user, ensureUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Get all available reading plans with optional filters
   */
  const getPlans = useCallback((filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const plans = plansService.getPlans(filters);
      return plans;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get a specific plan by ID with all its days
   */
  const getPlanById = useCallback((planId) => {
    try {
      setLoading(true);
      setError(null);
      return plansService.getPlanById(planId);
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get all plans for the current user
   */
  const getUserPlans = useCallback((status = null) => {
    if (!user) return [];

    try {
      setLoading(true);
      setError(null);
      return plansService.getUserPlans(user.id, status);
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Start a new reading plan
   * Ensures user is logged in first
   */
  const startPlan = useCallback((planId) => {
    const currentUser = ensureUser();

    try {
      setLoading(true);
      setError(null);
      const userPlan = plansService.startPlan(currentUser.id, planId);
      return userPlan;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [ensureUser]);

  /**
   * Update plan status (pause, resume, complete)
   */
  const updatePlanStatus = useCallback((planId, status) => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    try {
      setLoading(true);
      setError(null);
      return plansService.updateUserPlanStatus(user.id, planId, status);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Mark a specific day as complete
   */
  const completeDay = useCallback((planId, dayIndex) => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    try {
      setLoading(true);
      setError(null);
      return plansService.completePlanDay(user.id, planId, dayIndex);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Catch up - mark all days until a certain day as complete
   */
  const catchUpPlan = useCallback((planId, untilDayIndex) => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    try {
      setLoading(true);
      setError(null);
      return plansService.catchUpPlan(user.id, planId, untilDayIndex);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Create a new reading plan (admin only)
   */
  const createPlan = useCallback((planData, days) => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    try {
      setLoading(true);
      setError(null);
      return plansService.createPlan(planData, days, user.id);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Get user's progress for a specific plan
   */
  const getPlanProgress = useCallback((planId) => {
    if (!user) return null;

    const userPlans = getUserPlans();
    return userPlans.find(up => up.plan.id === planId);
  }, [user, getUserPlans]);

  const value = {
    loading,
    error,
    getPlans,
    getPlanById,
    getUserPlans,
    startPlan,
    updatePlanStatus,
    completeDay,
    catchUpPlan,
    createPlan,
    getPlanProgress,
  };

  return (
    <ReadingPlansContext.Provider value={value}>
      {children}
    </ReadingPlansContext.Provider>
  );
}

export function useReadingPlans() {
  const context = useContext(ReadingPlansContext);
  if (context === undefined) {
    throw new Error('useReadingPlans must be used within a ReadingPlansProvider');
  }
  return context;
}
