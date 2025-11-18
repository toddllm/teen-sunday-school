import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import challengeAPI from '../services/challengeAPI';

const ChallengeContext = createContext();

// Challenge types mapping
export const CHALLENGE_TYPES = {
  CHAPTERS_READ: 'CHAPTERS_READ',
  VERSES_MEMORIZED: 'VERSES_MEMORIZED',
  PRAYERS_LOGGED: 'PRAYERS_LOGGED',
  LESSONS_COMPLETED: 'LESSONS_COMPLETED',
  DAYS_ATTENDED: 'DAYS_ATTENDED',
  READING_PLANS_COMPLETED: 'READING_PLANS_COMPLETED',
  COMBO: 'COMBO',
};

// Challenge status mapping
export const CHALLENGE_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
};

// Display names for challenge types
export const CHALLENGE_TYPE_LABELS = {
  CHAPTERS_READ: 'Chapters Read',
  VERSES_MEMORIZED: 'Verses Memorized',
  PRAYERS_LOGGED: 'Prayers Logged',
  LESSONS_COMPLETED: 'Lessons Completed',
  DAYS_ATTENDED: 'Days Attended',
  READING_PLANS_COMPLETED: 'Reading Plans Completed',
  COMBO: 'Combination Challenge',
};

// Map activity types to challenge types
export const ACTIVITY_TO_CHALLENGE_TYPE = {
  'chapter_read': CHALLENGE_TYPES.CHAPTERS_READ,
  'verse_memorized': CHALLENGE_TYPES.VERSES_MEMORIZED,
  'prayer_logged': CHALLENGE_TYPES.PRAYERS_LOGGED,
  'lesson_completed': CHALLENGE_TYPES.LESSONS_COMPLETED,
  'reading_plan_completed': CHALLENGE_TYPES.READING_PLANS_COMPLETED,
};

export const useChallenges = () => {
  const context = useContext(ChallengeContext);
  if (!context) {
    throw new Error('useChallenges must be used within a ChallengeProvider');
  }
  return context;
};

export const ChallengeProvider = ({ children }) => {
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============================================================================
  // FETCH CHALLENGES
  // ============================================================================

  /**
   * Fetch active challenges for the current user
   */
  const fetchActiveChallenges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const challenges = await challengeAPI.getMyActiveChallenges();
      setActiveChallenges(challenges || []);
    } catch (err) {
      console.error('Error fetching challenges:', err);
      setError(err.message);
      // Fallback to empty array on error
      setActiveChallenges([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load challenges on mount
  useEffect(() => {
    // Only fetch if we have auth (when auth is implemented)
    const hasAuth = !!localStorage.getItem('accessToken');
    if (hasAuth) {
      fetchActiveChallenges();
    }
  }, [fetchActiveChallenges]);

  // ============================================================================
  // CHALLENGE MANAGEMENT
  // ============================================================================

  /**
   * Create a new challenge
   */
  const createChallenge = async (groupId, challengeData) => {
    try {
      setLoading(true);
      setError(null);
      const newChallenge = await challengeAPI.createChallenge(groupId, challengeData);
      await fetchActiveChallenges(); // Refresh list
      return newChallenge;
    } catch (err) {
      console.error('Error creating challenge:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Join a challenge
   */
  const joinChallenge = async (challengeId) => {
    try {
      setError(null);
      await challengeAPI.joinChallenge(challengeId);
      await fetchActiveChallenges(); // Refresh to show participation
    } catch (err) {
      console.error('Error joining challenge:', err);
      setError(err.message);
      throw err;
    }
  };

  /**
   * Record a contribution to a challenge
   */
  const recordContribution = async (challengeId, contributionData) => {
    try {
      setError(null);
      await challengeAPI.recordContribution(challengeId, contributionData);
      await fetchActiveChallenges(); // Refresh to show updated progress
    } catch (err) {
      console.error('Error recording contribution:', err);
      setError(err.message);
      throw err;
    }
  };

  /**
   * Auto-record contribution when user completes an activity
   * This should be called from StreakContext after logging an activity
   */
  const autoRecordContribution = useCallback(async (activityType, activityId = null) => {
    try {
      const challengeType = ACTIVITY_TO_CHALLENGE_TYPE[activityType];
      if (!challengeType) {
        // No matching challenge type for this activity
        return;
      }

      // Find all active challenges that match this activity type
      const matchingChallenges = activeChallenges.filter(
        challenge =>
          challenge.type === challengeType &&
          challenge.status === CHALLENGE_STATUS.ACTIVE
      );

      // Record contribution to each matching challenge
      for (const challenge of matchingChallenges) {
        try {
          await recordContribution(challenge.id, {
            amount: 1,
            sourceActivityType: activityType,
            sourceActivityId: activityId,
          });
        } catch (err) {
          // Continue to next challenge if one fails
          console.warn(`Failed to record contribution to challenge ${challenge.id}:`, err);
        }
      }
    } catch (err) {
      console.error('Error in autoRecordContribution:', err);
    }
  }, [activeChallenges]);

  /**
   * Get a specific challenge by ID with full details
   */
  const getChallengeDetails = async (challengeId) => {
    try {
      setError(null);
      return await challengeAPI.getChallengeById(challengeId);
    } catch (err) {
      console.error('Error fetching challenge details:', err);
      setError(err.message);
      throw err;
    }
  };

  /**
   * Get leaderboard for a challenge
   */
  const getChallengeLeaderboard = async (challengeId, limit = 10) => {
    try {
      setError(null);
      return await challengeAPI.getChallengeLeaderboard(challengeId, limit);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message);
      throw err;
    }
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Get progress percentage for a challenge
   */
  const getProgressPercentage = (challenge) => {
    if (!challenge || !challenge.metrics) return 0;
    return Math.min(challenge.metrics.progressPercentage || 0, 100);
  };

  /**
   * Check if user is participating in a challenge
   */
  const isParticipating = (challenge, userId) => {
    if (!challenge || !challenge.participants) return false;
    return challenge.participants.some(p => p.userId === userId);
  };

  /**
   * Get days remaining in a challenge
   */
  const getDaysRemaining = (challenge) => {
    if (!challenge || !challenge.endDate) return 0;
    const now = new Date();
    const end = new Date(challenge.endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  /**
   * Format challenge date range
   */
  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    const end = new Date(endDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    return `${start} - ${end}`;
  };

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value = {
    // State
    activeChallenges,
    loading,
    error,

    // Actions
    fetchActiveChallenges,
    createChallenge,
    joinChallenge,
    recordContribution,
    autoRecordContribution,
    getChallengeDetails,
    getChallengeLeaderboard,

    // Helpers
    getProgressPercentage,
    isParticipating,
    getDaysRemaining,
    formatDateRange,

    // Constants
    CHALLENGE_TYPES,
    CHALLENGE_STATUS,
    CHALLENGE_TYPE_LABELS,
  };

  return (
    <ChallengeContext.Provider value={value}>
      {children}
    </ChallengeContext.Provider>
  );
};

export default ChallengeContext;
