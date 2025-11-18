import React, { createContext, useContext, useState, useEffect } from 'react';

const SessionContext = createContext();

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load session history from localStorage on mount
  useEffect(() => {
    const storedHistory = localStorage.getItem('session-history');
    if (storedHistory) {
      try {
        setSessionHistory(JSON.parse(storedHistory));
      } catch (error) {
        console.error('Error loading session history:', error);
      }
    }
  }, []);

  // Save session history to localStorage whenever it changes
  useEffect(() => {
    if (sessionHistory.length > 0) {
      localStorage.setItem('session-history', JSON.stringify(sessionHistory));
    }
  }, [sessionHistory]);

  /**
   * Start a new live teaching session
   */
  const startSession = (lesson, options = {}) => {
    const session = {
      id: `session-${Date.now()}`,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      totalSlides: lesson.slides?.length || 0,
      currentStepIndex: 0,
      status: 'ACTIVE',
      startedAt: new Date().toISOString(),
      slidesAdvanced: 0,
      groupId: options.groupId || null,
      sessionCode: options.sessionCode || null,
      // Store full lesson data for offline mode
      lessonData: lesson,
    };

    setCurrentSession(session);

    // Save to localStorage for persistence
    localStorage.setItem('current-session', JSON.stringify(session));

    return session;
  };

  /**
   * Advance to a specific slide index
   */
  const advanceToSlide = (stepIndex) => {
    if (!currentSession) {
      console.error('No active session');
      return;
    }

    const updatedSession = {
      ...currentSession,
      currentStepIndex: stepIndex,
      slidesAdvanced: currentSession.slidesAdvanced + 1,
      lastActivityAt: new Date().toISOString(),
    };

    setCurrentSession(updatedSession);
    localStorage.setItem('current-session', JSON.stringify(updatedSession));
  };

  /**
   * Go to next slide
   */
  const nextSlide = () => {
    if (!currentSession) return;

    const nextIndex = Math.min(
      currentSession.currentStepIndex + 1,
      currentSession.totalSlides - 1
    );

    advanceToSlide(nextIndex);
  };

  /**
   * Go to previous slide
   */
  const previousSlide = () => {
    if (!currentSession) return;

    const prevIndex = Math.max(currentSession.currentStepIndex - 1, 0);
    advanceToSlide(prevIndex);
  };

  /**
   * Jump to a specific slide by index
   */
  const jumpToSlide = (index) => {
    if (!currentSession) return;

    const validIndex = Math.max(0, Math.min(index, currentSession.totalSlides - 1));
    advanceToSlide(validIndex);
  };

  /**
   * End the current session
   */
  const endSession = () => {
    if (!currentSession) {
      console.error('No active session to end');
      return;
    }

    const endedAt = new Date();
    const startedAt = new Date(currentSession.startedAt);
    const durationMinutes = Math.round((endedAt - startedAt) / 60000);

    const completedSession = {
      ...currentSession,
      status: 'COMPLETED',
      endedAt: endedAt.toISOString(),
      durationMinutes,
    };

    // Add to session history
    setSessionHistory([completedSession, ...sessionHistory]);

    // Clear current session
    setCurrentSession(null);
    localStorage.removeItem('current-session');

    return completedSession;
  };

  /**
   * Resume a session from localStorage (in case of page refresh)
   */
  const resumeSession = () => {
    const storedSession = localStorage.getItem('current-session');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        if (session.status === 'ACTIVE') {
          setCurrentSession(session);
          return session;
        }
      } catch (error) {
        console.error('Error resuming session:', error);
      }
    }
    return null;
  };

  /**
   * Get session metrics
   */
  const getSessionMetrics = () => {
    const completedSessions = sessionHistory.filter(s => s.status === 'COMPLETED');

    const totalSessions = sessionHistory.length;
    const totalCompleted = completedSessions.length;

    const avgDuration = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) / completedSessions.length
      : 0;

    const avgSlidesAdvanced = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + s.slidesAdvanced, 0) / completedSessions.length
      : 0;

    return {
      totalSessions,
      completedSessions: totalCompleted,
      activeSessions: currentSession ? 1 : 0,
      averageSessionLength: Math.round(avgDuration),
      averageSlidesAdvanced: Math.round(avgSlidesAdvanced),
    };
  };

  /**
   * Clear session history
   */
  const clearHistory = () => {
    setSessionHistory([]);
    localStorage.removeItem('session-history');
  };

  const value = {
    currentSession,
    sessionHistory,
    loading,
    startSession,
    advanceToSlide,
    nextSlide,
    previousSlide,
    jumpToSlide,
    endSession,
    resumeSession,
    getSessionMetrics,
    clearHistory,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};
