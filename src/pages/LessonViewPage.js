import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLessons } from '../contexts/LessonContext';
import ReadAloudControls from '../components/ReadAloudControls';
import { formatSlideForSpeech } from '../services/readAloudService';
import './LessonViewPage.css';

function LessonViewPage() {
  const { id } = useParams();
  const { getLessonById } = useLessons();
  const lesson = getLessonById(id);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(true);

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
            <button onClick={() => setShowNotes(!showNotes)} className="btn btn-outline">
              {showNotes ? 'Hide Notes' : 'Show Notes'}
            </button>
            <button onClick={nextSlide} disabled={currentSlide === slides.length - 1} className="btn btn-outline">
              Next →
            </button>
          </div>

          <ReadAloudControls
            text={slides[currentSlide] ? formatSlideForSpeech(slides[currentSlide]) : ''}
            compact={false}
          />

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
