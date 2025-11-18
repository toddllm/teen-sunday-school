import React from 'react';
import './UserDisplay.css';

/**
 * UserDisplay Component
 *
 * Displays user avatar and nickname/name in a consistent format throughout the app.
 *
 * @param {Object} props
 * @param {string} props.nickname - User's nickname
 * @param {string} props.firstName - User's first name (fallback if no nickname)
 * @param {Object} props.avatar - Avatar object with imageUrl and displayName
 * @param {string} props.size - Size variant: 'small', 'medium', 'large' (default: 'medium')
 * @param {boolean} props.showRealName - Show real name in tooltip (for leaders)
 * @param {boolean} props.inline - Display inline instead of block
 */
function UserDisplay({
  nickname,
  firstName,
  avatar,
  size = 'medium',
  showRealName = false,
  inline = false,
}) {
  const displayName = nickname || firstName || 'User';
  const avatarUrl = avatar?.imageUrl;

  return (
    <div
      className={`user-display user-display--${size} ${inline ? 'user-display--inline' : ''}`}
      title={showRealName && firstName && nickname ? `Real name: ${firstName}` : ''}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={avatar.displayName || displayName}
          className="user-display__avatar"
        />
      ) : (
        <div className="user-display__avatar user-display__avatar--placeholder">
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}
      <span className="user-display__name">{displayName}</span>
    </div>
  );
}

export default UserDisplay;
