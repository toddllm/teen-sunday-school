import React, { useState, useEffect } from 'react';
import { usePoll } from '../../contexts/PollContext';
import { useAuth } from '../../contexts/AuthContext';
import './PollResponse.css';

function PollResponse({ lessonId, onResponseSubmitted }) {
  const { activePoll, refreshPolls, submitPollResponse } = usePoll();
  const { user } = useAuth();

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [anonymousId, setAnonymousId] = useState(null);

  // Generate anonymous ID if not logged in
  useEffect(() => {
    if (!user) {
      // Generate a session-based anonymous ID
      let anonId = localStorage.getItem('pollAnonymousId');
      if (!anonId) {
        anonId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('pollAnonymousId', anonId);
      }
      setAnonymousId(anonId);
    }
  }, [user]);

  // Poll for active polls every 3 seconds
  useEffect(() => {
    if (!lessonId) return;

    refreshPolls(lessonId);

    const interval = setInterval(() => {
      refreshPolls(lessonId);
    }, 3000);

    return () => clearInterval(interval);
  }, [lessonId, refreshPolls]);

  // Reset state when active poll changes
  useEffect(() => {
    setSelectedAnswer(null);
    setTextAnswer('');
    setRating(0);
    setSubmitted(false);
    setError(null);
  }, [activePoll?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    let answer;

    // Prepare answer based on poll type
    if (activePoll.type === 'MULTIPLE_CHOICE') {
      if (!selectedAnswer) {
        setError('Please select an option');
        setSubmitting(false);
        return;
      }
      answer = selectedAnswer;
    } else if (activePoll.type === 'OPEN_ENDED') {
      if (!textAnswer.trim()) {
        setError('Please enter your response');
        setSubmitting(false);
        return;
      }
      answer = textAnswer.trim();
    } else if (activePoll.type === 'RATING') {
      if (rating === 0) {
        setError('Please select a rating');
        setSubmitting(false);
        return;
      }
      answer = rating;
    }

    // Submit response
    const result = await submitPollResponse(
      activePoll.id,
      answer,
      user ? null : anonymousId
    );

    setSubmitting(false);

    if (result.success) {
      setSubmitted(true);
      if (onResponseSubmitted) {
        onResponseSubmitted(result.response);
      }
    } else {
      setError(result.error);
    }
  };

  // No active poll
  if (!activePoll) {
    return null;
  }

  // Already submitted
  if (submitted) {
    return (
      <div className="poll-response submitted">
        <div className="poll-card">
          <div className="success-icon">✓</div>
          <h3>Response Submitted!</h3>
          <p>Thank you for participating in this poll.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="poll-response">
      <div className="poll-card active-poll">
        <div className="poll-header">
          <div className="live-badge">LIVE POLL</div>
        </div>

        <h3>{activePoll.question}</h3>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="poll-form">
          {/* Multiple Choice */}
          {activePoll.type === 'MULTIPLE_CHOICE' && (
            <div className="poll-options">
              {(activePoll.options || []).map((option, index) => (
                <label
                  key={index}
                  className={`poll-option ${selectedAnswer === option ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="poll-option"
                    value={option}
                    checked={selectedAnswer === option}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    disabled={submitting}
                  />
                  <span className="option-text">{option}</span>
                  <span className="option-radio"></span>
                </label>
              ))}
            </div>
          )}

          {/* Open Ended */}
          {activePoll.type === 'OPEN_ENDED' && (
            <div className="poll-text-input">
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type your response here..."
                rows="4"
                disabled={submitting}
                className="text-input"
              />
            </div>
          )}

          {/* Rating */}
          {activePoll.type === 'RATING' && (
            <div className="poll-rating">
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${rating >= star ? 'filled' : ''}`}
                    onClick={() => setRating(star)}
                    disabled={submitting}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div className="rating-label">
                {rating === 0 ? 'Tap to rate' : `${rating} star${rating !== 1 ? 's' : ''}`}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-btn"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Response'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PollResponse;
