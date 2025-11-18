import React, { useEffect, useState } from 'react';
import { usePoll } from '../../../contexts/PollContext';
import './Polls.css';

function PollResults({ poll }) {
  const { getPollResults, refreshPoll } = usePoll();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load results
  useEffect(() => {
    loadResults();
  }, [poll.id]);

  // Auto-refresh results every 3 seconds for active polls
  useEffect(() => {
    if (poll.status !== 'ACTIVE') return;

    const interval = setInterval(() => {
      loadResults();
      refreshPoll(poll.id);
    }, 3000);

    return () => clearInterval(interval);
  }, [poll.id, poll.status, refreshPoll]);

  const loadResults = async () => {
    setLoading(true);
    const result = await getPollResults(poll.id);
    if (result.success) {
      setResults(result.results);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const renderMultipleChoiceResults = () => {
    if (!results || !results.results) return null;

    const total = results.totalResponses;
    const optionsArray = poll.options || [];

    return (
      <div className="results-chart">
        <h4>Results ({total} {total === 1 ? 'response' : 'responses'})</h4>
        <div className="chart-bars">
          {optionsArray.map((option, index) => {
            const count = results.results[option] || 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;

            return (
              <div key={index} className="chart-bar-container">
                <div className="chart-label">{option}</div>
                <div className="chart-bar-wrapper">
                  <div
                    className="chart-bar"
                    style={{ width: `${percentage}%` }}
                  >
                    <span className="chart-value">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderOpenEndedResults = () => {
    if (!results || !results.responses) return null;

    const responses = results.responses;
    const wordFrequency = results.wordFrequency || {};

    // Get top words for word cloud
    const topWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30);

    const maxFrequency = topWords.length > 0 ? topWords[0][1] : 1;

    return (
      <div className="results-open-ended">
        <h4>Responses ({responses.length})</h4>

        {/* Word Cloud */}
        {topWords.length > 0 && (
          <div className="word-cloud">
            <h5>Word Cloud</h5>
            <div className="word-cloud-container">
              {topWords.map(([word, frequency], index) => {
                const size = 12 + (frequency / maxFrequency) * 24;
                const opacity = 0.5 + (frequency / maxFrequency) * 0.5;
                return (
                  <span
                    key={index}
                    className="word-cloud-item"
                    style={{
                      fontSize: `${size}px`,
                      opacity,
                    }}
                    title={`${word}: ${frequency} times`}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Individual Responses */}
        <div className="responses-list">
          <h5>All Responses</h5>
          <div className="responses-container">
            {responses.map((response, index) => (
              <div key={index} className="response-item">
                <div className="response-text">
                  {typeof response.answer === 'string'
                    ? response.answer
                    : JSON.stringify(response.answer)}
                </div>
                <div className="response-time">
                  {new Date(response.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderRatingResults = () => {
    if (!results || !results.ratings) return null;

    const total = results.totalResponses;
    const average = results.averageRating;
    const ratings = results.ratings;

    // Count ratings by value
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(rating => {
      if (rating >= 1 && rating <= 5) {
        ratingCounts[rating]++;
      }
    });

    return (
      <div className="results-rating">
        <h4>Rating Results ({total} {total === 1 ? 'response' : 'responses'})</h4>
        <div className="average-rating">
          <div className="rating-number">{average}</div>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map(star => (
              <span
                key={star}
                className={`star ${parseFloat(average) >= star ? 'filled' : ''}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="rating-breakdown">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = ratingCounts[rating];
            const percentage = total > 0 ? (count / total) * 100 : 0;

            return (
              <div key={rating} className="rating-bar-container">
                <div className="rating-label">
                  {rating} ★
                </div>
                <div className="chart-bar-wrapper">
                  <div
                    className="chart-bar"
                    style={{ width: `${percentage}%` }}
                  >
                    <span className="chart-value">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading && !results) {
    return <div className="poll-results loading">Loading results...</div>;
  }

  if (error) {
    return (
      <div className="poll-results">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="poll-results">
      <div className="poll-results-header">
        <h3>Poll Results</h3>
        {poll.status === 'ACTIVE' && (
          <div className="live-indicator">
            <span className="pulse-dot"></span>
            Live
          </div>
        )}
      </div>

      <div className="poll-question">
        <h4>{poll.question}</h4>
        <div className="poll-meta">
          <span className="poll-type">{poll.type.replace('_', ' ')}</span>
          <span className="poll-status">{poll.status}</span>
        </div>
      </div>

      {results && (
        <div className="results-content">
          {poll.type === 'MULTIPLE_CHOICE' && renderMultipleChoiceResults()}
          {poll.type === 'OPEN_ENDED' && renderOpenEndedResults()}
          {poll.type === 'RATING' && renderRatingResults()}
        </div>
      )}

      {!results && (
        <div className="no-results">
          <p>No responses yet.</p>
        </div>
      )}
    </div>
  );
}

export default PollResults;
