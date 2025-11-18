import React, { useState } from 'react';
import lessonDebriefService from '../services/lessonDebriefService';
import './SessionEndModal.css';

function SessionEndModal({ lessonId, lessonTitle, onClose, onDebriefCreated }) {
  const [notes, setNotes] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!notes.trim()) {
      setError('Please add some notes');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await lessonDebriefService.createDebrief(lessonId, {
      notes: notes.trim(),
      sessionDate,
    });

    if (result.success) {
      if (onDebriefCreated) {
        onDebriefCreated(result.debrief);
      }
      onClose();
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content session-end-modal">
        <div className="modal-header">
          <h2>Session Complete! 🎉</h2>
          <button onClick={onClose} className="close-btn" aria-label="Close">×</button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            How did teaching <strong>{lessonTitle}</strong> go?
          </p>
          <p className="modal-subdescription">
            Take a moment to capture what worked well and what you'd change for next time.
          </p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="sessionDate">Session Date</label>
              <input
                type="date"
                id="sessionDate"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Your Notes</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What worked well? What would you change? Any insights for next time?"
                rows="6"
                className="form-control"
                autoFocus
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={handleSkip}
                className="btn btn-outline"
                disabled={loading}
              >
                Skip for Now
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !notes.trim()}
              >
                {loading ? 'Saving...' : 'Save Debrief'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SessionEndModal;
