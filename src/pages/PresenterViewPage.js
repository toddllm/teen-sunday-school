import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLessons } from '../contexts/LessonContext';
import { useSession } from '../contexts/SessionContext';
import './PresenterViewPage.css';

function PresenterViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getLessonById } = useLessons();
  const {
    currentSession,
    nextSlide,
    previousSlide,
    jumpToSlide,
    endSession,
    resumeSession,
  } = useSession();

  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [showJumpMenu, setShowJumpMenu] = useState(false);

  const lesson = getLessonById(id);

  // Resume session on mount if exists
  useEffect(() => {
    if (!currentSession) {
      const resumed = resumeSession();
      if (!resumed) {
        // No active session, redirect back to lesson view
        navigate(`/lessons/${id}`);
      }
    }
  }, [currentSession, resumeSession, navigate, id]);

  // Update elapsed time every second
  useEffect(() => {
    if (!currentSession) return;

    const timer = setInterval(() => {
      const start = new Date(currentSession.startedAt);
      const now = new Date();
      const diff = Math.floor((now - start) / 1000);

      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setElapsedTime(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [currentSession]);

  const handleEndSession = () => {
    if (window.confirm('Are you sure you want to end this teaching session?')) {
      endSession();
      navigate(`/lessons/${id}`);
    }
  };

  const handleJumpToSlide = (index) => {
    jumpToSlide(index);
    setShowJumpMenu(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      previousSlide();
    } else if (e.key === 'Escape') {
      setShowJumpMenu(false);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!lesson || !currentSession) {
    return (
      <div className="container">
        <div className="error-message">
          Session not found. <Link to="/lessons">Back to Lessons</Link>
        </div>
      </div>
    );
  }

  const slides = lesson.slides || [];
  const currentSlideIndex = currentSession.currentStepIndex;
  const currentSlideData = slides[currentSlideIndex];
  const nextSlideData = currentSlideIndex < slides.length - 1 ? slides[currentSlideIndex + 1] : null;

  return (
    <div className="presenter-view-page">
      {/* Header with session info */}
      <div className="presenter-header">
        <div className="session-info">
          <span className="session-status">🔴 LIVE</span>
          <span className="session-time">⏱️ {elapsedTime}</span>
          {currentSession.sessionCode && (
            <span className="session-code">
              Code: <strong>{currentSession.sessionCode}</strong>
            </span>
          )}
        </div>
        <h1 className="lesson-title">{lesson.title}</h1>
        <button onClick={handleEndSession} className="btn btn-danger btn-sm">
          End Session
        </button>
      </div>

      <div className="presenter-layout">
        {/* Main content area - current slide */}
        <div className="presenter-main">
          <div className="slide-counter">
            Slide {currentSlideIndex + 1} of {slides.length}
          </div>

          <div className="current-slide">
            {currentSlideData && (
              <>
                <div
                  className="slide-content"
                  dangerouslySetInnerHTML={{ __html: currentSlideData.html }}
                />
                {currentSlideData.discussionTime && (
                  <div className="discussion-timer">
                    ⏱️ Discussion: {currentSlideData.discussionTime} min
                  </div>
                )}
              </>
            )}
          </div>

          {/* Navigation controls */}
          <div className="presenter-controls">
            <button
              onClick={previousSlide}
              disabled={currentSlideIndex === 0}
              className="btn btn-outline btn-lg"
            >
              ← Previous
            </button>

            <button
              onClick={() => setShowJumpMenu(!showJumpMenu)}
              className="btn btn-secondary"
            >
              Jump to Slide
            </button>

            <button
              onClick={nextSlide}
              disabled={currentSlideIndex === slides.length - 1}
              className="btn btn-primary btn-lg"
            >
              Next →
            </button>
          </div>

          {/* Jump menu */}
          {showJumpMenu && (
            <div className="jump-menu">
              <div className="jump-menu-header">
                <h3>Jump to Slide</h3>
                <button
                  onClick={() => setShowJumpMenu(false)}
                  className="btn-close"
                >
                  ✕
                </button>
              </div>
              <div className="jump-menu-slides">
                {slides.map((slide, index) => (
                  <button
                    key={index}
                    onClick={() => handleJumpToSlide(index)}
                    className={`jump-slide-btn ${
                      index === currentSlideIndex ? 'active' : ''
                    }`}
                  >
                    <span className="slide-number">{index + 1}</span>
                    <div
                      className="slide-preview"
                      dangerouslySetInnerHTML={{ __html: slide.html }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - notes and next slide */}
        <div className="presenter-sidebar">
          {/* Current slide notes */}
          <div className="sidebar-section">
            <h3>📝 Teacher Notes</h3>
            <div className="notes-content">
              {currentSlideData?.notes ? (
                <p>{currentSlideData.notes}</p>
              ) : (
                <p className="no-notes">No notes for this slide</p>
              )}
            </div>
          </div>

          {/* Next slide preview */}
          {nextSlideData && (
            <div className="sidebar-section">
              <h3>⏭️ Next Slide</h3>
              <div className="next-slide-preview">
                <div
                  className="preview-content"
                  dangerouslySetInnerHTML={{ __html: nextSlideData.html }}
                />
              </div>
              {nextSlideData.notes && (
                <div className="next-notes">
                  <small>{nextSlideData.notes}</small>
                </div>
              )}
            </div>
          )}

          {/* Session stats */}
          <div className="sidebar-section session-stats">
            <h3>📊 Session Stats</h3>
            <div className="stats-grid">
              <div className="stat">
                <span className="stat-label">Slides Advanced</span>
                <span className="stat-value">{currentSession.slidesAdvanced}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Progress</span>
                <span className="stat-value">
                  {Math.round(((currentSlideIndex + 1) / slides.length) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Keyboard shortcuts */}
          <div className="sidebar-section shortcuts">
            <h3>⌨️ Shortcuts</h3>
            <ul>
              <li><kbd>→</kbd> or <kbd>Space</kbd> - Next slide</li>
              <li><kbd>←</kbd> - Previous slide</li>
              <li><kbd>Esc</kbd> - Close jump menu</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PresenterViewPage;
