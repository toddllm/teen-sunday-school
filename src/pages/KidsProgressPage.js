import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useKidsContent } from '../contexts/KidsContentContext';
import { useKidsMode } from '../contexts/KidsModeContext';
import './KidsProgressPage.css';

const KidsProgressPage = () => {
  const navigate = useNavigate();
  const { getStories, getSongs, stats } = useKidsContent();
  const { analytics } = useKidsMode();

  const stories = getStories();
  const songs = getSongs();
  const totalContent = stories.length + songs.length;
  const completionPercentage = totalContent > 0
    ? Math.round((stats.completedCount / totalContent) * 100)
    : 0;

  const achievements = [
    {
      id: 'first-story',
      title: 'First Story!',
      emoji: '📖',
      description: 'You read your first Bible story!',
      unlocked: stats.completedCount >= 1
    },
    {
      id: 'story-master',
      title: 'Story Master',
      emoji: '⭐',
      description: 'You completed 5 stories!',
      unlocked: stats.completedCount >= 5
    },
    {
      id: 'super-reader',
      title: 'Super Reader',
      emoji: '🏆',
      description: 'You read all the stories!',
      unlocked: stats.completedCount >= totalContent
    },
    {
      id: 'favorite-collector',
      title: 'Favorite Collector',
      emoji: '❤️',
      description: 'You have 3 favorite stories!',
      unlocked: stats.favoritesCount >= 3
    }
  ];

  return (
    <div className="kids-progress-page">
      <div className="progress-header">
        <button className="back-button" onClick={() => navigate('/kids')}>
          <span className="back-icon">←</span> Home
        </button>
        <h1 className="progress-title">
          <span className="title-emoji">🏆</span>
          My Progress
        </h1>
        <p className="progress-subtitle">Look how much you've learned!</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-emoji">📚</div>
          <div className="stat-number">{stats.completedCount}</div>
          <div className="stat-label">Stories Completed</div>
        </div>

        <div className="stat-card stat-secondary">
          <div className="stat-emoji">❤️</div>
          <div className="stat-number">{stats.favoritesCount}</div>
          <div className="stat-label">Favorite Stories</div>
        </div>

        <div className="stat-card stat-accent">
          <div className="stat-emoji">⏱️</div>
          <div className="stat-number">{analytics.formattedUsageTime}</div>
          <div className="stat-label">Time Learning</div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-emoji">🎯</div>
          <div className="stat-number">{completionPercentage}%</div>
          <div className="stat-label">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <h2 className="section-title">
          <span className="section-icon">📊</span>
          Your Journey
        </h2>
        <div className="progress-bar-container">
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${completionPercentage}%` }}
            >
              <span className="progress-bar-text">{completionPercentage}%</span>
            </div>
          </div>
          <p className="progress-text">
            {stats.completedCount} of {totalContent} stories & songs completed!
          </p>
        </div>
      </div>

      {/* Achievements */}
      <div className="achievements-section">
        <h2 className="section-title">
          <span className="section-icon">🎖️</span>
          Achievements
        </h2>
        <div className="achievements-grid">
          {achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-emoji">{achievement.emoji}</div>
              <h3 className="achievement-title">{achievement.title}</h3>
              <p className="achievement-description">{achievement.description}</p>
              {achievement.unlocked && (
                <div className="unlocked-badge">
                  <span className="badge-icon">✓</span>
                  Unlocked!
                </div>
              )}
              {!achievement.unlocked && (
                <div className="locked-overlay">
                  <span className="lock-icon">🔒</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Encouragement */}
      <div className="encouragement-card">
        {stats.completedCount === 0 && (
          <>
            <div className="encouragement-emoji">🌟</div>
            <h3>Start Your Journey!</h3>
            <p>Read your first Bible story today!</p>
            <button className="kids-btn kids-btn-primary" onClick={() => navigate('/kids/all-stories')}>
              <span className="btn-icon">📚</span>
              Start Reading
            </button>
          </>
        )}
        {stats.completedCount > 0 && stats.completedCount < totalContent && (
          <>
            <div className="encouragement-emoji">🎉</div>
            <h3>You're Doing Great!</h3>
            <p>Keep going! You're learning so much about God!</p>
            <button className="kids-btn kids-btn-primary" onClick={() => navigate('/kids/all-stories')}>
              <span className="btn-icon">📚</span>
              Read More
            </button>
          </>
        )}
        {stats.completedCount >= totalContent && (
          <>
            <div className="encouragement-emoji">🏆</div>
            <h3>Amazing Job!</h3>
            <p>You've completed all the stories! You're a Bible champion!</p>
            <button className="kids-btn kids-btn-primary" onClick={() => navigate('/kids/favorites')}>
              <span className="btn-icon">❤️</span>
              Reread Favorites
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default KidsProgressPage;
