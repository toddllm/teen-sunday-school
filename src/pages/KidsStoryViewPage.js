import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useKidsContent } from '../contexts/KidsContentContext';
import { useKidsMode } from '../contexts/KidsModeContext';
import './KidsStoryViewPage.css';

const KidsStoryViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getContentById, toggleFavorite, isFavorite, markCompleted } = useKidsContent();
  const { markStoryCompleted } = useKidsMode();
  const [isReading, setIsReading] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState([]);

  const story = getContentById(id);

  useEffect(() => {
    // Stop any ongoing speech when component unmounts
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  if (!story) {
    return (
      <div className="kids-story-view">
        <div className="story-not-found">
          <div className="not-found-emoji">😕</div>
          <h2>Oops! Story not found</h2>
          <button className="kids-btn kids-btn-primary" onClick={() => navigate('/kids')}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const handleReadAloud = () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(story.content);
      utterance.rate = 0.9; // Slightly slower for kids
      utterance.pitch = 1.1; // Slightly higher pitch
      utterance.onend = () => setIsReading(false);
      window.speechSynthesis.speak(utterance);
      setIsReading(true);
    }
  };

  const handleToggleFavorite = () => {
    toggleFavorite(story.id);
  };

  const handleStoryComplete = () => {
    markCompleted(story.id);
    markStoryCompleted(story.id);
    setShowQuestions(true);
  };

  const handleQuestionComplete = (index) => {
    if (!completedQuestions.includes(index)) {
      setCompletedQuestions([...completedQuestions, index]);
    }
  };

  const allQuestionsAnswered = story.questions && completedQuestions.length === story.questions.length;

  return (
    <div className="kids-story-view">
      {/* Header */}
      <div className="story-header">
        <button className="back-button" onClick={() => navigate('/kids')}>
          <span className="back-icon">←</span> Home
        </button>
        <div className="story-actions">
          <button
            className={`favorite-button ${isFavorite(story.id) ? 'is-favorite' : ''}`}
            onClick={handleToggleFavorite}
          >
            {isFavorite(story.id) ? '❤️' : '🤍'}
          </button>
        </div>
      </div>

      {/* Story Title */}
      <div className="story-title-section">
        <div className="story-emoji">{story.emoji}</div>
        <h1 className="story-title">{story.title}</h1>
        <div className="story-meta">
          <span className="meta-item">
            <span className="meta-icon">⏱️</span> {story.duration}
          </span>
          <span className="meta-item">
            <span className="meta-icon">👶</span> Ages {story.ageRange}
          </span>
          {story.type === 'story' && (
            <span className="meta-item">
              <span className="meta-icon">📖</span> Story
            </span>
          )}
          {story.type === 'song' && (
            <span className="meta-item">
              <span className="meta-icon">🎵</span> Song
            </span>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="story-controls">
        {story.audioEnabled && (
          <button
            className={`kids-btn kids-btn-large ${isReading ? 'kids-btn-danger' : 'kids-btn-primary'}`}
            onClick={handleReadAloud}
          >
            <span className="btn-icon">{isReading ? '⏸️' : '▶️'}</span>
            {isReading ? 'Stop Reading' : 'Read to Me!'}
          </button>
        )}
      </div>

      {/* Story Content */}
      <div className="story-content-section">
        <div className="story-content">
          {story.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="story-paragraph">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Memory Verse */}
      {story.memoryVerse && (
        <div className="memory-verse-section">
          <h3 className="section-title">
            <span className="section-icon">📝</span>
            Remember This!
          </h3>
          <div className="memory-verse">
            <p className="verse-text">"{story.memoryVerse.text}"</p>
            <p className="verse-reference">- {story.memoryVerse.reference}</p>
          </div>
        </div>
      )}

      {/* Bible References */}
      {story.passageRefs && story.passageRefs.length > 0 && (
        <div className="bible-refs-section">
          <h3 className="section-title">
            <span className="section-icon">📖</span>
            Find in Bible
          </h3>
          <div className="bible-refs">
            {story.passageRefs.map((ref, index) => (
              <span key={index} className="bible-ref-tag">
                {ref}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Questions Section */}
      {story.questions && story.questions.length > 0 && (
        <div className="questions-section">
          <button
            className="kids-btn kids-btn-secondary kids-btn-large"
            onClick={() => setShowQuestions(!showQuestions)}
          >
            <span className="btn-icon">🤔</span>
            {showQuestions ? 'Hide Questions' : 'Answer Questions!'}
          </button>

          {showQuestions && (
            <div className="questions-list">
              <h3 className="section-title">Think About It!</h3>
              {story.questions.map((question, index) => (
                <div
                  key={index}
                  className={`question-item ${completedQuestions.includes(index) ? 'completed' : ''}`}
                  onClick={() => handleQuestionComplete(index)}
                >
                  <div className="question-number">{index + 1}</div>
                  <p className="question-text">{question}</p>
                  <div className="question-check">
                    {completedQuestions.includes(index) ? '✅' : '⭕'}
                  </div>
                </div>
              ))}

              {allQuestionsAnswered && (
                <div className="congrats-message">
                  <span className="congrats-icon">🎉</span>
                  Great job! You answered all the questions!
                  <span className="congrats-icon">🎉</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Completion Button */}
      <div className="completion-section">
        <button className="kids-btn kids-btn-success kids-btn-large" onClick={handleStoryComplete}>
          <span className="btn-icon">🏆</span>
          I Finished This Story!
        </button>
      </div>

      {/* Summary */}
      <div className="story-summary">
        <p>{story.summary}</p>
      </div>

      {/* Navigation */}
      <div className="story-navigation">
        <button className="kids-btn kids-btn-outline" onClick={() => navigate('/kids')}>
          <span className="btn-icon">🏠</span>
          Back Home
        </button>
        <button className="kids-btn kids-btn-outline" onClick={() => navigate('/kids/all-stories')}>
          <span className="btn-icon">📚</span>
          More Stories
        </button>
      </div>
    </div>
  );
};

export default KidsStoryViewPage;
