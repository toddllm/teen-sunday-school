import React from 'react';
import './LevelDisplay.css';

/**
 * Level Display Component
 * Shows user's current level with a badge-style design
 */
function LevelDisplay({ level, size = 'medium', showLabel = true }) {
  return (
    <div className={`level-display ${size}`}>
      <div className="level-badge">
        <div className="level-badge-inner">
          <span className="level-number">{level}</span>
        </div>
        <div className="level-rays"></div>
      </div>
      {showLabel && (
        <span className="level-label">Level {level}</span>
      )}
    </div>
  );
}

export default LevelDisplay;
