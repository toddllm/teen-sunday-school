import React from 'react';
import { useNavigate } from 'react-router-dom';
import './JourneyCard.css';

const JourneyCard = ({ journey, progressPercentage = 0, isStarted = false, isCompleted = false }) => {
  const navigate = useNavigate();

  // Theme icons mapping
  const themeIcons = {
    'Forgiveness': '🕊️',
    'Justice': '⚖️',
    'Faith': '✝️',
    'Hope': '🌟',
    'Love': '❤️',
    'Grace': '🌿',
    'Peace': '☮️',
    'Joy': '😊',
    'Wisdom': '🦉',
    'Courage': '🦁'
  };

  const handleClick = () => {
    navigate(`/journeys/${journey.id}`);
  };

  const getStatusBadge = () => {
    if (isCompleted) {
      return <span className="journey-badge completed">✓ Completed</span>;
    }
    if (isStarted) {
      return <span className="journey-badge in-progress">In Progress</span>;
    }
    return <span className="journey-badge not-started">Not Started</span>;
  };

  return (
    <div className="journey-card" onClick={handleClick}>
      <div className="journey-card-header">
        <div className="journey-icon">
          {themeIcons[journey.theme] || '📖'}
        </div>
        <div className="journey-card-title">
          <h3>{journey.title}</h3>
          {getStatusBadge()}
        </div>
      </div>

      <p className="journey-description">{journey.description}</p>

      <div className="journey-meta">
        <span className="journey-steps">
          {journey.steps.length} {journey.steps.length === 1 ? 'step' : 'steps'}
        </span>
      </div>

      {isStarted && (
        <div className="journey-progress-container">
          <div className="journey-progress-bar">
            <div
              className="journey-progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="journey-progress-text">{progressPercentage}%</span>
        </div>
      )}
    </div>
  );
};

export default JourneyCard;
