import React from 'react';
import { Link } from 'react-router-dom';
import './EventCard.css';

/**
 * EventCard Component
 * Displays a seasonal event in card format
 */
function EventCard({ event, participation, showStats = false }) {
  // Calculate if event is active
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isActive = event.isActive && startDate <= now && endDate <= now;
  const isUpcoming = event.isActive && startDate > now;
  const isPast = endDate < now;

  // Format dates
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get season emoji/icon
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

  // Get status badge
  const getStatusBadge = () => {
    if (isActive) {
      return <span className="event-badge event-badge-active">Active</span>;
    }
    if (isUpcoming) {
      return <span className="event-badge event-badge-upcoming">Upcoming</span>;
    }
    if (isPast) {
      return <span className="event-badge event-badge-past">Ended</span>;
    }
    return null;
  };

  return (
    <Link to={`/events/${event.id}`} className="event-card">
      <div
        className="event-card-banner"
        style={{
          backgroundColor: event.bannerColor || '#4A90E2',
          backgroundImage: event.bannerImage ? `url(${event.bannerImage})` : 'none',
        }}
      >
        <div className="event-card-icon">{getSeasonIcon(event.season)}</div>
        {event.isPinned && <div className="event-card-pinned">📌 Pinned</div>}
      </div>

      <div className="event-card-content">
        <div className="event-card-header">
          <h3 className="event-card-title">{event.title}</h3>
          {getStatusBadge()}
        </div>

        <p className="event-card-description">
          {event.description?.substring(0, 120)}
          {event.description?.length > 120 ? '...' : ''}
        </p>

        <div className="event-card-dates">
          <span className="event-card-date">
            📅 {formatDate(event.startDate)} - {formatDate(event.endDate)}
          </span>
        </div>

        {participation && (
          <div className="event-card-progress">
            <div className="event-progress-bar">
              <div
                className="event-progress-fill"
                style={{ width: `${participation.progress}%` }}
              />
            </div>
            <div className="event-progress-stats">
              <span>{participation.progress}% Complete</span>
              <span>{participation.pointsEarned} points</span>
            </div>
          </div>
        )}

        {showStats && event._count && (
          <div className="event-card-stats">
            <span className="event-stat">
              👥 {event._count.participations} participants
            </span>
            <span className="event-stat">
              ⚡ {event._count.activities} activities
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default EventCard;
