import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios';

const PollContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export function PollProvider({ children }) {
  const [polls, setPolls] = useState([]);
  const [activePoll, setActivePoll] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Create a new poll for a lesson
   */
  const createPoll = async (lessonId, pollData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_URL}/api/lessons/${lessonId}/polls`,
        pollData
      );

      const newPoll = response.data.poll;
      setPolls(prev => [newPoll, ...prev]);

      return { success: true, poll: newPoll };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create poll';
      setError(errorMessage);
      console.error('Create poll error:', error);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get all polls for a lesson
   */
  const getLessonPolls = async (lessonId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/lessons/${lessonId}/polls`);
      setPolls(response.data.polls);

      // Check for active polls
      const active = response.data.polls.find(poll => poll.status === 'ACTIVE');
      setActivePoll(active || null);

      return { success: true, polls: response.data.polls };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to get polls';
      setError(errorMessage);
      console.error('Get polls error:', error);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get a specific poll with details
   */
  const getPoll = async (pollId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/polls/${pollId}`);
      return { success: true, poll: response.data.poll };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to get poll';
      setError(errorMessage);
      console.error('Get poll error:', error);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Activate a poll (make it live)
   */
  const activatePoll = async (pollId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.patch(`${API_URL}/api/polls/${pollId}/activate`);
      const updatedPoll = response.data.poll;

      // Update polls list
      setPolls(prev =>
        prev.map(poll => (poll.id === pollId ? updatedPoll : poll))
      );

      // Set as active poll
      setActivePoll(updatedPoll);

      return { success: true, poll: updatedPoll };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to activate poll';
      setError(errorMessage);
      console.error('Activate poll error:', error);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Close a poll (stop accepting responses)
   */
  const closePoll = async (pollId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.patch(`${API_URL}/api/polls/${pollId}/close`);
      const updatedPoll = response.data.poll;

      // Update polls list
      setPolls(prev =>
        prev.map(poll => (poll.id === pollId ? updatedPoll : poll))
      );

      // Clear active poll if this was it
      if (activePoll?.id === pollId) {
        setActivePoll(null);
      }

      return { success: true, poll: updatedPoll };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to close poll';
      setError(errorMessage);
      console.error('Close poll error:', error);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a poll
   */
  const deletePoll = async (pollId) => {
    try {
      setLoading(true);
      setError(null);

      await axios.delete(`${API_URL}/api/polls/${pollId}`);

      // Remove from polls list
      setPolls(prev => prev.filter(poll => poll.id !== pollId));

      // Clear active poll if this was it
      if (activePoll?.id === pollId) {
        setActivePoll(null);
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete poll';
      setError(errorMessage);
      console.error('Delete poll error:', error);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Submit a response to a poll
   */
  const submitPollResponse = async (pollId, answer, anonymousId = null) => {
    try {
      setError(null);

      const response = await axios.post(`${API_URL}/api/polls/${pollId}/responses`, {
        answer,
        anonymousId,
      });

      return { success: true, response: response.data.response };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to submit response';
      setError(errorMessage);
      console.error('Submit response error:', error);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Get aggregated results for a poll
   */
  const getPollResults = async (pollId) => {
    try {
      const response = await axios.get(`${API_URL}/api/polls/${pollId}/results`);
      return { success: true, results: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to get results';
      console.error('Get results error:', error);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Refresh polls (for polling mechanism)
   */
  const refreshPolls = useCallback(async (lessonId) => {
    try {
      const response = await axios.get(`${API_URL}/api/lessons/${lessonId}/polls`);
      setPolls(response.data.polls);

      // Check for active polls
      const active = response.data.polls.find(poll => poll.status === 'ACTIVE');
      setActivePoll(active || null);

      return { success: true, polls: response.data.polls };
    } catch (error) {
      console.error('Refresh polls error:', error);
      return { success: false };
    }
  }, []);

  /**
   * Refresh a specific poll (for live results)
   */
  const refreshPoll = useCallback(async (pollId) => {
    try {
      const response = await axios.get(`${API_URL}/api/polls/${pollId}`);
      const updatedPoll = response.data.poll;

      // Update polls list
      setPolls(prev =>
        prev.map(poll => (poll.id === pollId ? updatedPoll : poll))
      );

      // Update active poll if needed
      if (activePoll?.id === pollId) {
        setActivePoll(updatedPoll);
      }

      return { success: true, poll: updatedPoll };
    } catch (error) {
      console.error('Refresh poll error:', error);
      return { success: false };
    }
  }, [activePoll]);

  /**
   * Clear error
   */
  const clearError = () => {
    setError(null);
  };

  const value = {
    // State
    polls,
    activePoll,
    loading,
    error,

    // Actions
    createPoll,
    getLessonPolls,
    getPoll,
    activatePoll,
    closePoll,
    deletePoll,
    submitPollResponse,
    getPollResults,
    refreshPolls,
    refreshPoll,
    clearError,

    // Setters (for direct manipulation if needed)
    setPolls,
    setActivePoll,
  };

  return <PollContext.Provider value={value}>{children}</PollContext.Provider>;
}

export function usePoll() {
  const context = useContext(PollContext);
  if (context === undefined) {
    throw new Error('usePoll must be used within a PollProvider');
  }
  return context;
}

export default PollContext;
