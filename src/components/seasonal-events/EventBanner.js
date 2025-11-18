import React from 'react';
import { Link } from 'react-router-dom';
import './EventBanner.css';

/**
 * EventBanner Component
 * Displays a prominent banner for an active seasonal event
 */
function EventBanner({ event }) {
  if (!event) return null;

  // Get season icon
  const getSeasonIcon = (season) => {
    const icons = {
      ADVENT: '🕯️',
      CHRISTMAS: '🎄',
      LENT: '✝️',
      EASTER: '🐣',
      PENTECOST: '🔥',
      SUMMER: '☀️',
      FALL: '🍂',
      CUSTOM: '⭐',
    };
    return icons[season] || event.icon || '📅';
  };

  // Calculate days remaining
  const getDaysRemaining = () => {
    const now = new Date();
    const end = new Date(event.endDate);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div
      className="event-banner"
      style={{
        backgroundColor: event.bannerColor || '#4A90E2',
        backgroundImage: event.bannerImage
          ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${event.bannerImage})`
          : 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
      }}
    >
      <div className="event-banner-content">
        <div className="event-banner-icon">{getSeasonIcon(event.season)}</div>

        <div className="event-banner-text">
          <h2 className="event-banner-title">{event.title}</h2>
          <p className="event-banner-description">{event.description}</p>

          <div className="event-banner-info">
            {daysRemaining > 0 ? (
              <span className="event-banner-time">
                ⏰ {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
              </span>
            ) : (
              <span className="event-banner-time">⏰ Ending today!</span>
            )}
          </div>
        </div>

        <Link to={`/events/${event.id}`} className="event-banner-button">
          Join Event
        </Link>
      </div>
    </div>
  );
}

export default EventBanner;
