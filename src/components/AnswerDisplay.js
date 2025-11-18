import React, { useState } from 'react';
import { useQA } from '../contexts/QAContext';
import { useNavigate } from 'react-router-dom';
import './AnswerDisplay.css';

const AnswerDisplay = ({ qa, onFollowUpClick }) => {
  const { rateAnswer } = useQA();
  const navigate = useNavigate();
  const [expandedRefs, setExpandedRefs] = useState({});

  const handleRating = (rating) => {
    rateAnswer(qa.id, rating);
  };

  const toggleReference = (index) => {
    setExpandedRefs(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleVerseClick = (verseRef) => {
    // Navigate to Bible Tool page with the verse pre-filled
    navigate(`/bible?verse=${encodeURIComponent(verseRef)}`);
  };

  return (
    <div className="answer-display">
      {/* Question */}
      <div className="qa-question">
        <h2>Your Question:</h2>
        <p className="question-text">{qa.question}</p>
      </div>

      {/* Answer */}
      <div className="qa-answer">
        <h2>Answer:</h2>
        <p className="answer-text">{qa.answer}</p>
      </div>

      {/* Themes */}
      {qa.themes && qa.themes.length > 0 && (
        <div className="qa-themes">
          <h3>Related Themes:</h3>
          <div className="theme-tags">
            {qa.themes.map((theme, index) => (
              <span key={index} className="theme-tag">
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bible References */}
      {qa.references && qa.references.length > 0 && (
        <div className="qa-references">
          <h3>Scripture References:</h3>
          <div className="references-list">
            {qa.references.map((ref, index) => (
              <div key={index} className="reference-item">
                <div className="reference-header">
                  <button
                    onClick={() => handleVerseClick(ref.verse)}
                    className="verse-link"
                  >
                    📖 {ref.verse}
                  </button>
                  {ref.text && (
                    <button
                      onClick={() => toggleReference(index)}
                      className="expand-button"
                    >
                      {expandedRefs[index] ? '▼' : '▶'}
                      {expandedRefs[index] ? 'Hide' : 'Show'} Text
                    </button>
                  )}
                </div>

                {ref.relevance && (
                  <p className="reference-relevance">{ref.relevance}</p>
                )}

                {expandedRefs[index] && ref.text && (
                  <div className="verse-text">
                    <p>{ref.text}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Follow-up Questions */}
      {qa.followUpQuestions && qa.followUpQuestions.length > 0 && (
        <div className="qa-followups">
          <h3>Explore Further:</h3>
          <div className="followup-list">
            {qa.followUpQuestions.map((followUp, index) => (
              <button
                key={index}
                onClick={() => onFollowUpClick(followUp)}
                className="followup-button"
              >
                {followUp}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rating */}
      <div className="qa-rating">
        <h3>Was this answer helpful?</h3>
        <div className="rating-buttons">
          <button
            onClick={() => handleRating('up')}
            className={`rating-button ${qa.rating === 'up' ? 'active' : ''}`}
            aria-label="Thumbs up"
          >
            👍 Helpful
          </button>
          <button
            onClick={() => handleRating('down')}
            className={`rating-button ${qa.rating === 'down' ? 'active' : ''}`}
            aria-label="Thumbs down"
          >
            👎 Not Helpful
          </button>
        </div>
        {qa.rating && (
          <p className="rating-thanks">Thank you for your feedback!</p>
        )}
      </div>

      {/* Timestamp */}
      <div className="qa-timestamp">
        <small>
          Asked {new Date(qa.createdAt).toLocaleString()}
        </small>
      </div>
    </div>
  );
};

export default AnswerDisplay;
