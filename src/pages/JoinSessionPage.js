import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './JoinSessionPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function JoinSessionPage() {
  const { code: urlCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [joinCode, setJoinCode] = useState(urlCode || '');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    // If URL code is provided, auto-submit
    if (urlCode && urlCode.length === 6) {
      handleJoin();
    }
  }, [urlCode]);

  const handleJoin = async (e) => {
    if (e) e.preventDefault();

    setError('');
    setLoading(true);

    // Validate join code
    const code = joinCode.toUpperCase().trim();
    if (!code || code.length !== 6) {
      setError('Please enter a 6-character join code');
      setLoading(false);
      return;
    }

    // If not logged in, require nickname
    if (!user && (!nickname || nickname.trim().length === 0)) {
      setError('Please enter a nickname');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/sessions/join/${code}`,
        { nickname: nickname.trim() },
        {
          headers: user ? {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          } : {}
        }
      );

      setSessionData(response.data.session);
      setSuccess(true);

      // Store guest ID if joining as guest
      if (response.data.session.joinedAs === 'guest') {
        localStorage.setItem('guestId', response.data.session.guestId);
        localStorage.setItem('guestNickname', response.data.session.nickname);
      }

      // Redirect to lesson view or session dashboard after 2 seconds
      setTimeout(() => {
        navigate('/today');
      }, 2000);
    } catch (err) {
      console.error('Join error:', err);
      if (err.response?.status === 404) {
        setError('Invalid join code. Please check and try again.');
      } else if (err.response?.status === 410) {
        setError('This session has expired or ended.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to join session. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase();
    // Only allow valid characters
    const cleaned = value.replace(/[^23456789ABCDEFGHJKMNPQRSTUVWXYZ]/g, '');
    setJoinCode(cleaned.substring(0, 6));
  };

  if (success && sessionData) {
    return (
      <div className="join-session-page">
        <div className="join-container success-container">
          <div className="success-icon">✓</div>
          <h1>Welcome to {sessionData.group.name}!</h1>
          <p className="success-message">
            {sessionData.joinedAs === 'guest'
              ? `You've joined as ${sessionData.nickname}. Redirecting...`
              : "You've successfully joined the session. Redirecting..."}
          </p>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="join-session-page">
      <div className="join-container">
        <div className="join-header">
          <h1>Join Class</h1>
          <p className="subtitle">Enter the code provided by your leader</p>
        </div>

        <form onSubmit={handleJoin} className="join-form">
          <div className="form-group">
            <label htmlFor="joinCode">Class Code</label>
            <input
              type="text"
              id="joinCode"
              className="code-input"
              value={joinCode}
              onChange={handleCodeChange}
              placeholder="ABC123"
              maxLength={6}
              autoComplete="off"
              autoFocus
              disabled={loading}
            />
            <small className="help-text">
              6-character code (letters and numbers)
            </small>
          </div>

          {!user && (
            <div className="form-group">
              <label htmlFor="nickname">Your Nickname</label>
              <input
                type="text"
                id="nickname"
                className="text-input"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter your name or nickname"
                maxLength={30}
                disabled={loading}
              />
              <small className="help-text">
                This is how others will see you in the class
              </small>
            </div>
          )}

          {user && (
            <div className="user-info">
              <div className="user-badge">
                <span className="user-icon">👤</span>
                <span className="user-name">
                  {user.firstName} {user.lastName}
                </span>
              </div>
              <p className="info-text">
                You'll join as a registered member
              </p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-large btn-block"
            disabled={loading || (!user && !nickname.trim()) || joinCode.length !== 6}
          >
            {loading ? 'Joining...' : 'Join Class'}
          </button>

          {!user && (
            <div className="login-prompt">
              <p>
                Have an account?{' '}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => navigate('/login', { state: { returnTo: `/join/${joinCode}` } })}
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </form>

        <div className="help-section">
          <h3>Need help?</h3>
          <ul className="help-list">
            <li>Ask your leader for the class code</li>
            <li>Make sure you enter all 6 characters</li>
            <li>Codes are only valid during the class session</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default JoinSessionPage;
