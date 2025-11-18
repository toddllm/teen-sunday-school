import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ progress, height = '24px', showLabel = true }) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="progress-bar-container" style={{ height }}>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          {showLabel && clampedProgress > 15 && (
            <span className="progress-bar-label">{Math.round(clampedProgress)}%</span>
          )}
        </div>
      </div>
      {showLabel && clampedProgress <= 15 && (
        <span className="progress-bar-label-outside">{Math.round(clampedProgress)}%</span>
      )}
    </div>
  );
};

export default ProgressBar;
