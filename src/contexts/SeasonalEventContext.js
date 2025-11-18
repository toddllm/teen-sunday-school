import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import seasonalEventService from '../services/seasonalEventService';
import { useAuth } from './AuthContext';

const SeasonalEventContext = createContext();

/**
 * Hook to use seasonal events context
 */
export function useSeasonalEvents() {
  const context = useContext(SeasonalEventContext);
  if (!context) {
    throw new Error('useSeasonalEvents must be used within SeasonalEventProvider');
  }
  return context;
}

/**
 * Seasonal Event Provider
 * Manages state for seasonal events, participations, and activities
 */
export function SeasonalEventProvider({ children }) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [activeEvents, setActiveEvents] = useState([]);
  const [participations, setParticipations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load all events for the organization
   */
  const loadEvents = useCallback(async (filters = {}) => {
    if (!user?.organizationId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await seasonalEventService.listEvents(user.organizationId, filters);
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [user?.organizationId]);

  /**
   * Load active events for the organization
   */
  const loadActiveEvents = useCallback(async () => {
    if (!user?.organizationId) return;

    try {
      const data = await seasonalEventService.getActiveEvents(user.organizationId);
      setActiveEvents(data);
    } catch (err) {
      console.error('Failed to load active events:', err);
    }
  }, [user?.organizationId]);

  /**
   * Get a specific event by ID
   */
  const getEvent = async (eventId) => {
    try {
      const data = await seasonalEventService.getEvent(eventId);
      return data;
    } catch (err) {
      console.error('Failed to get event:', err);
      throw err;
    }
  };

  /**
   * Join an event
   */
  const joinEvent = async (eventId) => {
    try {
      const participation = await seasonalEventService.joinEvent(eventId);

      // Update participations state
      setParticipations(prev => ({
        ...prev,
        [eventId]: participation,
      }));

      return participation;
    } catch (err) {
      console.error('Failed to join event:', err);
      throw err;
    }
  };

  /**
   * Get user's participation in an event
   */
  const getParticipation = async (eventId) => {
    try {
      const data = await seasonalEventService.getParticipation(eventId);

      // Cache participation
      setParticipations(prev => ({
        ...prev,
        [eventId]: data,
      }));

      return data;
    } catch (err) {
      console.error('Failed to get participation:', err);
      return null;
    }
  };

  /**
   * Log an activity for an event
   */
  const logActivity = async (eventId, activityData) => {
    try {
      const result = await seasonalEventService.logActivity(eventId, activityData);

      // Update participation state
      if (result.participation) {
        setParticipations(prev => ({
          ...prev,
          [eventId]: {
            ...prev[eventId],
            ...result.participation,
          },
        }));
      }

      return result;
    } catch (err) {
      console.error('Failed to log activity:', err);
      throw err;
    }
  };

  /**
   * Get event leaderboard
   */
  const getLeaderboard = async (eventId, limit = 100) => {
    try {
      const data = await seasonalEventService.getLeaderboard(eventId, limit);
      return data;
    } catch (err) {
      console.error('Failed to get leaderboard:', err);
      throw err;
    }
  };

  // ============================================================================
  // ADMIN METHODS
  // ============================================================================

  /**
   * Create a new event (admin only)
   */
  const createEvent = async (eventData) => {
    if (!user?.organizationId) {
      throw new Error('Organization ID not found');
    }

    try {
      const event = await seasonalEventService.createEvent(user.organizationId, eventData);

      // Add to events list
      setEvents(prev => [event, ...prev]);

      // If event is active and current, add to active events
      const now = new Date();
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);

      if (event.isActive && start <= now && end >= now) {
        setActiveEvents(prev => [event, ...prev]);
      }

      return event;
    } catch (err) {
      console.error('Failed to create event:', err);
      throw err;
    }
  };

  /**
   * Update an event (admin only)
   */
  const updateEvent = async (eventId, updates) => {
    try {
      const updatedEvent = await seasonalEventService.updateEvent(eventId, updates);

      // Update in events list
      setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));

      // Update in active events if present
      setActiveEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));

      return updatedEvent;
    } catch (err) {
      console.error('Failed to update event:', err);
      throw err;
    }
  };

  /**
   * Delete an event (admin only)
   */
  const deleteEvent = async (eventId) => {
    try {
      await seasonalEventService.deleteEvent(eventId);

      // Remove from events list
      setEvents(prev => prev.filter(e => e.id !== eventId));

      // Remove from active events
      setActiveEvents(prev => prev.filter(e => e.id !== eventId));

      // Remove participation data
      setParticipations(prev => {
        const updated = { ...prev };
        delete updated[eventId];
        return updated;
      });
    } catch (err) {
      console.error('Failed to delete event:', err);
      throw err;
    }
  };

  /**
   * Get event statistics (admin only)
   */
  const getEventStats = async (eventId) => {
    try {
      const stats = await seasonalEventService.getEventStats(eventId);
      return stats;
    } catch (err) {
      console.error('Failed to get event stats:', err);
      throw err;
    }
  };

  /**
   * Get event participants (admin only)
   */
  const getParticipants = async (eventId, page = 1, limit = 50) => {
    try {
      const data = await seasonalEventService.getParticipants(eventId, page, limit);
      return data;
    } catch (err) {
      console.error('Failed to get participants:', err);
      throw err;
    }
  };

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if an event is currently active (within date range)
   */
  const isEventActive = (event) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    return event.isActive && start <= now && end >= now;
  };

  /**
   * Get user's participation for an event from cache
   */
  const getCachedParticipation = (eventId) => {
    return participations[eventId] || null;
  };

  /**
   * Check if user is participating in an event
   */
  const isUserParticipating = (eventId) => {
    return !!participations[eventId];
  };

  /**
   * Get events by season
   */
  const getEventsBySeason = (season) => {
    return events.filter(e => e.season === season);
  };

  /**
   * Get upcoming events (not started yet)
   */
  const getUpcomingEvents = () => {
    const now = new Date();
    return events.filter(e => {
      const start = new Date(e.startDate);
      return e.isActive && start > now;
    });
  };

  /**
   * Get past events
   */
  const getPastEvents = () => {
    const now = new Date();
    return events.filter(e => {
      const end = new Date(e.endDate);
      return end < now;
    });
  };

  // Load active events on mount and when user changes
  useEffect(() => {
    if (user?.organizationId) {
      loadActiveEvents();
    }
  }, [user?.organizationId, loadActiveEvents]);

  const value = {
    // State
    events,
    activeEvents,
    participations,
    loading,
    error,

    // User methods
    loadEvents,
    loadActiveEvents,
    getEvent,
    joinEvent,
    getParticipation,
    logActivity,
    getLeaderboard,

    // Admin methods
    createEvent,
    updateEvent,
    deleteEvent,
    getEventStats,
    getParticipants,

    // Utility methods
    isEventActive,
    getCachedParticipation,
    isUserParticipating,
    getEventsBySeason,
    getUpcomingEvents,
    getPastEvents,
  };

  return (
    <SeasonalEventContext.Provider value={value}>
      {children}
    </SeasonalEventContext.Provider>
  );
}

export default SeasonalEventContext;
