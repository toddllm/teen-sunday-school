import React, { useState } from 'react';
import { useStreak, ACTIVITY_TYPES } from '../contexts/StreakContext';
import { useAudio } from '../contexts/AudioContext';
import { Link } from 'react-router-dom';
import AudioPlayer from '../components/AudioPlayer';
import './TodayPage.css';

function TodayPage() {
  const {
    currentStreak,
    longestStreak,
    getStats,
    getAllBadges,
    logActivity,
    isStreakAtRisk,
    getEncouragementMessage,
    hasActivityToday
  } = useStreak();

  const {
    currentTrack,
    getLastPlayedTrack,
    getProgress,
    loadTrack,
    getListeningStats
  } = useAudio();

  const [newBadges, setNewBadges] = useState([]);

  const lastPlayedTrack = getLastPlayedTrack();
  const listeningStats = getListeningStats();

  const handleResumeAudio = async () => {
    if (lastPlayedTrack) {
      await loadTrack(lastPlayedTrack);
      // Optionally start playing immediately
      // await togglePlayPause();
    }
  };

  const stats = getStats();
  const allBadges = getAllBadges();
  const earnedBadgesCount = allBadges.filter(b => b.earned).length;
  const hasActivity = hasActivityToday();
  const atRisk = isStreakAtRisk();

  const handleLogActivity = (activityType) => {
    const awarded = logActivity(activityType);
    if (awarded && awarded.length > 0) {
      setNewBadges(awarded);
      setTimeout(() => setNewBadges([]), 5000); // Clear after 5 seconds
    }
  };

  const activityTypeLabels = {
    [ACTIVITY_TYPES.READING_PLAN_COMPLETED]: 'Reading Plan Day',
    [ACTIVITY_TYPES.CHAPTER_READ]: 'Bible Chapter',
    [ACTIVITY_TYPES.CHAPTER_LISTENED]: 'Audio Chapter',
    [ACTIVITY_TYPES.PRAYER_LOGGED]: 'Prayer Time',
    [ACTIVITY_TYPES.VERSE_MEMORIZED]: 'Verse Memorized',
    [ACTIVITY_TYPES.LESSON_COMPLETED]: 'Lesson Completed'
  };

  const activityTypeIcons = {
    [ACTIVITY_TYPES.READING_PLAN_COMPLETED]: '📅',
    [ACTIVITY_TYPES.CHAPTER_READ]: '📖',
    [ACTIVITY_TYPES.CHAPTER_LISTENED]: '🎧',
    [ACTIVITY_TYPES.PRAYER_LOGGED]: '🙏',
    [ACTIVITY_TYPES.VERSE_MEMORIZED]: '🧠',
    [ACTIVITY_TYPES.LESSON_COMPLETED]: '✅'
  };

  return (
    <div className="today-page">
      <div className="today-container">
        <header className="today-header">
          <h1>Today</h1>
          <p className="today-date">{new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</p>
        </header>

        {/* New Badge Notification */}
        {newBadges.length > 0 && (
          <div className="badge-notification">
            <div className="badge-notification-content">
              <span className="badge-notification-icon">🎉</span>
              <div>
                <strong>New Badge{newBadges.length > 1 ? 's' : ''} Earned!</strong>
                {newBadges.map(badge => {
                  const badgeInfo = allBadges.find(b => b.id === badge.badgeId);
                  return (
                    <div key={badge.badgeId}>
                      {badgeInfo?.icon} {badgeInfo?.name}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Streak Card */}
        <div className={`streak-card ${atRisk ? 'at-risk' : ''} ${hasActivity ? 'completed-today' : ''}`}>
          <div className="streak-icon">
            {currentStreak > 0 ? '🔥' : '🌱'}
          </div>
          <div className="streak-content">
            <div className="streak-number">
              {currentStreak > 0 ? (
                <>
                  <span className="streak-count">{currentStreak}</span>
                  <span className="streak-label">day streak</span>
                </>
              ) : (
                <span className="streak-start">Start your streak!</span>
              )}
            </div>
            {longestStreak > currentStreak && (
              <div className="longest-streak">
                Personal best: {longestStreak} days
              </div>
            )}
          </div>
          {hasActivity && (
            <div className="streak-check">✓</div>
          )}
        </div>

        {/* Encouragement Message */}
        <div className={`encouragement-message ${atRisk ? 'warning' : ''}`}>
          {getEncouragementMessage()}
        </div>

        {/* Audio Player */}
        {currentTrack && (
          <div className="audio-section">
            <h2>Audio Bible</h2>
            <AudioPlayer />
          </div>
        )}

        {/* Resume Audio */}
        {!currentTrack && lastPlayedTrack && (
          <div className="resume-audio-card">
            <div className="resume-audio-content">
              <div className="resume-audio-icon">🎧</div>
              <div className="resume-audio-info">
                <h3>Continue Listening</h3>
                <p>{lastPlayedTrack.title}</p>
                {getProgress(lastPlayedTrack) > 0 && (
                  <div className="resume-progress">
                    {Math.floor(getProgress(lastPlayedTrack) / 60)}:
                    {Math.floor(getProgress(lastPlayedTrack) % 60).toString().padStart(2, '0')} elapsed
                  </div>
                )}
              </div>
            </div>
            <button onClick={handleResumeAudio} className="resume-audio-button">
              Resume
            </button>
          </div>
        )}

        {/* Audio Listening Stats */}
        {listeningStats.totalChaptersListened > 0 && (
          <div className="audio-stats-card">
            <h3>Audio Bible Progress</h3>
            <div className="audio-stats-grid">
              <div className="audio-stat-item">
                <span className="audio-stat-icon">🎧</span>
                <span className="audio-stat-value">{listeningStats.totalChaptersListened}</span>
                <span className="audio-stat-label">Chapters Listened</span>
              </div>
              <div className="audio-stat-item">
                <span className="audio-stat-icon">⏱️</span>
                <span className="audio-stat-value">
                  {Math.floor(listeningStats.totalListeningTime / 60)}m
                </span>
                <span className="audio-stat-label">Listening Time</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Log an Activity</h2>
          <div className="activity-buttons">
            {Object.entries(ACTIVITY_TYPES).map(([key, value]) => (
              <button
                key={value}
                className="activity-button"
                onClick={() => handleLogActivity(value)}
              >
                <span className="activity-icon">{activityTypeIcons[value]}</span>
                <span className="activity-label">{activityTypeLabels[value]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="stats-overview">
          <h2>Your Progress</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalActivities}</div>
                <div className="stat-label">Total Activities</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <div className="stat-value">{earnedBadgesCount}/{allBadges.length}</div>
                <div className="stat-label">Badges Earned</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-content">
                <div className="stat-value">{longestStreak}</div>
                <div className="stat-label">Longest Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className="activity-breakdown">
          <h2>Activity Breakdown</h2>
          <div className="activity-stats">
            {Object.entries(ACTIVITY_TYPES).map(([key, value]) => (
              <div key={value} className="activity-stat-item">
                <span className="activity-stat-icon">{activityTypeIcons[value]}</span>
                <span className="activity-stat-label">{activityTypeLabels[value]}</span>
                <span className="activity-stat-count">{stats.activityCounts[value] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Badges */}
        <div className="recent-badges">
          <div className="recent-badges-header">
            <h2>Badges</h2>
            <Link to="/badges" className="view-all-link">View All →</Link>
          </div>
          <div className="badges-preview">
            {allBadges.slice(0, 4).map(badge => (
              <div
                key={badge.id}
                className={`badge-preview ${badge.earned ? 'earned' : 'locked'}`}
              >
                <div className="badge-preview-icon">
                  {badge.earned ? badge.icon : '🔒'}
                </div>
                <div className="badge-preview-name">{badge.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="quick-links">
          <Link to="/lessons" className="quick-link-card">
            <span className="quick-link-icon">📚</span>
            <span className="quick-link-text">Browse Lessons</span>
          </Link>
          <Link to="/bible" className="quick-link-card">
            <span className="quick-link-icon">📖</span>
            <span className="quick-link-text">Bible Tool</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TodayPage;
