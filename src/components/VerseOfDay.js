import React, { useEffect, useState } from 'react';
import { useVerseOfDay } from '../contexts/VerseOfDayContext';
import { useStreak, ACTIVITY_TYPES } from '../contexts/StreakContext';
import './VerseOfDay.css';

function VerseOfDay({ compact = false, showActions = true }) {
  const { verse, loading, error, fetchTodaysVerse, markAsViewed, getAnalytics } = useVerseOfDay();
  const { logActivity } = useStreak();
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    fetchTodaysVerse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopyVerse = () => {
    if (verse) {
      const text = `${verse.text}\n\n— ${verse.reference}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      markAsViewed();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareVerse = async () => {
    if (verse) {
      const text = `${verse.text}\n\n— ${verse.reference}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Verse of the Day',
            text: text
          });
          setShared(true);
          markAsViewed();
          setTimeout(() => setShared(false), 2000);
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Error sharing:', err);
          }
        }
      } else {
        // Fallback to copy
        handleCopyVerse();
      }
    }
  };

  const handleMarkRead = () => {
    markAsViewed();
    logActivity(ACTIVITY_TYPES.VERSE_MEMORIZED);
  };

  if (loading) {
    return (
      <div className={`verse-of-day ${compact ? 'compact' : ''}`}>
        <div className="verse-loading">
          <div className="verse-spinner"></div>
          <p>Loading today's verse...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`verse-of-day ${compact ? 'compact' : ''}`}>
        <div className="verse-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!verse) {
    return null;
  }

  const analytics = getAnalytics();

  return (
    <div className={`verse-of-day ${compact ? 'compact' : ''}`}>
      <div className="verse-header">
        <div className="verse-icon">📖</div>
        <div className="verse-title">
          <h3>Verse of the Day</h3>
          <p className="verse-date">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        {analytics.currentStreak > 0 && !compact && (
          <div className="verse-streak">
            <span className="streak-flame">🔥</span>
            <span className="streak-count">{analytics.currentStreak}</span>
          </div>
        )}
      </div>

      <div className="verse-content">
        <blockquote className="verse-text">
          "{verse.text}"
        </blockquote>
        <p className="verse-reference">— {verse.reference}</p>
      </div>

      {showActions && (
        <div className="verse-actions">
          <button
            className="verse-action-btn primary"
            onClick={handleMarkRead}
            title="Mark as read"
          >
            <span className="btn-icon">✓</span>
            <span className="btn-text">Mark Read</span>
          </button>
          <button
            className="verse-action-btn"
            onClick={handleCopyVerse}
            title="Copy verse"
          >
            <span className="btn-icon">{copied ? '✓' : '📋'}</span>
            <span className="btn-text">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button
            className="verse-action-btn"
            onClick={handleShareVerse}
            title="Share verse"
          >
            <span className="btn-icon">{shared ? '✓' : '↗'}</span>
            <span className="btn-text">{shared ? 'Shared!' : 'Share'}</span>
          </button>
        </div>
      )}

      {!compact && analytics.viewCount > 0 && (
        <div className="verse-stats">
          <small>Viewed {analytics.viewCount} time{analytics.viewCount !== 1 ? 's' : ''} today</small>
        </div>
      )}
    </div>
  );
}

export default VerseOfDay;
