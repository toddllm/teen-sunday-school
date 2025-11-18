import React, { useState, useEffect } from 'react';
import './TranslationComparisonViewer.css';

/**
 * TranslationComparisonViewer Component
 *
 * Displays side-by-side Bible translation comparisons with teen-friendly explanations
 */
const TranslationComparisonViewer = ({ note, onFeedback }) => {
  const [viewStartTime, setViewStartTime] = useState(null);

  useEffect(() => {
    setViewStartTime(Date.now());
  }, [note]);

  if (!note) {
    return (
      <div className="translation-comparison-empty">
        <p>Select a translation comparison to view</p>
      </div>
    );
  }

  const {
    title,
    description,
    passageRef,
    translations = [],
    comparisonPoints = [],
    teenSummary,
    whyItMatters,
    keyTakeaway,
    difficulty,
    category,
  } = note;

  const handleFeedbackClick = (wasHelpful) => {
    const timeSpentMs = viewStartTime ? Date.now() - viewStartTime : 0;
    onFeedback?.(note.id, wasHelpful, timeSpentMs);
  };

  const getDifficultyBadgeClass = (level) => {
    switch (level) {
      case 'beginner':
        return 'difficulty-beginner';
      case 'intermediate':
        return 'difficulty-intermediate';
      case 'advanced':
        return 'difficulty-advanced';
      default:
        return '';
    }
  };

  return (
    <div className="translation-comparison-viewer">
      <div className="comparison-header">
        <div className="header-top">
          <h2>{title}</h2>
          <div className="header-badges">
            {difficulty && (
              <span className={`difficulty-badge ${getDifficultyBadgeClass(difficulty)}`}>
                {difficulty}
              </span>
            )}
            {category && <span className="category-badge">{category}</span>}
          </div>
        </div>
        <div className="passage-reference">
          <strong>Passage:</strong> {passageRef}
        </div>
        {description && <p className="comparison-description">{description}</p>}
      </div>

      {teenSummary && (
        <div className="teen-summary-box">
          <h3>Quick Summary</h3>
          <p>{teenSummary}</p>
        </div>
      )}

      {/* Translation Comparison Grid */}
      <div className="translations-grid">
        {translations.map((translation, index) => (
          <div key={index} className="translation-card">
            <div className="translation-header">
              <h3>{translation.code}</h3>
              <span className="translation-name">{translation.name}</span>
            </div>
            <div className="translation-text">
              <p>"{translation.text}"</p>
              {translation.focus && (
                <div className="translation-focus">
                  <strong>Focus phrase:</strong> {translation.focus}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Points (Teen-Friendly Explanations) */}
      {comparisonPoints.length > 0 && (
        <div className="comparison-points">
          <h3>What's Different?</h3>
          {comparisonPoints.map((point, index) => (
            <div key={index} className="comparison-point-card">
              <div className="point-aspect">
                <span className="aspect-badge">{point.aspect}</span>
              </div>
              <div className="point-difference">
                <strong>The Difference:</strong>
                <p>{point.difference}</p>
              </div>
              <div className="point-teen-explanation">
                <div className="teen-icon">💡</div>
                <div className="teen-explanation-content">
                  <strong>In Teen Speak:</strong>
                  <p>{point.teenExplanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {whyItMatters && (
        <div className="why-it-matters-box">
          <h3>Why Does This Matter?</h3>
          <p>{whyItMatters}</p>
        </div>
      )}

      {keyTakeaway && (
        <div className="key-takeaway-box">
          <div className="takeaway-icon">🎯</div>
          <div className="takeaway-content">
            <h3>Key Takeaway</h3>
            <p>{keyTakeaway}</p>
          </div>
        </div>
      )}

      {/* Feedback Section */}
      <div className="comparison-feedback">
        <p>Was this helpful?</p>
        <div className="feedback-buttons">
          <button
            className="feedback-btn feedback-yes"
            onClick={() => handleFeedbackClick(true)}
          >
            👍 Yes, this helped!
          </button>
          <button
            className="feedback-btn feedback-no"
            onClick={() => handleFeedbackClick(false)}
          >
            👎 Not really
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranslationComparisonViewer;
