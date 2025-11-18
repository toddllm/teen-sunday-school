import React, { useEffect, useState } from 'react';
import { useReadingMetrics } from '../contexts/ReadingMetricsContext';
import {
  calculatePassageMetrics,
  formatReadingTime,
  getDifficultyColor,
  getDifficultyIcon,
  estimateChapterMetrics
} from '../services/passageMetrics';
import './PassageMetrics.css';

/**
 * PassageMetrics Component
 * Displays reading time and difficulty estimates for Bible passages
 *
 * Props:
 * - content: HTML content of the passage (optional)
 * - bookId: Book ID for estimation (e.g., "JHN") (optional)
 * - chapter: Chapter number for estimation (optional)
 * - compact: Boolean, use compact display (default: false)
 * - showDetails: Boolean, show detailed breakdown (default: false)
 */
const PassageMetrics = ({
  content = null,
  bookId = null,
  chapter = null,
  compact = false,
  showDetails = false
}) => {
  const {
    getWordsPerMinute,
    showMetrics,
    showDifficulty,
    showReadingTime
  } = useReadingMetrics();

  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    // Calculate metrics when content or settings change
    const wpm = getWordsPerMinute();

    if (content) {
      // Calculate from actual content
      const calculatedMetrics = calculatePassageMetrics(content, wpm);
      setMetrics(calculatedMetrics);
    } else if (bookId && chapter) {
      // Estimate based on book and chapter
      const estimatedMetrics = estimateChapterMetrics(bookId, chapter);
      setMetrics(estimatedMetrics);
    } else {
      setMetrics(null);
    }
  }, [content, bookId, chapter, getWordsPerMinute]);

  // Don't render if metrics are disabled or unavailable
  if (!showMetrics || !metrics) {
    return null;
  }

  const { wordCount, readingTime, difficulty, isEstimate } = metrics;

  // Compact view (single line)
  if (compact) {
    return (
      <div className="passage-metrics compact">
        {showReadingTime && (
          <span className="metric-item reading-time">
            <span className="metric-icon">⏱️</span>
            {formatReadingTime(readingTime)}
          </span>
        )}
        {showDifficulty && (
          <span
            className="metric-item difficulty"
            style={{ color: getDifficultyColor(difficulty.level) }}
          >
            <span className="metric-icon">{getDifficultyIcon(difficulty.level)}</span>
            {difficulty.level}
          </span>
        )}
        {isEstimate && (
          <span className="metric-item estimate-badge">
            (est.)
          </span>
        )}
      </div>
    );
  }

  // Full view
  return (
    <div className="passage-metrics full">
      <div className="metrics-grid">
        {showReadingTime && (
          <div className="metric-card reading-time-card">
            <div className="metric-icon-large">⏱️</div>
            <div className="metric-content">
              <div className="metric-label">Reading Time</div>
              <div className="metric-value">{formatReadingTime(readingTime)}</div>
              {showDetails && (
                <div className="metric-details">
                  {wordCount} words at {getWordsPerMinute()} WPM
                </div>
              )}
            </div>
          </div>
        )}

        {showDifficulty && (
          <div
            className="metric-card difficulty-card"
            style={{ borderLeftColor: getDifficultyColor(difficulty.level) }}
          >
            <div className="metric-icon-large">{getDifficultyIcon(difficulty.level)}</div>
            <div className="metric-content">
              <div className="metric-label">Difficulty</div>
              <div
                className="metric-value"
                style={{ color: getDifficultyColor(difficulty.level) }}
              >
                {difficulty.level}
              </div>
              {showDetails && difficulty.factors && difficulty.factors.length > 0 && (
                <div className="metric-details">
                  <ul className="difficulty-factors">
                    {difficulty.factors.map((factor, index) => (
                      <li key={index}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isEstimate && (
        <div className="estimate-notice">
          <span className="notice-icon">ℹ️</span>
          These are estimated values. Actual metrics may vary.
        </div>
      )}
    </div>
  );
};

export default PassageMetrics;
