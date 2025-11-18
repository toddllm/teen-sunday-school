import React, { useState, useEffect } from 'react';
import { useSeasonalEvents } from '../contexts/SeasonalEventContext';
import EventCard from '../components/seasonal-events/EventCard';
import EventBanner from '../components/seasonal-events/EventBanner';
import './EventsPage.css';

/**
 * EventsPage Component
 * User-facing page to view and browse seasonal events
 */
function EventsPage() {
  const {
    activeEvents,
    events,
    participations,
    loading,
    error,
    loadEvents,
    getUpcomingEvents,
    getPastEvents,
  } = useSeasonalEvents();

  const [filter, setFilter] = useState('active');
  const [seasonFilter, setSeasonFilter] = useState('all');

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Filter events based on selection
  const getFilteredEvents = () => {
    let filtered = [];

    if (filter === 'active') {
      filtered = activeEvents;
    } else if (filter === 'upcoming') {
      filtered = getUpcomingEvents();
    } else if (filter === 'past') {
      filtered = getPastEvents();
    } else {
      filtered = events;
    }

    // Apply season filter
    if (seasonFilter !== 'all') {
      filtered = filtered.filter(e => e.season === seasonFilter);
    }

    return filtered;
  };

  const filteredEvents = getFilteredEvents();

  // Get the main featured event (pinned active event or first active event)
  const featuredEvent = activeEvents.find(e => e.isPinned) || activeEvents[0];

  if (loading && events.length === 0) {
    return (
      <div className="events-page">
        <div className="events-page-loading">
          <div className="spinner"></div>
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-page">
        <div className="events-page-error">
          <p>⚠️ {error}</p>
          <button onClick={() => loadEvents()} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="events-page">
      <header className="events-page-header">
        <h1>Seasonal Events</h1>
        <p>Join special seasonal challenges and earn unique rewards!</p>
      </header>

      {/* Featured Event Banner */}
      {featuredEvent && <EventBanner event={featuredEvent} />}

      {/* Filters */}
      <div className="events-filters">
        <div className="events-filter-group">
          <label>Status:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="events-filter-select"
          >
            <option value="active">Active Now</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past Events</option>
            <option value="all">All Events</option>
          </select>
        </div>

        <div className="events-filter-group">
          <label>Season:</label>
          <select
            value={seasonFilter}
            onChange={(e) => setSeasonFilter(e.target.value)}
            className="events-filter-select"
          >
            <option value="all">All Seasons</option>
            <option value="ADVENT">🕯️ Advent</option>
            <option value="CHRISTMAS">🎄 Christmas</option>
            <option value="LENT">✝️ Lent</option>
            <option value="EASTER">🐣 Easter</option>
            <option value="PENTECOST">🔥 Pentecost</option>
            <option value="SUMMER">☀️ Summer</option>
            <option value="FALL">🍂 Fall</option>
            <option value="CUSTOM">⭐ Custom</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              participation={participations[event.id]}
              showStats={true}
            />
          ))}
        </div>
      ) : (
        <div className="events-empty">
          <div className="events-empty-icon">📅</div>
          <h3>No events found</h3>
          <p>
            {filter === 'active' && 'There are no active events at the moment.'}
            {filter === 'upcoming' && 'No upcoming events scheduled.'}
            {filter === 'past' && 'No past events to display.'}
            {filter === 'all' && 'No events available.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default EventsPage;
