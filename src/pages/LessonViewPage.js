import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLessons } from '../contexts/LessonContext';
import { useSession } from '../contexts/SessionContext';
import './LessonViewPage.css';

function LessonViewPage() {
  const { id } = useParams();
  const { getLessonById } = useLessons();
  const lesson = getLessonById(id);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(true);
  const [isStartingSession, setIsStartingSession] = useState(false);

  const {
    currentSession,
    isTeacher,
    createSession,
    advanceSlide,
    endSession: endLiveSession,
    currentSlideIndex,
    participants,
  } = useSession();

  if (!lesson) {
    return (
      <div className="container">
        <div className="error-message">
          Lesson not found. <Link to="/lessons">Back to Lessons</Link>
        </div>
      </div>
    );
  }

  const slides = lesson.slides || [];

  // Sync slide index when in live session mode
  useEffect(() => {
    if (currentSession && isTeacher) {
      // Sync local slide with session slide
      setCurrentSlide(currentSlideIndex);
    }
  }, [currentSession, isTeacher, currentSlideIndex]);

  // Start a live session
  const handleStartSession = async () => {
    setIsStartingSession(true);
    try {
      await createSession(lesson.id);
    } catch (error) {
      console.error('Failed to start session:', error);
    } finally {
      setIsStartingSession(false);
    }
  };

  // End the live session
  const handleEndSession = async () => {
    if (window.confirm('Are you sure you want to end this live session?')) {
      await endLiveSession();
    }
  };

  const nextSlide = () => {
    const newIndex = currentSlide + 1;
    if (newIndex < slides.length) {
      setCurrentSlide(newIndex);
      // If in live session, broadcast to all participants
      if (currentSession && isTeacher) {
        advanceSlide(newIndex);
      }
    }
  };

  const prevSlide = () => {
    const newIndex = currentSlide - 1;
    if (newIndex >= 0) {
      setCurrentSlide(newIndex);
      // If in live session, broadcast to all participants
      if (currentSession && isTeacher) {
        advanceSlide(newIndex);
      }
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    // If in live session, broadcast to all participants
    if (currentSession && isTeacher) {
      advanceSlide(index);
    }
  };

  const speakSlide = () => {
    if ('speechSynthesis' in window && slides[currentSlide]) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(slides[currentSlide].sayText);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="lesson-view-page">
      <div className="lesson-header">
        <Link to="/lessons" className="back-btn">← Back</Link>
        <h1>{lesson.title}</h1>
        <div className="slide-counter">
          {slides.length > 0 ? `Slide ${currentSlide + 1} of ${slides.length}` : 'No slides'}
        </div>
      </div>

      {/* Live Session Controls */}
      {slides.length > 0 && (
        <div className="session-controls">
          {!currentSession ? (
            <button
              onClick={handleStartSession}
              disabled={isStartingSession}
              className="btn btn-primary start-session-btn"
            >
              {isStartingSession ? 'Starting...' : '🔴 Start Live Session'}
            </button>
          ) : isTeacher ? (
            <div className="active-session-banner">
              <div className="session-info-box">
                <span className="session-label">🔴 LIVE</span>
                <div className="session-code-display">
                  <span className="code-label">Session Code:</span>
                  <span className="code-value">{currentSession.code}</span>
                </div>
                <span className="participant-count">
                  👥 {participants.length} participants
                </span>
              </div>
              <button onClick={handleEndSession} className="btn btn-danger end-session-btn">
                End Session
              </button>
            </div>
          ) : null}
        </div>
      )}

      {slides.length > 0 ? (
        <>
          <div className="lesson-content-area">
            <div className="slide-viewer">
              <div
                className="slide-content"
                dangerouslySetInnerHTML={{ __html: slides[currentSlide].html }}
              />
              {slides[currentSlide].discussionTime && (
                <div className="discussion-timer">
                  ⏱️ Discussion: {slides[currentSlide].discussionTime} min
                </div>
              )}
            </div>

            {showNotes && slides[currentSlide].notes && (
              <div className="teacher-notes">
                <h3>📝 Teacher Notes</h3>
                <p>{slides[currentSlide].notes}</p>
              </div>
            )}
          </div>

          <div className="slide-controls">
            <button onClick={prevSlide} disabled={currentSlide === 0} className="btn btn-outline">
              ← Previous
            </button>
            <button onClick={speakSlide} className="btn btn-secondary">
              🔊 Read Aloud
            </button>
            <button onClick={() => setShowNotes(!showNotes)} className="btn btn-outline">
              {showNotes ? 'Hide Notes' : 'Show Notes'}
            </button>
            <button onClick={nextSlide} disabled={currentSlide === slides.length - 1} className="btn btn-outline">
              Next →
            </button>
          </div>

          <div className="slide-thumbnails">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`thumbnail ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <p>This lesson has no slides yet.</p>
          <Link to={`/admin/edit/${lesson.id}`} className="btn btn-primary">
            Edit Lesson
          </Link>
        </div>
      )}
    </div>
  );
}

export default LessonViewPage;
