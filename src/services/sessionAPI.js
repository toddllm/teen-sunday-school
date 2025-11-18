import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Session API Service
 * Handles both REST API calls and WebSocket connections for live sessions
 */

// ============================================================================
// REST API FUNCTIONS
// ============================================================================

/**
 * Create a new session
 */
export const createSession = async (lessonId, groupId = null) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.post(
    `${API_BASE_URL}/api/sessions/create`,
    { lessonId, groupId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

/**
 * Get session by code
 */
export const getSessionByCode = async (code) => {
  const response = await axios.get(`${API_BASE_URL}/api/sessions/code/${code}`);
  return response.data;
};

/**
 * Join a session by code
 */
export const joinSession = async (code, displayName = null, anonymousId = null) => {
  const token = localStorage.getItem('accessToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await axios.post(
    `${API_BASE_URL}/api/sessions/code/${code}/join`,
    { displayName, anonymousId },
    { headers }
  );
  return response.data;
};

/**
 * Get session by ID
 */
export const getSession = async (sessionId) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.get(`${API_BASE_URL}/api/sessions/${sessionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Get current session state (for polling)
 */
export const getSessionState = async (sessionId) => {
  const response = await axios.get(`${API_BASE_URL}/api/sessions/${sessionId}/state`);
  return response.data;
};

/**
 * End a session
 */
export const endSession = async (sessionId) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.post(
    `${API_BASE_URL}/api/sessions/${sessionId}/end`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

/**
 * Get session statistics
 */
export const getSessionStats = async (sessionId) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.get(`${API_BASE_URL}/api/sessions/${sessionId}/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Get participant notes
 */
export const getParticipantNotes = async (sessionId, participantId) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.get(
    `${API_BASE_URL}/api/sessions/${sessionId}/notes/${participantId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

/**
 * Get active sessions
 */
export const getActiveSessions = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.get(`${API_BASE_URL}/api/sessions/active`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Get my session history
 */
export const getMySessionHistory = async (limit = 20) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.get(`${API_BASE_URL}/api/sessions/my-sessions?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// ============================================================================
// WEBSOCKET FUNCTIONS
// ============================================================================

let socket = null;

/**
 * Initialize WebSocket connection
 */
export const initializeSocket = () => {
  if (socket && socket.connected) {
    return socket;
  }

  const token = localStorage.getItem('accessToken');

  socket = io(API_BASE_URL, {
    auth: {
      token: token || null,
    },
    transports: ['websocket', 'polling'],
  });

  return socket;
};

/**
 * Get the current socket instance
 */
export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Join a session via WebSocket
 */
export const socketJoinSession = (sessionCode, displayName = null, anonymousId = null) => {
  const currentSocket = getSocket();
  currentSocket.emit('join-session', {
    sessionCode,
    displayName,
    anonymousId: anonymousId || `anon-${Date.now()}`,
  });
};

/**
 * Advance slide (teacher only)
 */
export const socketAdvanceSlide = (sessionId, slideIndex) => {
  const currentSocket = getSocket();
  currentSocket.emit('advance-slide', { sessionId, slideIndex });
};

/**
 * Update participant status (heartbeat)
 */
export const socketUpdateStatus = () => {
  const currentSocket = getSocket();
  currentSocket.emit('update-status');
};

/**
 * Save a note
 */
export const socketSaveNote = (sessionId, slideIndex, content) => {
  const currentSocket = getSocket();
  currentSocket.emit('save-note', { sessionId, slideIndex, content });
};

/**
 * Pause session (teacher only)
 */
export const socketPauseSession = (sessionId) => {
  const currentSocket = getSocket();
  currentSocket.emit('pause-session', { sessionId });
};

/**
 * Resume session (teacher only)
 */
export const socketResumeSession = (sessionId) => {
  const currentSocket = getSocket();
  currentSocket.emit('resume-session', { sessionId });
};

/**
 * End session (teacher only)
 */
export const socketEndSession = (sessionId) => {
  const currentSocket = getSocket();
  currentSocket.emit('end-session', { sessionId });
};

/**
 * Listen to session events
 */
export const onSessionEvent = (eventName, callback) => {
  const currentSocket = getSocket();
  currentSocket.on(eventName, callback);
};

/**
 * Remove event listener
 */
export const offSessionEvent = (eventName, callback) => {
  const currentSocket = getSocket();
  if (callback) {
    currentSocket.off(eventName, callback);
  } else {
    currentSocket.off(eventName);
  }
};

// ============================================================================
// EVENT NAMES (for reference)
// ============================================================================

export const SESSION_EVENTS = {
  // Incoming events
  SESSION_JOINED: 'session-joined',
  PARTICIPANT_JOINED: 'participant-joined',
  PARTICIPANT_LEFT: 'participant-left',
  SLIDE_CHANGED: 'slide-changed',
  SESSION_PAUSED: 'session-paused',
  SESSION_RESUMED: 'session-resumed',
  SESSION_ENDED: 'session-ended',
  NOTE_SAVED: 'note-saved',
  ERROR: 'error',

  // Outgoing events (handled by socket* functions above)
  JOIN_SESSION: 'join-session',
  ADVANCE_SLIDE: 'advance-slide',
  UPDATE_STATUS: 'update-status',
  SAVE_NOTE: 'save-note',
  PAUSE_SESSION: 'pause-session',
  RESUME_SESSION: 'resume-session',
  END_SESSION: 'end-session',
};
