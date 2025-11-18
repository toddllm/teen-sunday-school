import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import {
  createSession as apiCreateSession,
  getSessionByCode,
  endSession as apiEndSession,
  initializeSocket,
  disconnectSocket,
  getSocket,
  socketJoinSession,
  socketAdvanceSlide,
  socketSaveNote,
  socketEndSession,
  onSessionEvent,
  offSessionEvent,
  SESSION_EVENTS,
} from '../services/sessionAPI';

const SessionContext = createContext();

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  // Session state
  const [currentSession, setCurrentSession] = useState(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [participantId, setParticipantId] = useState(null);
  const [notes, setNotes] = useState({}); // { slideIndex: noteContent }
  const [sessionStatus, setSessionStatus] = useState(null); // 'ACTIVE', 'PAUSED', 'ENDED'
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // ========================================================================
  // WEBSOCKET EVENT HANDLERS
  // ========================================================================

  useEffect(() => {
    if (!currentSession) return;

    const socket = getSocket();

    // Handle connection events
    const handleConnect = () => {
      setIsConnected(true);
      console.log('Socket connected');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    };

    // Handle session joined
    const handleSessionJoined = (data) => {
      console.log('Session joined:', data);
      setParticipantId(data.participantId);
      setCurrentSlideIndex(data.currentSlideIndex);
    };

    // Handle slide changes
    const handleSlideChanged = (data) => {
      console.log('Slide changed:', data);
      setCurrentSlideIndex(data.slideIndex);
    };

    // Handle participant joined
    const handleParticipantJoined = (data) => {
      console.log('Participant joined:', data);
      setParticipants((prev) => [...prev, data]);
    };

    // Handle participant left
    const handleParticipantLeft = (data) => {
      console.log('Participant left:', data);
      setParticipants((prev) =>
        prev.filter((p) => p.participantId !== data.participantId)
      );
    };

    // Handle session paused
    const handleSessionPaused = () => {
      console.log('Session paused');
      setSessionStatus('PAUSED');
    };

    // Handle session resumed
    const handleSessionResumed = () => {
      console.log('Session resumed');
      setSessionStatus('ACTIVE');
    };

    // Handle session ended
    const handleSessionEnded = () => {
      console.log('Session ended');
      setSessionStatus('ENDED');
      // Optionally show a message to the user
    };

    // Handle note saved
    const handleNoteSaved = (data) => {
      console.log('Note saved:', data);
    };

    // Handle errors
    const handleError = (data) => {
      console.error('Socket error:', data);
      setError(data.message);
    };

    // Register event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    onSessionEvent(SESSION_EVENTS.SESSION_JOINED, handleSessionJoined);
    onSessionEvent(SESSION_EVENTS.SLIDE_CHANGED, handleSlideChanged);
    onSessionEvent(SESSION_EVENTS.PARTICIPANT_JOINED, handleParticipantJoined);
    onSessionEvent(SESSION_EVENTS.PARTICIPANT_LEFT, handleParticipantLeft);
    onSessionEvent(SESSION_EVENTS.SESSION_PAUSED, handleSessionPaused);
    onSessionEvent(SESSION_EVENTS.SESSION_RESUMED, handleSessionResumed);
    onSessionEvent(SESSION_EVENTS.SESSION_ENDED, handleSessionEnded);
    onSessionEvent(SESSION_EVENTS.NOTE_SAVED, handleNoteSaved);
    onSessionEvent(SESSION_EVENTS.ERROR, handleError);

    // Cleanup on unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      offSessionEvent(SESSION_EVENTS.SESSION_JOINED, handleSessionJoined);
      offSessionEvent(SESSION_EVENTS.SLIDE_CHANGED, handleSlideChanged);
      offSessionEvent(SESSION_EVENTS.PARTICIPANT_JOINED, handleParticipantJoined);
      offSessionEvent(SESSION_EVENTS.PARTICIPANT_LEFT, handleParticipantLeft);
      offSessionEvent(SESSION_EVENTS.SESSION_PAUSED, handleSessionPaused);
      offSessionEvent(SESSION_EVENTS.SESSION_RESUMED, handleSessionResumed);
      offSessionEvent(SESSION_EVENTS.SESSION_ENDED, handleSessionEnded);
      offSessionEvent(SESSION_EVENTS.NOTE_SAVED, handleNoteSaved);
      offSessionEvent(SESSION_EVENTS.ERROR, handleError);
    };
  }, [currentSession]);

  // ========================================================================
  // SESSION FUNCTIONS
  // ========================================================================

  /**
   * Create a new session (teacher only)
   */
  const createSession = useCallback(async (lessonId, groupId = null) => {
    try {
      setError(null);
      const response = await apiCreateSession(lessonId, groupId);

      if (response.success) {
        const session = response.session;
        setCurrentSession(session);
        setIsTeacher(true);
        setCurrentSlideIndex(session.currentSlideIndex);
        setSessionStatus(session.status);

        // Initialize WebSocket
        initializeSocket();

        return session;
      }
    } catch (err) {
      console.error('Error creating session:', err);
      setError(err.response?.data?.error || 'Failed to create session');
      throw err;
    }
  }, []);

  /**
   * Join a session by code (student)
   */
  const joinSessionByCode = useCallback(async (code, displayName = null) => {
    try {
      setError(null);

      // First, verify the session exists
      const response = await getSessionByCode(code);

      if (response.success) {
        const session = response.session;
        setCurrentSession(session);
        setIsTeacher(false);
        setCurrentSlideIndex(session.currentSlideIndex);
        setSessionStatus(session.status);

        // Initialize WebSocket and join the session
        initializeSocket();
        socketJoinSession(code, displayName);

        return session;
      }
    } catch (err) {
      console.error('Error joining session:', err);
      setError(err.response?.data?.error || 'Failed to join session');
      throw err;
    }
  }, []);

  /**
   * Advance to a specific slide (teacher only)
   */
  const advanceSlide = useCallback(
    (slideIndex) => {
      if (!isTeacher || !currentSession) {
        console.error('Only teachers can advance slides');
        return;
      }

      socketAdvanceSlide(currentSession.id, slideIndex);
      setCurrentSlideIndex(slideIndex);
    },
    [isTeacher, currentSession]
  );

  /**
   * Go to next slide (teacher only)
   */
  const nextSlide = useCallback(() => {
    advanceSlide(currentSlideIndex + 1);
  }, [currentSlideIndex, advanceSlide]);

  /**
   * Go to previous slide (teacher only)
   */
  const previousSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      advanceSlide(currentSlideIndex - 1);
    }
  }, [currentSlideIndex, advanceSlide]);

  /**
   * Save a note for the current slide
   */
  const saveNote = useCallback(
    (slideIndex, content) => {
      if (!currentSession || !participantId) {
        console.error('Cannot save note: not in a session');
        return;
      }

      // Update local state
      setNotes((prev) => ({
        ...prev,
        [slideIndex]: content,
      }));

      // Send to server
      socketSaveNote(currentSession.id, slideIndex, content);
    },
    [currentSession, participantId]
  );

  /**
   * Get note for a specific slide
   */
  const getNote = useCallback(
    (slideIndex) => {
      return notes[slideIndex] || '';
    },
    [notes]
  );

  /**
   * End the session (teacher only)
   */
  const endSession = useCallback(async () => {
    if (!isTeacher || !currentSession) {
      console.error('Only teachers can end sessions');
      return;
    }

    try {
      socketEndSession(currentSession.id);
      await apiEndSession(currentSession.id);
      setSessionStatus('ENDED');
    } catch (err) {
      console.error('Error ending session:', err);
      setError(err.response?.data?.error || 'Failed to end session');
    }
  }, [isTeacher, currentSession]);

  /**
   * Leave the session (cleanup)
   */
  const leaveSession = useCallback(() => {
    disconnectSocket();
    setCurrentSession(null);
    setIsTeacher(false);
    setCurrentSlideIndex(0);
    setParticipants([]);
    setParticipantId(null);
    setNotes({});
    setSessionStatus(null);
    setError(null);
    setIsConnected(false);
  }, []);

  // ========================================================================
  // CONTEXT VALUE
  // ========================================================================

  const value = {
    // State
    currentSession,
    isTeacher,
    currentSlideIndex,
    participants,
    participantId,
    notes,
    sessionStatus,
    error,
    isConnected,

    // Functions
    createSession,
    joinSessionByCode,
    advanceSlide,
    nextSlide,
    previousSlide,
    saveNote,
    getNote,
    endSession,
    leaveSession,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export default SessionContext;
