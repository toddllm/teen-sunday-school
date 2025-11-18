import React, { useEffect, useState } from 'react';
import { usePoll } from '../../../contexts/PollContext';
import PollResults from './PollResults';
import './Polls.css';

function PollManager({ lessonId }) {
  const {
    polls,
    activePoll,
    getLessonPolls,
    activatePoll,
    closePoll,
    deletePoll,
    refreshPolls,
    loading,
    error,
  } = usePoll();

  const [selectedPoll, setSelectedPoll] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Load polls on mount
  useEffect(() => {
    if (lessonId) {
      getLessonPolls(lessonId);
    }
  }, [lessonId]);

  // Auto-refresh polls every 5 seconds if there's an active poll
  useEffect(() => {
    if (!lessonId || !activePoll) return;

    const interval = setInterval(() => {
      refreshPolls(lessonId);
    }, 5000);

    return () => clearInterval(interval);
  }, [lessonId, activePoll, refreshPolls]);

  const handleActivate = async (pollId) => {
    const result = await activatePoll(pollId);
    if (result.success) {
      // Poll activated successfully
    }
  };

  const handleClose = async (pollId) => {
    if (!window.confirm('Are you sure you want to close this poll? No more responses will be accepted.')) {
      return;
    }

    const result = await closePoll(pollId);
    if (result.success) {
      // Poll closed successfully
    }
  };

  const handleDelete = async (pollId) => {
    if (!window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return;
    }

    const result = await deletePoll(pollId);
    if (result.success) {
      if (selectedPoll?.id === pollId) {
        setSelectedPoll(null);
        setShowResults(false);
      }
    }
  };

  const handleViewResults = (poll) => {
    setSelectedPoll(poll);
    setShowResults(true);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      DRAFT: 'status-badge status-draft',
      ACTIVE: 'status-badge status-active',
      CLOSED: 'status-badge status-closed',
    };

    return <span className={statusClasses[status] || 'status-badge'}>{status}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
  };

  if (loading && polls.length === 0) {
    return <div className="poll-manager loading">Loading polls...</div>;
  }

  if (error) {
    return (
      <div className="poll-manager">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div className="poll-manager empty">
        <p>No polls created yet. Click "New Poll" to create your first poll!</p>
      </div>
    );
  }

  // Show results view if selected
  if (showResults && selectedPoll) {
    return (
      <div className="poll-manager">
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowResults(false)}
        >
          ← Back to Polls
        </button>
        <PollResults poll={selectedPoll} />
      </div>
    );
  }

  return (
    <div className="poll-manager">
      <h3>Manage Polls</h3>

      {activePoll && (
        <div className="alert alert-info">
          <strong>Active Poll:</strong> {activePoll.question}
        </div>
      )}

      <div className="polls-list">
        {polls.map((poll) => (
          <div key={poll.id} className={`poll-card ${poll.status.toLowerCase()}`}>
            <div className="poll-header">
              <div className="poll-info">
                <h4>{poll.question}</h4>
                <div className="poll-meta">
                  {getStatusBadge(poll.status)}
                  <span className="poll-type">{poll.type.replace('_', ' ')}</span>
                  <span className="poll-responses">
                    {poll.responses?.length || 0} responses
                  </span>
                </div>
              </div>
              <div className="poll-actions">
                {poll.status === 'DRAFT' && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleActivate(poll.id)}
                    disabled={loading || activePoll !== null}
                    title={activePoll ? 'Another poll is already active' : 'Launch this poll'}
                  >
                    Launch
                  </button>
                )}
                {poll.status === 'ACTIVE' && (
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleClose(poll.id)}
                    disabled={loading}
                  >
                    Close
                  </button>
                )}
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleViewResults(poll)}
                >
                  Results
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(poll.id)}
                  disabled={loading || poll.status === 'ACTIVE'}
                  title={poll.status === 'ACTIVE' ? 'Close the poll first' : 'Delete poll'}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="poll-details">
              <p><strong>Created:</strong> {formatDate(poll.createdAt)}</p>
              {poll.activatedAt && (
                <p><strong>Activated:</strong> {formatDate(poll.activatedAt)}</p>
              )}
              {poll.closedAt && (
                <p><strong>Closed:</strong> {formatDate(poll.closedAt)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PollManager;
