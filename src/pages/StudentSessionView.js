import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useSession } from '../contexts/SessionContext';
import { useLessons } from '../contexts/LessonContext';
import './StudentSessionView.css';

function StudentSessionView() {
  const navigate = useNavigate();
  const {
    currentSession,
    currentSlideIndex,
    sessionStatus,
    isConnected,
    saveNote,
    getNote,
    leaveSession,
    participants,
  } = useSession();

  const { getLessonById } = useLessons();
  const [currentNote, setCurrentNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lesson, setLesson] = useState(null);

  // Load lesson data
  useEffect(() => {
    if (currentSession) {
      const lessonData = getLessonById(currentSession.lessonId);
      setLesson(lessonData);
    }
  }, [currentSession, getLessonById]);

  // Load note for current slide
  useEffect(() => {
    const note = getNote(currentSlideIndex);
    setCurrentNote(note);
  }, [currentSlideIndex, getNote]);

  // Redirect if not in a session
  useEffect(() => {
    if (!currentSession) {
      navigate('/join-session');
    }
  }, [currentSession, navigate]);

  if (!currentSession || !lesson) {
    return (
      <div className="student-session-view loading">
        <p>Loading session...</p>
      </div>
    );
  }

  const slides = lesson.slides || [];
  const currentSlide = slides[currentSlideIndex];

  const handleSaveNote = () => {
    setIsSaving(true);
    saveNote(currentSlideIndex, currentNote);
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleLeave = () => {
    if (window.confirm('Are you sure you want to leave the session?')) {
      leaveSession();
      navigate('/');
    }
  };

  return (
    <div className="student-session-view">
      {/* Header with session info */}
      <div className="session-header">
        <div className="session-info">
          <h2>{lesson.title}</h2>
          <div className="session-meta">
            <span className="session-code">Code: {currentSession.code}</span>
            <span className={`session-status ${sessionStatus?.toLowerCase()}`}>
              {sessionStatus === 'ACTIVE' && '🟢 Live'}
              {sessionStatus === 'PAUSED' && '🟡 Paused'}
              {sessionStatus === 'ENDED' && '🔴 Ended'}
            </span>
            <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '📡 Connected' : '📡 Disconnected'}
            </span>
          </div>
        </div>
        <button onClick={handleLeave} className="leave-button">
          Leave Session
        </button>
      </div>

      {/* Session ended message */}
      {sessionStatus === 'ENDED' && (
        <div className="session-ended-banner">
          <h3>Session Ended</h3>
          <p>This session has been ended by the teacher. Your notes have been saved.</p>
          <button onClick={handleLeave} className="btn-primary">
            Return to Home
          </button>
        </div>
      )}

      {/* Paused message */}
      {sessionStatus === 'PAUSED' && (
        <div className="session-paused-banner">
          <p>⏸️ Session paused by teacher</p>
        </div>
      )}

      {/* Slide display */}
      <div className="slide-section">
        <div className="slide-counter">
          Slide {currentSlideIndex + 1} of {slides.length}
        </div>

        {currentSlide ? (
          <div className="slide-viewer">
            <div
              className="slide-content"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentSlide.html) }}
            />
            {currentSlide.discussionTime && (
              <div className="discussion-timer">
                ⏱️ Discussion: {currentSlide.discussionTime} min
              </div>
            )}
          </div>
        ) : (
          <div className="no-slide">
            <p>Waiting for teacher to start...</p>
          </div>
        )}
      </div>

      {/* Note-taking section */}
      <div className="notes-section">
        <div className="notes-header">
          <h3>📝 My Notes for Slide {currentSlideIndex + 1}</h3>
          <button
            onClick={handleSaveNote}
            className={`save-note-button ${isSaving ? 'saving' : ''}`}
            disabled={isSaving}
          >
            {isSaving ? '✓ Saved!' : 'Save Note'}
          </button>
        </div>
        <textarea
          className="note-input"
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          onBlur={handleSaveNote}
          placeholder="Take notes here... (automatically saved)"
          rows={4}
        />
        <p className="note-hint">
          Your notes are private and will be saved automatically
        </p>
      </div>

      {/* Participant count (optional) */}
      <div className="session-footer">
        <span className="participant-count">
          👥 {participants.length} participants in this session
        </span>
      </div>
    </div>
  );
}

export default StudentSessionView;
