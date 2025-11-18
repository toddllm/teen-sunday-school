import React, { useEffect, useState } from 'react';
import './LevelUpNotification.css';

/**
 * Level Up Notification Component
 * Displays a celebratory notification when user levels up
 */
function LevelUpNotification({ oldLevel, newLevel, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setVisible(true), 100);

    // Auto-close after 4 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`level-up-notification ${visible ? 'visible' : ''}`}>
      <div className="level-up-content">
        <div className="level-up-icon">🎉</div>
        <h2 className="level-up-title">Level Up!</h2>
        <div className="level-up-levels">
          <span className="old-level">{oldLevel}</span>
          <span className="level-arrow">→</span>
          <span className="new-level">{newLevel}</span>
        </div>
        <p className="level-up-message">
          Congratulations! You've reached level {newLevel}!
        </p>
      </div>
      <div className="level-up-confetti">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="confetti-piece" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            backgroundColor: ['#FFD700', '#FFA500', '#FF6347', '#4CAF50', '#2196F3'][Math.floor(Math.random() * 5)]
          }} />
        ))}
      </div>
    </div>
  );
}

export default LevelUpNotification;
