import React from 'react';
import './XPBar.css';

/**
 * XP Progress Bar Component
 * Displays current XP progress towards next level
 */
function XPBar({ progress, compact = false, showLabel = true }) {
  const {
    level,
    currentXP,
    xpNeeded,
    progress: progressPercent,
  } = progress;

  return (
    <div className={`xp-bar-container ${compact ? 'compact' : ''}`}>
      {showLabel && !compact && (
        <div className="xp-bar-header">
          <span className="xp-bar-label">Level {level}</span>
          <span className="xp-bar-amount">
            {currentXP} / {xpNeeded} XP
          </span>
        </div>
      )}

      <div className="xp-bar-track">
        <div
          className="xp-bar-fill"
          style={{ width: `${progressPercent}%` }}
        >
          {compact && showLabel && (
            <span className="xp-bar-text">
              Lvl {level} • {Math.round(progressPercent)}%
            </span>
          )}
        </div>
      </div>

      {!compact && (
        <div className="xp-bar-footer">
          <span className="xp-bar-progress">{Math.round(progressPercent)}% to next level</span>
        </div>
      )}
    </div>
  );
}

export default XPBar;
