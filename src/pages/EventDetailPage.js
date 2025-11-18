import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSeasonalEvents } from '../contexts/SeasonalEventContext';
import { useAuth } from '../contexts/AuthContext';
import './EventDetailPage.css';

/**
 * EventDetailPage Component
 * Detailed view of a seasonal event with participation options
 */
function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getEvent,
    joinEvent,
    getParticipation,
    logActivity,
    getLeaderboard,
    isEventActive,
  } = useSeasonalEvents();

  const [event, setEvent] = useState(null);
  const [participation, setParticipation] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadEventData();
  }, [id]);

  const loadEventData = async () => {
    setLoading(true);
    setError(null);

    try {
      const eventData = await getEvent(id);
      setEvent(eventData);

      // Load participation if user is participating
      if (eventData.userParticipation) {
        setParticipation(eventData.userParticipation);
      } else {
        const participationData = await getParticipation(id);
        setParticipation(participationData);
      }

      // Load leaderboard
      const leaderboardData = await getLeaderboard(id, 10);
      setLeaderboard(leaderboardData);
    } catch (err) {
      console.error('Failed to load event:', err);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    setJoining(true);
    try {
      const newParticipation = await joinEvent(id);
      setParticipation(newParticipation);
    } catch (err) {
      console.error('Failed to join event:', err);
      alert('Failed to join event. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="event-detail-page">
        <div className="event-detail-loading">
          <div className="spinner"></div>
          <p>Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-detail-page">
        <div className="event-detail-error">
          <p>⚠️ {error || 'Event not found'}</p>
          <button onClick={() => navigate('/events')} className="btn btn-primary">
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const isActive = isEventActive(event);
  const isParticipating = !!participation;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getSeasonIcon = (season) => {
    const icons = {
      ADVENT: '🕯️',
      CHRISTMAS: '🎄',
      LENT: '✝️',
      EASTER: '🐣',
      PENTECOST: '🔥',
      SUMMER: '☀️',
      FALL: '🍂',
      CUSTOM: '⭐',
    };
    return icons[season] || event.icon || '📅';
  };

  return (
    <div className="event-detail-page">
      {/* Header */}
      <div
        className="event-detail-header"
        style={{
          backgroundColor: event.bannerColor || '#4A90E2',
          backgroundImage: event.bannerImage
            ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${event.bannerImage})`
            : 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
        }}
      >
        <button onClick={() => navigate('/events')} className="event-back-button">
          ← Back
        </button>

        <div className="event-header-content">
          <div className="event-header-icon">{getSeasonIcon(event.season)}</div>
          <h1 className="event-header-title">{event.title}</h1>
          <p className="event-header-date">
            {formatDate(event.startDate)} - {formatDate(event.endDate)}
          </p>

          {isActive && !isParticipating && (
            <button
              onClick={handleJoinEvent}
              disabled={joining}
              className="btn btn-large btn-join"
            >
              {joining ? 'Joining...' : '🎯 Join Event'}
            </button>
          )}

          {isParticipating && (
            <div className="event-participation-badge">
              ✅ You're participating!
            </div>
          )}
        </div>
      </div>

      {/* Progress (if participating) */}
      {isParticipating && (
        <div className="event-progress-section">
          <div className="event-progress-card">
            <h3>Your Progress</h3>
            <div className="event-progress-bar-large">
              <div
                className="event-progress-fill-large"
                style={{ width: `${participation.progress}%` }}
              />
            </div>
            <div className="event-progress-stats-large">
              <div className="event-stat-item">
                <span className="event-stat-value">{participation.progress}%</span>
                <span className="event-stat-label">Complete</span>
              </div>
              <div className="event-stat-item">
                <span className="event-stat-value">{participation.pointsEarned}</span>
                <span className="event-stat-label">Points</span>
              </div>
              {participation.isCompleted && (
                <div className="event-stat-item">
                  <span className="event-stat-value">🏆</span>
                  <span className="event-stat-label">Completed!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="event-tabs">
        <button
          className={`event-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`event-tab ${activeTab === 'challenges' ? 'active' : ''}`}
          onClick={() => setActiveTab('challenges')}
        >
          Challenges
        </button>
        <button
          className={`event-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          Leaderboard
        </button>
      </div>

      {/* Tab Content */}
      <div className="event-content">
        {activeTab === 'overview' && (
          <div className="event-overview">
            <div className="event-description-card">
              <h2>About This Event</h2>
              <p>{event.description}</p>
            </div>

            {event.rewards && Object.keys(event.rewards).length > 0 && (
              <div className="event-rewards-card">
                <h2>🎁 Rewards</h2>
                <div className="event-rewards-list">
                  {event.rewards.xpMultiplier && (
                    <div className="event-reward-item">
                      <span className="reward-icon">⚡</span>
                      <span>{event.rewards.xpMultiplier}x XP Multiplier</span>
                    </div>
                  )}
                  {event.rewards.badges && event.rewards.badges.map((badge, idx) => (
                    <div key={idx} className="event-reward-item">
                      <span className="reward-icon">🏅</span>
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="event-stats-card">
              <h2>📊 Event Stats</h2>
              <div className="event-stats-grid">
                <div className="stat-box">
                  <span className="stat-number">{event._count?.participations || 0}</span>
                  <span className="stat-label">Participants</span>
                </div>
                <div className="stat-box">
                  <span className="stat-number">{event._count?.activities || 0}</span>
                  <span className="stat-label">Activities</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="event-challenges">
            <h2>Event Challenges</h2>
            {event.challenges && event.challenges.length > 0 ? (
              <div className="challenges-list">
                {event.challenges.map((challenge, idx) => (
                  <div key={idx} className="challenge-card">
                    <h3>{challenge.title}</h3>
                    <p>{challenge.description}</p>
                    {challenge.points && (
                      <span className="challenge-points">
                        ⭐ {challenge.points} points
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No challenges defined for this event.</p>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="event-leaderboard">
            <h2>🏆 Leaderboard</h2>
            {leaderboard.length > 0 ? (
              <div className="leaderboard-list">
                {leaderboard.map((entry, idx) => (
                  <div key={entry.userId} className="leaderboard-item">
                    <span className="leaderboard-rank">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <span className="leaderboard-user">
                      {entry.userId === user?.id ? '(You)' : 'User'}
                    </span>
                    <span className="leaderboard-points">
                      {entry.pointsEarned} points
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No leaderboard data yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventDetailPage;
