import React, { useState } from 'react';
import { useStreak } from '../contexts/StreakContext';
import { Link } from 'react-router-dom';
import './BadgesPage.css';

function BadgesPage() {
  const { getAllBadges, getStats } = useStreak();
  const [selectedBadge, setSelectedBadge] = useState(null);

  const allBadges = getAllBadges();
  const stats = getStats();
  const earnedBadges = allBadges.filter(b => b.earned);
  const lockedBadges = allBadges.filter(b => !b.earned);

  const getBadgeProgress = (badge) => {
    // Return progress information for locked badges
    if (badge.earned) return null;

    // Check specific badge criteria and return progress
    if (badge.id === 'first_step') {
      return `${stats.totalActivities}/1 activities`;
    }
    if (badge.id === 'week_warrior') {
      return `${Math.min(stats.currentStreak, 7)}/7 day streak`;
    }
    if (badge.id === 'faithful_fortnight') {
      return `${Math.min(stats.currentStreak, 14)}/14 day streak`;
    }
    if (badge.id === 'month_master') {
      return `${Math.min(stats.currentStreak, 30)}/30 day streak`;
    }
    if (badge.id === 'prayer_warrior') {
      return `${stats.activityCounts.prayer_logged || 0}/10 prayers`;
    }
    if (badge.id === 'scripture_scholar') {
      return `${stats.activityCounts.chapter_read || 0}/25 chapters`;
    }
    if (badge.id === 'memory_master') {
      return `${stats.activityCounts.verse_memorized || 0}/10 verses`;
    }
    if (badge.id === 'dedicated_disciple') {
      return `${stats.totalActivities}/50 activities`;
    }
    if (badge.id === 'longest_streak_10') {
      return `${Math.min(stats.longestStreak, 10)}/10 day best streak`;
    }
    if (badge.id === 'longest_streak_30') {
      return `${Math.min(stats.longestStreak, 30)}/30 day best streak`;
    }

    return null;
  };

  const getProgressPercentage = (badge) => {
    const progress = getBadgeProgress(badge);
    if (!progress) return 0;

    const match = progress.match(/(\d+)\/(\d+)/);
    if (match) {
      const current = parseInt(match[1]);
      const total = parseInt(match[2]);
      return Math.min((current / total) * 100, 100);
    }
    return 0;
  };

  return (
    <div className="badges-page">
      <div className="badges-container">
        <header className="badges-header">
          <Link to="/today" className="back-link">← Back to Today</Link>
          <h1>Badge Collection</h1>
          <p className="badges-subtitle">
            {earnedBadges.length} of {allBadges.length} badges earned
          </p>
          <div className="badges-progress-bar">
            <div
              className="badges-progress-fill"
              style={{ width: `${(earnedBadges.length / allBadges.length) * 100}%` }}
            />
          </div>
        </header>

        {/* Earned Badges */}
        {earnedBadges.length > 0 && (
          <section className="badge-section">
            <h2>🏆 Earned Badges</h2>
            <div className="badges-grid">
              {earnedBadges.map(badge => (
                <div
                  key={badge.id}
                  className="badge-card earned"
                  onClick={() => setSelectedBadge(badge)}
                >
                  <div className="badge-icon-large">{badge.icon}</div>
                  <h3 className="badge-name">{badge.name}</h3>
                  <p className="badge-description">{badge.description}</p>
                  {badge.awardedAt && (
                    <p className="badge-date">
                      Earned {new Date(badge.awardedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Locked Badges */}
        {lockedBadges.length > 0 && (
          <section className="badge-section">
            <h2>🔒 Locked Badges</h2>
            <div className="badges-grid">
              {lockedBadges.map(badge => {
                const progress = getBadgeProgress(badge);
                const progressPercentage = getProgressPercentage(badge);

                return (
                  <div
                    key={badge.id}
                    className="badge-card locked"
                    onClick={() => setSelectedBadge(badge)}
                  >
                    <div className="badge-icon-large">🔒</div>
                    <h3 className="badge-name">{badge.name}</h3>
                    <p className="badge-description">{badge.description}</p>
                    {progress && (
                      <div className="badge-progress">
                        <div className="badge-progress-bar">
                          <div
                            className="badge-progress-fill"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                        <p className="badge-progress-text">{progress}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty State */}
        {earnedBadges.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🌟</div>
            <h3>Start Your Journey!</h3>
            <p>Complete activities to earn your first badge.</p>
            <Link to="/today" className="cta-button">Go to Today</Link>
          </div>
        )}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="badge-modal-overlay" onClick={() => setSelectedBadge(null)}>
          <div className="badge-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedBadge(null)}>×</button>
            <div className="badge-modal-icon">
              {selectedBadge.earned ? selectedBadge.icon : '🔒'}
            </div>
            <h2 className="badge-modal-name">{selectedBadge.name}</h2>
            <p className="badge-modal-description">{selectedBadge.description}</p>

            {selectedBadge.earned ? (
              selectedBadge.awardedAt && (
                <div className="badge-modal-date">
                  <strong>Earned:</strong>{' '}
                  {new Date(selectedBadge.awardedAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              )
            ) : (
              <div className="badge-modal-progress">
                <div className="badge-progress-bar large">
                  <div
                    className="badge-progress-fill"
                    style={{ width: `${getProgressPercentage(selectedBadge)}%` }}
                  />
                </div>
                <p className="badge-progress-text large">
                  {getBadgeProgress(selectedBadge)}
                </p>
                <p className="badge-modal-encouragement">
                  Keep going! You're making great progress!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BadgesPage;
