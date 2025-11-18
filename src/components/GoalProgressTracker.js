import React, { useState, useEffect } from 'react';
import { useGoals } from '../contexts/GoalContext';
import goalService from '../services/goalService';
import './GoalProgressTracker.css';

const GoalProgressTracker = ({ goal, onClose }) => {
  const { logProgress, getLatestProgress } = useGoals();
  const [progress, setProgress] = useState(getLatestProgress(goal));
  const [note, setNote] = useState('');
  const [progressHistory, setProgressHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProgressHistory();
  }, [goal.id]);

  const loadProgressHistory = async () => {
    setLoading(true);
    try {
      const history = await goalService.getProgress(goal.id);
      setProgressHistory(history);
    } catch (err) {
      console.error('Error loading progress history:', err);
      setError('Failed to load progress history');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (progress < 0 || progress > 100) {
      setError('Progress must be between 0 and 100');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await logProgress(goal.id, {
        progress: parseInt(progress),
        note: note.trim() || null,
      });

      // Reload history
      await loadProgressHistory();

      // Reset form
      setNote('');
      setError(null);

      // Show success message
      alert('Progress logged successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to log progress');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProgressChange = (currentProgress, index) => {
    if (index === progressHistory.length - 1) {
      return null; // First entry, no previous to compare
    }
    const previousProgress = progressHistory[index + 1].progress;
    const change = currentProgress - previousProgress;
    return change;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content progress-tracker"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Track Progress: {goal.title}</h2>
          <button className="btn-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Current Progress */}
        <div className="current-progress">
          <h3>Current Progress: {getLatestProgress(goal)}%</h3>
          <div className="progress-bar large">
            <div
              className="progress-fill"
              style={{ width: `${getLatestProgress(goal)}%` }}
            />
          </div>
        </div>

        {/* Log New Progress */}
        <form onSubmit={handleSubmit} className="progress-form">
          <h3>Update Progress</h3>

          <div className="form-group">
            <label htmlFor="progress">
              Progress Percentage (0-100) <span className="required">*</span>
            </label>
            <div className="progress-input-group">
              <input
                type="range"
                id="progress"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                className="progress-slider"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                className="progress-number"
              />
              <span className="progress-label">%</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="note">Progress Note (Optional)</label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add details about your progress, challenges, or victories..."
              rows={3}
              maxLength={500}
            />
            <span className="char-count">{note.length}/500</span>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Close
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Logging...' : 'Log Progress'}
            </button>
          </div>
        </form>

        {/* Progress History */}
        <div className="progress-history">
          <h3>Progress History</h3>

          {loading && <p className="loading-text">Loading history...</p>}

          {!loading && progressHistory.length === 0 && (
            <p className="empty-history">
              No progress logged yet. Log your first update above!
            </p>
          )}

          {!loading && progressHistory.length > 0 && (
            <div className="history-timeline">
              {progressHistory.map((entry, index) => {
                const change = getProgressChange(entry.progress, index);
                return (
                  <div key={entry.id} className="history-item">
                    <div className="history-date">
                      {formatDate(entry.timestamp)}
                    </div>
                    <div className="history-content">
                      <div className="history-progress">
                        <span className="progress-value">
                          {entry.progress}%
                        </span>
                        {change !== null && (
                          <span
                            className={`progress-change ${
                              change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'
                            }`}
                          >
                            {change > 0 ? '+' : ''}
                            {change}%
                          </span>
                        )}
                      </div>
                      {entry.note && (
                        <div className="history-note">{entry.note}</div>
                      )}
                    </div>
                    <div className="history-marker">
                      <div className="marker-dot" />
                      {index < progressHistory.length - 1 && (
                        <div className="marker-line" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalProgressTracker;
