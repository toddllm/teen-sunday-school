import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBadges } from '../contexts/BadgeContext';
import { useStreak } from '../contexts/StreakContext';
import './BadgesPage.css';

function BadgesPage() {
  const { getAllBadges, getProgress, getBadgesByCategory } = useBadges();
  const { currentStreak, longestStreak } = useStreak();
  const [filter, setFilter] = useState('all');

  const allBadges = getAllBadges();
  const progress = getProgress();

  const getFilteredBadges = () => {
    if (filter === 'all') return allBadges;
    if (filter === 'earned') return allBadges.filter(b => b.earned);
    if (filter === 'locked') return allBadges.filter(b => !b.earned);
    return getBadgesByCategory(filter);
  };

  const filteredBadges = getFilteredBadges();

  const categories = [
    { id: 'all', name: 'All Badges', icon: '🏅' },
    { id: 'earned', name: 'Earned', icon: '✅' },
    { id: 'locked', name: 'Locked', icon: '🔒' },
    { id: 'streak', name: 'Streaks', icon: '🔥' },
    { id: 'lessons', name: 'Lessons', icon: '📖' },
    { id: 'bible', name: 'Bible', icon: '✝️' },
    { id: 'games', name: 'Games', icon: '🎮' },
    { id: 'milestone', name: 'Milestones', icon: '⭐' }
  ];

  return (
    <div className="badges-page">
      <div className="container">
        <header className="badges-header-section">
          <div className="header-content">
            <h1>Your Badges</h1>
            <p className="subtitle">Celebrate your spiritual growth journey</p>
          </div>
          <div className="progress-summary">
            <div className="progress-circle">
              <svg viewBox="0 0 100 100">
                <circle
                  className="progress-bg"
                  cx="50"
                  cy="50"
                  r="45"
                />
                <circle
                  className="progress-fill"
                  cx="50"
                  cy="50"
                  r="45"
                  strokeDasharray={`${progress.percentage * 2.827} 282.7`}
                />
              </svg>
              <div className="progress-text">
                <span className="progress-percent">{progress.percentage}%</span>
                <span className="progress-label">Complete</span>
              </div>
            </div>
            <div className="progress-stats">
              <div className="stat-item">
                <span className="stat-value">{progress.earned}</span>
                <span className="stat-label">Badges Earned</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{currentStreak}</span>
                <span className="stat-label">Current Streak</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{longestStreak}</span>
                <span className="stat-label">Longest Streak</span>
              </div>
            </div>
          </div>
        </header>

        <div className="filter-section">
          <div className="filter-buttons">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`filter-btn ${filter === cat.id ? 'active' : ''}`}
                onClick={() => setFilter(cat.id)}
              >
                <span className="filter-icon">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="badges-grid">
          {filteredBadges.length > 0 ? (
            filteredBadges.map(badge => (
              <div
                key={badge.id}
                className={`badge-card ${badge.earned ? 'earned' : 'locked'}`}
              >
                <div className="badge-card-icon">
                  {badge.earned ? badge.icon : '🔒'}
                </div>
                <h3 className="badge-card-name">{badge.name}</h3>
                <p className="badge-card-description">{badge.description}</p>
                {badge.earned && badge.awardedAt && (
                  <div className="badge-earned-date">
                    Earned {new Date(badge.awardedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                )}
                {!badge.earned && (
                  <div className="badge-locked-message">
                    Keep going to unlock!
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No badges found in this category yet.</p>
            </div>
          )}
        </div>

        <div className="encouragement-section">
          <div className="encouragement-card">
            <h2>Keep Growing!</h2>
            <p>
              Every badge represents a step in your faith journey. Remember, it's not about
              collecting them all - it's about growing closer to God and developing
              consistent spiritual habits.
            </p>
            <div className="encouragement-actions">
              <Link to="/" className="btn btn-primary">
                Continue Your Journey
              </Link>
              <Link to="/lessons" className="btn btn-secondary">
                Explore Lessons
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BadgesPage;
