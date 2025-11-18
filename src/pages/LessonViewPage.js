import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLessons } from '../contexts/LessonContext';
import { useActivity, ACTIVITY_TYPES } from '../contexts/ActivityContext';
import './LessonViewPage.css';

function LessonViewPage() {
  const { id } = useParams();
  const { getLessonById } = useLessons();
  const { logActivity } = useActivity();
  const lesson = getLessonById(id);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(true);
  const hasLoggedView = useRef(false);
  const hasLoggedCompletion = useRef(false);

  // Log lesson view on mount
  useEffect(() => {
    if (lesson && !hasLoggedView.current) {
      logActivity(ACTIVITY_TYPES.LESSON_VIEWED, {
        lessonId: lesson.id,
        lessonTitle: lesson.title
      });
      hasLoggedView.current = true;
    }
  }, [lesson, logActivity]);

  // Log lesson completion when reaching last slide
  useEffect(() => {
    const slides = lesson?.slides || [];
    if (lesson && slides.length > 0 && currentSlide === slides.length - 1 && !hasLoggedCompletion.current) {
      logActivity(ACTIVITY_TYPES.LESSON_COMPLETED, {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        totalSlides: slides.length
      });
      hasLoggedCompletion.current = true;
    }
  }, [lesson, currentSlide, logActivity]);

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

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
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
                onClick={() => setCurrentSlide(index)}
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
