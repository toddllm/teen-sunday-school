import React, { useState } from 'react';
import './StreakProtection.css';

function StreakProtection({
  graceDaysAvailable,
  freezeDaysAvailable,
  currentStreak,
  activateFreezeDay,
  getGraceFreezStats
}) {
  const [message, setMessage] = useState(null);
  const stats = getGraceFreezStats();

  const handleActivateFreeze = () => {
    const result = activateFreezeDay();
    setMessage(result);
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="streak-protection">
      <div className="streak-protection-header">
        <h2>Streak Protection</h2>
        <p className="streak-protection-subtitle">
          Grace and freeze days help protect your streak when life gets busy
        </p>
      </div>

      {/* Message Notification */}
      {message && (
        <div className={`protection-message ${message.success ? 'success' : 'error'}`}>
          {message.message}
        </div>
      )}

      {/* Protection Cards */}
      <div className="protection-cards">
        {/* Grace Days Card */}
        <div className="protection-card grace-card">
          <div className="protection-card-icon">
            <span role="img" aria-label="shield">🛡️</span>
          </div>
          <div className="protection-card-content">
            <h3>Grace Days</h3>
            <div className="protection-count">
              <span className="count-number">{graceDaysAvailable}</span>
              <span className="count-label">available</span>
            </div>
            <p className="protection-description">
              Automatically saved when you miss a day, keeping your streak alive
            </p>
            <div className="protection-stats">
              <span>Used: {stats.graceDaysUsed}</span>
            </div>
          </div>
        </div>

        {/* Freeze Days Card */}
        <div className="protection-card freeze-card">
          <div className="protection-card-icon">
            <span role="img" aria-label="snowflake">❄️</span>
          </div>
          <div className="protection-card-content">
            <h3>Freeze Days</h3>
            <div className="protection-count">
              <span className="count-number">{freezeDaysAvailable}</span>
              <span className="count-label">available</span>
            </div>
            <p className="protection-description">
              Pause your streak when you know you'll be away
            </p>
            <div className="protection-stats">
              <span>Used: {stats.freezeDaysUsed}</span>
            </div>
            <button
              className="activate-freeze-btn"
              onClick={handleActivateFreeze}
              disabled={freezeDaysAvailable === 0 || currentStreak === 0}
            >
              {stats.activeFreezes.some(f => {
                const today = new Date().toLocaleDateString('en-CA');
                return (f.date || f) === today;
              }) ? 'Today is Frozen ❄️' : 'Activate Freeze for Today'}
            </button>
          </div>
        </div>
      </div>

      {/* How to Earn Section */}
      <div className="earning-info">
        <h3>How to Earn Protection</h3>
        <div className="earning-grid">
          <div className="earning-item">
            <div className="earning-milestone">7-day streak</div>
            <div className="earning-reward">+1 Grace Day 🛡️</div>
          </div>
          <div className="earning-item">
            <div className="earning-milestone">14-day streak</div>
            <div className="earning-reward">+1 Grace Day 🛡️</div>
          </div>
          <div className="earning-item">
            <div className="earning-milestone">30-day streak</div>
            <div className="earning-reward">+2 Grace Days, +1 Freeze Day 🛡️❄️</div>
          </div>
          <div className="earning-item">
            <div className="earning-milestone">50-day streak</div>
            <div className="earning-reward">+1 Freeze Day ❄️</div>
          </div>
          <div className="earning-item">
            <div className="earning-milestone">100-day streak</div>
            <div className="earning-reward">+2 Grace Days, +2 Freeze Days 🛡️❄️</div>
          </div>
        </div>
      </div>

      {/* Usage History */}
      {(stats.graceDaysUsedHistory.length > 0 || stats.freezeDaysUsedHistory.length > 0) && (
        <div className="usage-history">
          <h3>Recent Protection Usage</h3>
          <div className="history-list">
            {[...stats.graceDaysUsedHistory, ...stats.freezeDaysUsedHistory]
              .sort((a, b) => new Date(b.usedAt || b.activatedAt) - new Date(a.usedAt || a.activatedAt))
              .slice(0, 5)
              .map((usage, index) => {
                const isGrace = stats.graceDaysUsedHistory.includes(usage);
                return (
                  <div key={index} className="history-item">
                    <span className="history-icon">{isGrace ? '🛡️' : '❄️'}</span>
                    <span className="history-type">{isGrace ? 'Grace Day' : 'Freeze Day'}</span>
                    <span className="history-date">
                      {new Date(usage.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="history-streak">
                      {usage.streakAtTime}-day streak protected
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="protection-info-box">
        <h4>💡 Tips</h4>
        <ul>
          <li><strong>Grace Days</strong> are used automatically when you miss a day with an active streak</li>
          <li><strong>Freeze Days</strong> must be activated before the day ends to protect your streak</li>
          <li>Maximum stockpile: 5 Grace Days, 3 Freeze Days</li>
          <li>Earn more protection by maintaining longer streaks!</li>
        </ul>
      </div>
    </div>
  );
}

export default StreakProtection;
