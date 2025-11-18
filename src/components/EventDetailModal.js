import React, { useEffect } from 'react';
import { useTimeline } from '../contexts/TimelineContext';
import { getRelatedEvents, formatYear } from '../services/timelineService';
import './EventDetailModal.css';

const EventDetailModal = ({ event, onClose }) => {
  const { isFavorite, toggleFavorite, setSelectedEvent } = useTimeline();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Close on background click
  const handleBackgroundClick = (e) => {
    if (e.target.classList.contains('event-detail-modal-overlay')) {
      onClose();
    }
  };

  // Get related events
  const relatedEvents = getRelatedEvents(event, 5);

  // Handle related event click
  const handleRelatedEventClick = (relatedEvent) => {
    setSelectedEvent(relatedEvent);
  };

  return (
    <div
      className="event-detail-modal-overlay"
      onClick={handleBackgroundClick}
    >
      <div className="event-detail-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-section">
            <h2>{event.title}</h2>
            <div className="event-meta">
              <span className="event-date-large">{event.approximateDateRange}</span>
              {event.yearBCE !== null && (
                <span className="event-year">({formatYear(event.yearBCE)})</span>
              )}
            </div>
          </div>
          <div className="modal-actions">
            <button
              className={`favorite-btn-large ${isFavorite(event.id) ? 'active' : ''}`}
              onClick={() => toggleFavorite(event.id)}
              aria-label={isFavorite(event.id) ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite(event.id) ? '★ Favorited' : '☆ Add to Favorites'}
            </button>
            <button className="close-btn" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Tags */}
          <div className="event-tags">
            <span className="tag testament-tag">
              {event.testament === 'OT' ? 'Old Testament' : event.testament === 'NT' ? 'New Testament' : 'Between Testaments'}
            </span>
            <span className="tag theme-tag">{event.theme}</span>
            <span className="tag era-tag">{event.era}</span>
          </div>

          {/* Description */}
          <section className="modal-section">
            <h3>Description</h3>
            <p className="event-description">{event.description}</p>
          </section>

          {/* Key Passages */}
          {event.keyPassages && event.keyPassages.length > 0 && (
            <section className="modal-section">
              <h3>Key Bible Passages</h3>
              <ul className="passages-list">
                {event.keyPassages.map((passage, index) => (
                  <li key={index} className="passage-item">
                    <span className="passage-reference">{passage}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Related People */}
          {event.relatedPeople && event.relatedPeople.length > 0 && (
            <section className="modal-section">
              <h3>Key People Involved</h3>
              <div className="people-list">
                {event.relatedPeople.map((person, index) => (
                  <span key={index} className="person-tag">
                    {person}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Related Events */}
          {relatedEvents.length > 0 && (
            <section className="modal-section related-events-section">
              <h3>Related Events</h3>
              <div className="related-events-list">
                {relatedEvents.map((relatedEvent) => (
                  <div
                    key={relatedEvent.id}
                    className="related-event-card"
                    onClick={() => handleRelatedEventClick(relatedEvent)}
                  >
                    <div className="related-event-title">{relatedEvent.title}</div>
                    <div className="related-event-date">{relatedEvent.approximateDateRange}</div>
                    <div className="related-event-theme">{relatedEvent.theme}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="close-modal-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
