import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import './JoinSessionPage.css';

function JoinSessionPage() {
  const [sessionCode, setSessionCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { joinSessionByCode, error } = useSession();
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();

    if (!sessionCode.trim()) {
      return;
    }

    setIsJoining(true);

    try {
      await joinSessionByCode(sessionCode.toUpperCase(), displayName || null);
      // Navigate to student session view
      navigate('/session/student');
    } catch (err) {
      console.error('Failed to join session:', err);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCodeChange = (e) => {
    // Convert to uppercase and limit to 6 characters
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setSessionCode(value.substring(0, 6));
  };

  return (
    <div className="join-session-page">
      <div className="join-session-container">
        <div className="join-session-header">
          <h1>Join Live Session</h1>
          <p>Enter the session code provided by your teacher to follow along</p>
        </div>

        <form onSubmit={handleJoin} className="join-session-form">
          <div className="form-group">
            <label htmlFor="sessionCode">Session Code</label>
            <input
              type="text"
              id="sessionCode"
              value={sessionCode}
              onChange={handleCodeChange}
              placeholder="Enter 6-character code"
              maxLength={6}
              className="session-code-input"
              autoComplete="off"
              autoFocus
              required
            />
            <p className="input-hint">
              {sessionCode.length}/6 characters
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="displayName">
              Display Name <span className="optional">(optional)</span>
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name (optional)"
              maxLength={50}
              className="display-name-input"
            />
            <p className="input-hint">
              Leave blank to join anonymously
            </p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="join-button"
            disabled={isJoining || sessionCode.length < 4}
          >
            {isJoining ? 'Joining...' : 'Join Session'}
          </button>
        </form>

        <div className="join-session-info">
          <h3>What is a live session?</h3>
          <ul>
            <li>Follow along with the lesson on your own device</li>
            <li>See the same slides as your teacher in real-time</li>
            <li>Take personal notes on each slide</li>
            <li>Stay engaged with the lesson content</li>
          </ul>
        </div>

        <div className="back-link">
          <button onClick={() => navigate('/')} className="back-button">
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default JoinSessionPage;
