import React, { useState, useEffect } from 'react';
import './ProverbOfTheDay.css';
import {
  getTodaysProverb,
  getRandomProverb,
  recordProverbView,
  recordProverbInteraction,
} from '../services/proverbService';

/**
 * ProverbOfTheDay Component
 *
 * Displays the daily proverb with teen-focused application
 */
const ProverbOfTheDay = ({ compact = false, onPassageClick }) => {
  const [proverb, setProverb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    loadTodaysProverb();
  }, []);

  useEffect(() => {
    // Record view when component unmounts
    return () => {
      if (proverb) {
        const timeSpentMs = Date.now() - startTime;
        recordProverbView(proverb.id, timeSpentMs).catch(console.error);
      }
    };
  }, [proverb, startTime]);

  const loadTodaysProverb = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTodaysProverb();
      setProverb(data);
    } catch (err) {
      console.error('Error loading proverb:', err);
      setError('Failed to load proverb. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadRandomProverb = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRandomProverb();
      setProverb(data);
      setLiked(false);
      setBookmarked(false);
    } catch (err) {
      console.error('Error loading random proverb:', err);
      setError('Failed to load proverb. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!proverb) return;

    try {
      const newLikedState = !liked;
      setLiked(newLikedState);

      if (newLikedState) {
        await recordProverbInteraction(proverb.id, 'like');
      }
    } catch (err) {
      console.error('Error recording like:', err);
      setLiked(!liked); // Revert on error
    }
  };

  const handleBookmark = async () => {
    if (!proverb) return;

    try {
      const newBookmarkedState = !bookmarked;
      setBookmarked(newBookmarkedState);

      if (newBookmarkedState) {
        await recordProverbInteraction(proverb.id, 'bookmark');
      }
    } catch (err) {
      console.error('Error recording bookmark:', err);
      setBookmarked(!bookmarked); // Revert on error
    }
  };

  const handleShare = async () => {
    if (!proverb) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Proverb: ${proverb.teenTitle}`,
          text: `${proverb.reference}: "${proverb.proverbText}"\n\n${proverb.teenApplication}`,
        });
        await recordProverbInteraction(proverb.id, 'share');
      } else {
        // Fallback: Copy to clipboard
        const textToCopy = `${proverb.teenTitle}\n\n${proverb.reference}: "${proverb.proverbText}"\n\n${proverb.teenApplication}`;
        await navigator.clipboard.writeText(textToCopy);
        alert('Proverb copied to clipboard!');
        await recordProverbInteraction(proverb.id, 'share');
      }
    } catch (err) {
      console.error('Error sharing proverb:', err);
    }
  };

  if (loading) {
    return (
      <div className={`proverb-of-the-day ${compact ? 'compact' : ''}`}>
        <div className="proverb-loading">
          <div className="loading-spinner"></div>
          <p>Loading today's proverb...</p>
        </div>
      </div>
    );
  }

  if (error || !proverb) {
    return (
      <div className={`proverb-of-the-day ${compact ? 'compact' : ''}`}>
        <div className="proverb-error">
          <p>{error || 'No proverb available today'}</p>
          <button onClick={loadTodaysProverb} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`proverb-of-the-day ${compact ? 'compact' : ''}`}>
      <div className="proverb-header">
        <div className="proverb-badge">
          <span className="badge-icon">💡</span>
          <span className="badge-text">Proverb of the Day</span>
        </div>
        <button
          onClick={loadRandomProverb}
          className="random-button"
          title="Get another proverb"
        >
          🔀
        </button>
      </div>

      <div className="proverb-content">
        <h3 className="proverb-title">{proverb.teenTitle}</h3>

        <div
          className="proverb-reference"
          onClick={() => onPassageClick?.(proverb.reference)}
          role="button"
          tabIndex={0}
        >
          {proverb.reference}
        </div>

        <blockquote className="proverb-text">
          "{proverb.proverbText}"
        </blockquote>

        {proverb.translation && (
          <div className="proverb-translation">{proverb.translation}</div>
        )}

        {!compact && (
          <>
            <div className="teen-application">
              <h4>For You</h4>
              <p>{proverb.teenApplication}</p>
            </div>

            {proverb.modernExample && (
              <div className="modern-example">
                <h4>Real Life Example</h4>
                <p>{proverb.modernExample}</p>
              </div>
            )}

            {proverb.discussionPrompt && (
              <div className="discussion-prompt">
                <h4>Think About It</h4>
                <p>{proverb.discussionPrompt}</p>
              </div>
            )}

            {proverb.category && (
              <div className="proverb-category">
                <span className="category-badge">{proverb.category}</span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="proverb-actions">
        <button
          className={`action-button ${liked ? 'active' : ''}`}
          onClick={handleLike}
          title="Like this proverb"
        >
          <span className="action-icon">{liked ? '❤️' : '🤍'}</span>
          <span className="action-label">Like</span>
        </button>

        <button
          className={`action-button ${bookmarked ? 'active' : ''}`}
          onClick={handleBookmark}
          title="Bookmark this proverb"
        >
          <span className="action-icon">{bookmarked ? '🔖' : '📑'}</span>
          <span className="action-label">Save</span>
        </button>

        <button
          className="action-button"
          onClick={handleShare}
          title="Share this proverb"
        >
          <span className="action-icon">📤</span>
          <span className="action-label">Share</span>
        </button>
      </div>
    </div>
  );
};

export default ProverbOfTheDay;
