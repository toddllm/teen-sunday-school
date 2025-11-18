import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { todayAPI } from '../services/api';
import './TodayPage.css';

const TodayPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTodayScreen();
  }, []);

  const loadTodayScreen = async () => {
    try {
      setLoading(true);
      const response = await todayAPI.getTodayScreen();
      setTodayData(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load today screen');
      console.error('Error loading today screen:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your personalized screen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
        <button onClick={loadTodayScreen} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (!todayData) {
    return null;
  }

  const { header, dailyVerse, myPlan, primaryCTA, quickActions, stats } = todayData;

  return (
    <div className="today-page">
      {/* Header Section */}
      <div className="today-header">
        <div className="greeting-section">
          <h1>{header.greeting}</h1>
          <p className="today-date">{header.date}</p>
        </div>

        <div className="streak-indicator">
          <div className="streak-flame">🔥</div>
          <div className="streak-info">
            <div className="streak-number">{header.streak.current}</div>
            <div className="streak-label">Day Streak</div>
          </div>
          {header.streak.longest > 0 && (
            <div className="streak-best">
              Best: {header.streak.longest}
            </div>
          )}
        </div>
      </div>

      {/* Daily Verse Section */}
      {dailyVerse && (
        <div className="daily-verse-section card">
          <div className="section-header">
            <h2>Daily Verse</h2>
            {dailyVerse.theme && (
              <span className="verse-theme">{dailyVerse.theme}</span>
            )}
          </div>
          <div className="verse-content">
            <p className="verse-text">"{dailyVerse.text}"</p>
            <p className="verse-reference">— {dailyVerse.reference}</p>
          </div>
          {dailyVerse.reflection && (
            <div className="verse-reflection">
              <strong>Reflect:</strong> {dailyVerse.reflection}
            </div>
          )}
        </div>
      )}

      {/* My Plan Section */}
      {myPlan ? (
        <div className="my-plan-section card">
          <div className="section-header">
            <h2>My Reading Plan</h2>
            {myPlan.completedToday && (
              <span className="completed-badge">✓ Completed Today</span>
            )}
          </div>

          <div className="plan-info">
            <h3>{myPlan.name}</h3>
            <p className="plan-day">
              Day {myPlan.currentDay} of {myPlan.totalDays}
            </p>
          </div>

          {myPlan.todayTitle && (
            <div className="today-assignment">
              <h4>{myPlan.todayTitle}</h4>
              <div className="reading-list">
                {myPlan.todayReadings.map((reading, index) => (
                  <div key={index} className="reading-item">
                    📖 {reading.reference}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="progress-section">
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${myPlan.progress}%` }}
              >
                <span className="progress-text">{myPlan.progress}%</span>
              </div>
            </div>
          </div>

          {!myPlan.completedToday && (
            <button
              onClick={() => navigate(`/reading/${myPlan.planId}`)}
              className="btn-primary btn-large"
            >
              Continue Reading
            </button>
          )}
        </div>
      ) : (
        <div className="no-plan-section card">
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>Start a Reading Plan</h3>
            <p>Choose a plan to begin your daily Bible reading journey</p>
            <Link to="/plans" className="btn-primary">
              Explore Reading Plans
            </Link>
          </div>
        </div>
      )}

      {/* Primary CTA Section */}
      <div className="primary-cta-section">
        <button
          onClick={() => navigate(primaryCTA.action)}
          className="btn-cta"
        >
          <span className="cta-icon">
            {primaryCTA.type === 'reading' && '📖'}
            {primaryCTA.type === 'prayer' && '🙏'}
            {primaryCTA.type === 'journal' && '📝'}
            {primaryCTA.type === 'explore' && '🔍'}
          </span>
          <span className="cta-text">{primaryCTA.text}</span>
        </button>
      </div>

      {/* Quick Actions Section */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.action}
              className="quick-action-card"
            >
              <div className="action-icon">
                {action.icon === 'prayer' && '🙏'}
                {action.icon === 'journal' && '📝'}
                {action.icon === 'explore' && '🔍'}
                {action.icon === 'lessons' && '📚'}
              </div>
              <div className="action-label">{action.label}</div>
              {action.count > 0 && (
                <div className="action-count">{action.count}</div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section card">
        <h2>Your Journey</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{stats.totalDaysActive}</div>
            <div className="stat-label">Days Active</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.chaptersRead}</div>
            <div className="stat-label">Chapters Read</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.plansCompleted}</div>
            <div className="stat-label">Plans Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayPage;
