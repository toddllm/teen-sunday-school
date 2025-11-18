import React, { useEffect, useRef, useState } from 'react';
import { useTimeline } from '../contexts/TimelineContext';
import {
  getChronologicalEvents,
  calculateTimelinePosition,
  formatYear,
  getEraTimeSpans,
  getTimelineStats
} from '../services/timelineService';
import EventDetailModal from '../components/EventDetailModal';
import './BibleTimelinePage.css';

const BibleTimelinePage = () => {
  const {
    filteredEvents,
    allThemes,
    allEras,
    selectedTestament,
    setSelectedTestament,
    selectedTheme,
    setSelectedTheme,
    selectedEra,
    setSelectedEra,
    searchText,
    setSearchText,
    clearFilters,
    zoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    selectedEvent,
    setSelectedEvent,
    isFavorite,
    toggleFavorite,
    trackTimelineView,
    trackEventDetailClick
  } = useTimeline();

  const timelineRef = useRef(null);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(null);

  // Track page view on mount
  useEffect(() => {
    trackTimelineView();
    setStats(getTimelineStats());
  }, [trackTimelineView]);

  // Get chronological events for display
  const chronologicalEvents = getChronologicalEvents(filteredEvents);

  // Get era time spans for visual grouping
  const eraSpans = getEraTimeSpans();

  // Handle event click
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    trackEventDetailClick(event.id);
  };

  // Handle event favorite toggle
  const handleFavoriteToggle = (event, e) => {
    e.stopPropagation();
    toggleFavorite(event.id);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' && selectedEvent) {
        setSelectedEvent(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedEvent, setSelectedEvent]);

  return (
    <div className="bible-timeline-page">
      {/* Header */}
      <header className="timeline-header">
        <div className="timeline-header-content">
          <h1>Bible Timeline</h1>
          <p className="timeline-subtitle">
            Explore major biblical events in chronological order
          </p>
          <p className="timeline-disclaimer">
            Note: All dates are approximate based on scholarly consensus
          </p>
        </div>

        {/* Stats Toggle */}
        <button
          className="stats-toggle-btn"
          onClick={() => setShowStats(!showStats)}
        >
          {showStats ? 'Hide' : 'Show'} Statistics
        </button>
      </header>

      {/* Statistics Panel */}
      {showStats && stats && (
        <div className="timeline-stats">
          <div className="stat-item">
            <span className="stat-label">Total Events:</span>
            <span className="stat-value">{stats.totalEvents}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Old Testament:</span>
            <span className="stat-value">{stats.oldTestamentEvents}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">New Testament:</span>
            <span className="stat-value">{stats.newTestamentEvents}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Eras:</span>
            <span className="stat-value">{stats.eras}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Themes:</span>
            <span className="stat-value">{stats.themes}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Showing:</span>
            <span className="stat-value">{filteredEvents.length}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="timeline-controls">
        {/* Search */}
        <div className="control-group search-group">
          <input
            type="text"
            placeholder="Search events..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Filters */}
        <div className="control-group filters-group">
          <select
            value={selectedTestament}
            onChange={(e) => setSelectedTestament(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Testaments</option>
            <option value="OT">Old Testament</option>
            <option value="NT">New Testament</option>
          </select>

          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="filter-select"
          >
            {allThemes.map(theme => (
              <option key={theme} value={theme}>{theme}</option>
            ))}
          </select>

          <select
            value={selectedEra}
            onChange={(e) => setSelectedEra(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Eras</option>
            {allEras.map(era => (
              <option key={era} value={era}>{era}</option>
            ))}
          </select>

          {(selectedTestament !== 'All' || selectedTheme !== 'All' || selectedEra !== 'All' || searchText) && (
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="control-group zoom-group">
          <button onClick={zoomOut} className="zoom-btn" disabled={zoomLevel <= 0.5}>
            −
          </button>
          <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
          <button onClick={zoomIn} className="zoom-btn" disabled={zoomLevel >= 3}>
            +
          </button>
          <button onClick={resetZoom} className="reset-zoom-btn">
            Reset
          </button>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="timeline-container">
        {chronologicalEvents.length === 0 ? (
          <div className="no-events">
            <p>No events found matching your filters.</p>
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          </div>
        ) : (
          <div
            className="timeline-scroll-wrapper"
            ref={timelineRef}
            style={{ '--zoom-level': zoomLevel }}
          >
            {/* Era Backgrounds */}
            <div className="timeline-eras">
              {eraSpans.map((era, index) => (
                <div
                  key={era.name}
                  className="era-section"
                  style={{
                    '--era-color': `hsl(${(index * 360) / eraSpans.length}, 60%, 95%)`
                  }}
                >
                  <div className="era-label">
                    <span className="era-name">{era.name}</span>
                    <span className="era-date-range">
                      {formatYear(era.minYear)} - {formatYear(era.maxYear)}
                    </span>
                    <span className="era-count">
                      {era.eventCount} event{era.eventCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline Line */}
            <div className="timeline-line">
              <div className="timeline-axis"></div>

              {/* Events */}
              {chronologicalEvents.map((event, index) => {
                const position = calculateTimelinePosition(event, chronologicalEvents);
                const isEven = index % 2 === 0;

                return (
                  <div
                    key={event.id}
                    id={`event-${event.id}`}
                    className={`timeline-event ${isEven ? 'top' : 'bottom'} ${
                      isFavorite(event.id) ? 'favorited' : ''
                    }`}
                    style={{
                      left: position !== null ? `${position}%` : 'auto'
                    }}
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="event-marker">
                      <div className="marker-dot"></div>
                      <div className="marker-line"></div>
                    </div>

                    <div className="event-card">
                      <button
                        className={`favorite-btn ${isFavorite(event.id) ? 'active' : ''}`}
                        onClick={(e) => handleFavoriteToggle(event, e)}
                        aria-label={isFavorite(event.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {isFavorite(event.id) ? '★' : '☆'}
                      </button>

                      <div className="event-date">
                        {event.approximateDateRange}
                      </div>
                      <div className="event-title">{event.title}</div>
                      <div className="event-testament">
                        {event.testament === 'OT' ? 'Old Testament' : event.testament === 'NT' ? 'New Testament' : ''}
                      </div>
                      <div className="event-theme">{event.theme}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="timeline-legend">
        <h3>How to Use</h3>
        <ul>
          <li>Click on any event to see more details</li>
          <li>Use filters to focus on specific testaments, themes, or eras</li>
          <li>Zoom in/out to adjust the timeline scale</li>
          <li>Star events to mark them as favorites</li>
          <li>Scroll horizontally to explore the timeline</li>
        </ul>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default BibleTimelinePage;
