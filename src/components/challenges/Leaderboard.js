import React from 'react';
import './Leaderboard.css';

const Leaderboard = ({ entries, currentUserId }) => {
  if (!entries || entries.length === 0) {
    return (
      <div className="leaderboard-empty">
        <p>No contributions yet. Be the first to contribute!</p>
      </div>
    );
  }

  const getRankMedal = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  return (
    <div className="leaderboard">
      <h3 className="leaderboard-title">Top Contributors</h3>
      <div className="leaderboard-list">
        {entries.map((entry) => (
          <div
            key={entry.userId}
            className={`leaderboard-entry ${
              entry.userId === currentUserId ? 'current-user' : ''
            } ${entry.rank <= 3 ? 'top-three' : ''}`}
          >
            <div className="entry-rank">
              <span className="rank-badge">{getRankMedal(entry.rank)}</span>
            </div>
            <div className="entry-info">
              <div className="entry-name">
                {entry.firstName} {entry.lastName}
                {entry.userId === currentUserId && (
                  <span className="you-badge">You</span>
                )}
              </div>
              <div className="entry-contributions">
                {entry.totalContributions} contribution{entry.totalContributions !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="entry-score">
              {entry.totalContributions}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
