import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SessionManagerPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function SessionManagerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadGroups();
  }, [user, navigate]);

  const loadGroups = async () => {
    try {
      // Note: This endpoint would need to be created
      // For now, we'll use a mock group
      // In production, fetch user's groups from API
      setGroups([
        { id: 'group1', name: 'Teen Sunday School - Main' },
        { id: 'group2', name: 'Youth Group - Advanced' },
      ]);
      setLoading(false);
    } catch (err) {
      console.error('Error loading groups:', err);
      setError('Failed to load groups');
      setLoading(false);
    }
  };

  const loadSessionData = async (groupId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      // Load active session
      const activeSessions = await axios.get(
        `${API_URL}/groups/${groupId}/sessions?active=true`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (activeSessions.data.sessions.length > 0) {
        setActiveSession(activeSessions.data.sessions[0]);
      } else {
        setActiveSession(null);
      }

      // Load session history
      const history = await axios.get(
        `${API_URL}/groups/${groupId}/sessions?limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSessionHistory(history.data.sessions);
      setLoading(false);
    } catch (err) {
      console.error('Error loading sessions:', err);
      setError('Failed to load session data');
      setLoading(false);
    }
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    loadSessionData(group.id);
  };

  const handleStartSession = async () => {
    if (!selectedGroup) {
      setError('Please select a group first');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${API_URL}/sessions`,
        {
          groupId: selectedGroup.id,
          durationMinutes: 120,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setActiveSession(response.data.session);
      loadSessionData(selectedGroup.id);
    } catch (err) {
      console.error('Error starting session:', err);
      setError(err.response?.data?.error || 'Failed to start session');
    } finally {
      setCreating(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `${API_URL}/sessions/${activeSession.id}/end`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setActiveSession(null);
      loadSessionData(selectedGroup.id);
    } catch (err) {
      console.error('Error ending session:', err);
      setError('Failed to end session');
    }
  };

  const copyJoinCode = () => {
    if (activeSession) {
      navigator.clipboard.writeText(activeSession.joinCode);
      alert('Join code copied to clipboard!');
    }
  };

  const copyJoinLink = () => {
    if (activeSession) {
      const link = `${window.location.origin}/join/${activeSession.joinCode}`;
      navigator.clipboard.writeText(link);
      alert('Join link copied to clipboard!');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading && !selectedGroup) {
    return (
      <div className="session-manager-page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="session-manager-page">
      <div className="page-header">
        <h1>Session Manager</h1>
        <p className="subtitle">Create and manage class sessions with join codes</p>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          {error}
          <button className="close-btn" onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="content-grid">
        <div className="group-selector">
          <h2>Select a Group</h2>
          <div className="group-list">
            {groups.map((group) => (
              <button
                key={group.id}
                className={`group-card ${selectedGroup?.id === group.id ? 'active' : ''}`}
                onClick={() => handleGroupSelect(group)}
              >
                <span className="group-icon">👥</span>
                <span className="group-name">{group.name}</span>
              </button>
            ))}
          </div>
        </div>

        {selectedGroup && (
          <div className="session-panel">
            <h2>Active Session</h2>
            {activeSession ? (
              <div className="active-session-card">
                <div className="session-header">
                  <div className="status-badge active">Live</div>
                  <button className="btn btn-danger btn-small" onClick={handleEndSession}>
                    End Session
                  </button>
                </div>

                <div className="join-code-display">
                  <label>Join Code</label>
                  <div className="code-box">
                    <span className="code">{activeSession.joinCode}</span>
                    <button className="btn btn-icon" onClick={copyJoinCode} title="Copy code">
                      📋
                    </button>
                  </div>
                </div>

                <div className="join-link">
                  <label>Join Link</label>
                  <div className="link-box">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/join/${activeSession.joinCode}`}
                      className="link-input"
                    />
                    <button className="btn btn-icon" onClick={copyJoinLink} title="Copy link">
                      📋
                    </button>
                  </div>
                </div>

                <div className="session-info">
                  <div className="info-item">
                    <span className="label">Started:</span>
                    <span className="value">{formatDate(activeSession.startedAt)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Expires:</span>
                    <span className="value">{formatDate(activeSession.expiresAt)}</span>
                  </div>
                </div>

                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-value">{activeSession.metrics?.memberJoins || 0}</div>
                    <div className="metric-label">Members Joined</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{activeSession.metrics?.guestJoins || 0}</div>
                    <div className="metric-label">Guests Joined</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{activeSession.metrics?.codeUses || 0}</div>
                    <div className="metric-label">Code Uses</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{activeSession.metrics?.activeGuests || 0}</div>
                    <div className="metric-label">Active Guests</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-session">
                <div className="empty-icon">🎯</div>
                <p>No active session for this group</p>
                <button
                  className="btn btn-primary btn-large"
                  onClick={handleStartSession}
                  disabled={creating}
                >
                  {creating ? 'Starting...' : 'Start New Session'}
                </button>
              </div>
            )}

            <div className="session-history">
              <h3>Recent Sessions</h3>
              {sessionHistory.length > 0 ? (
                <div className="history-list">
                  {sessionHistory.map((session) => (
                    <div key={session.id} className="history-item">
                      <div className="history-header">
                        <span className="history-code">{session.joinCode}</span>
                        <span className={`status-badge ${session.endedAt ? 'ended' : 'active'}`}>
                          {session.endedAt ? 'Ended' : 'Active'}
                        </span>
                      </div>
                      <div className="history-meta">
                        <span>{formatDate(session.startedAt)}</span>
                        {session.endedAt && <span>• Ended {formatDate(session.endedAt)}</span>}
                      </div>
                      <div className="history-metrics">
                        <span>{session.metrics.memberJoins} members</span>
                        <span>• {session.metrics.guestJoins} guests</span>
                        <span>• {session.metrics.codeUses} uses</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-text">No session history yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SessionManagerPage;
