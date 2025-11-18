import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Get auth headers with JWT token
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Seasonal Events Service
 * Handles all API calls related to seasonal events
 */
const seasonalEventService = {
  /**
   * Get active events for the current organization
   * @param {string} orgId - Organization ID
   * @returns {Promise<Array>} Array of active events
   */
  async getActiveEvents(orgId) {
    try {
      const response = await axios.get(
        `${API_URL}/api/orgs/${orgId}/events/active`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching active events:', error);
      throw error;
    }
  },

  /**
   * Get all events for an organization with optional filters
   * @param {string} orgId - Organization ID
   * @param {Object} filters - Optional filters (season, active)
   * @returns {Promise<Array>} Array of events
   */
  async listEvents(orgId, filters = {}) {
    try {
      const response = await axios.get(
        `${API_URL}/api/orgs/${orgId}/events`,
        {
          headers: getAuthHeaders(),
          params: filters,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  /**
   * Get a specific event by ID
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} Event data with user participation
   */
  async getEvent(eventId) {
    try {
      const response = await axios.get(
        `${API_URL}/api/events/${eventId}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  /**
   * Join/participate in an event
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} Participation data
   */
  async joinEvent(eventId) {
    try {
      const response = await axios.post(
        `${API_URL}/api/events/${eventId}/participate`,
        {},
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error joining event:', error);
      throw error;
    }
  },

  /**
   * Get user's participation in an event
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} Participation data with activities
   */
  async getParticipation(eventId) {
    try {
      const response = await axios.get(
        `${API_URL}/api/events/${eventId}/participation`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching participation:', error);
      throw error;
    }
  },

  /**
   * Log an activity for an event
   * @param {string} eventId - Event ID
   * @param {Object} activityData - Activity data (activityType, points, metadata)
   * @returns {Promise<Object>} Created activity and updated participation
   */
  async logActivity(eventId, activityData) {
    try {
      const response = await axios.post(
        `${API_URL}/api/events/${eventId}/activity`,
        activityData,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  },

  /**
   * Get event leaderboard
   * @param {string} eventId - Event ID
   * @param {number} limit - Number of entries to return
   * @returns {Promise<Array>} Leaderboard data
   */
  async getLeaderboard(eventId, limit = 100) {
    try {
      const response = await axios.get(
        `${API_URL}/api/events/${eventId}/leaderboard`,
        {
          headers: getAuthHeaders(),
          params: { limit },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  },

  // ============================================================================
  // ADMIN METHODS
  // ============================================================================

  /**
   * Create a new seasonal event (admin only)
   * @param {string} orgId - Organization ID
   * @param {Object} eventData - Event data
   * @returns {Promise<Object>} Created event
   */
  async createEvent(orgId, eventData) {
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/orgs/${orgId}/events`,
        eventData,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  /**
   * Update an event (admin only)
   * @param {string} eventId - Event ID
   * @param {Object} updates - Event updates
   * @returns {Promise<Object>} Updated event
   */
  async updateEvent(eventId, updates) {
    try {
      const response = await axios.put(
        `${API_URL}/api/admin/events/${eventId}`,
        updates,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  /**
   * Delete an event (admin only)
   * @param {string} eventId - Event ID
   * @returns {Promise<void>}
   */
  async deleteEvent(eventId) {
    try {
      await axios.delete(
        `${API_URL}/api/admin/events/${eventId}`,
        { headers: getAuthHeaders() }
      );
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },

  /**
   * Get event statistics (admin only)
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} Event statistics
   */
  async getEventStats(eventId) {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/events/${eventId}/stats`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching event stats:', error);
      throw error;
    }
  },

  /**
   * Get event participants (admin only)
   * @param {string} eventId - Event ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Participants with pagination
   */
  async getParticipants(eventId, page = 1, limit = 50) {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/events/${eventId}/participants`,
        {
          headers: getAuthHeaders(),
          params: { page, limit },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching participants:', error);
      throw error;
    }
  },
};

export default seasonalEventService;
