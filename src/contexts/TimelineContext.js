import React, { createContext, useContext, useState, useEffect } from 'react';
import { bibleEvents, getAllThemes, getAllEras } from '../data/bibleEvents';

const TimelineContext = createContext();

export const useTimeline = () => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimeline must be used within a TimelineProvider');
  }
  return context;
};

export const TimelineProvider = ({ children }) => {
  // Filter state
  const [selectedTestament, setSelectedTestament] = useState('All');
  const [selectedTheme, setSelectedTheme] = useState('All');
  const [selectedEra, setSelectedEra] = useState('All');

  // Zoom/scale state (1 = default, 2 = zoomed in, 0.5 = zoomed out)
  const [zoomLevel, setZoomLevel] = useState(1);

  // Selected event for detail view
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Search/filter text
  const [searchText, setSearchText] = useState('');

  // Favorites (stored in localStorage)
  const [favoriteEvents, setFavoriteEvents] = useState(() => {
    const saved = localStorage.getItem('timeline-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('timeline-favorites', JSON.stringify(favoriteEvents));
  }, [favoriteEvents]);

  // Get filtered events based on current filters
  const getFilteredEvents = () => {
    let filtered = [...bibleEvents];

    // Filter by testament
    if (selectedTestament !== 'All') {
      filtered = filtered.filter(event => event.testament === selectedTestament);
    }

    // Filter by theme
    if (selectedTheme !== 'All') {
      filtered = filtered.filter(event => event.theme === selectedTheme);
    }

    // Filter by era
    if (selectedEra !== 'All') {
      filtered = filtered.filter(event => event.era === selectedEra);
    }

    // Filter by search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(search) ||
        event.description.toLowerCase().includes(search) ||
        event.relatedPeople.some(person => person.toLowerCase().includes(search))
      );
    }

    return filtered;
  };

  // Toggle favorite status for an event
  const toggleFavorite = (eventId) => {
    setFavoriteEvents(prev => {
      if (prev.includes(eventId)) {
        return prev.filter(id => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  };

  // Check if event is favorited
  const isFavorite = (eventId) => {
    return favoriteEvents.includes(eventId);
  };

  // Zoom controls
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedTestament('All');
    setSelectedTheme('All');
    setSelectedEra('All');
    setSearchText('');
  };

  // Analytics tracking
  const trackTimelineView = () => {
    // Increment view count
    const viewCount = parseInt(localStorage.getItem('timeline-views') || '0', 10);
    localStorage.setItem('timeline-views', (viewCount + 1).toString());
  };

  const trackEventDetailClick = (eventId) => {
    // Track event detail views
    const eventViews = JSON.parse(localStorage.getItem('timeline-event-views') || '{}');
    eventViews[eventId] = (eventViews[eventId] || 0) + 1;
    localStorage.setItem('timeline-event-views', JSON.stringify(eventViews));
  };

  const getAnalytics = () => {
    return {
      totalViews: parseInt(localStorage.getItem('timeline-views') || '0', 10),
      eventViews: JSON.parse(localStorage.getItem('timeline-event-views') || '{}')
    };
  };

  const value = {
    // Data
    allEvents: bibleEvents,
    filteredEvents: getFilteredEvents(),
    allThemes: getAllThemes(),
    allEras: getAllEras(),

    // Filter state
    selectedTestament,
    setSelectedTestament,
    selectedTheme,
    setSelectedTheme,
    selectedEra,
    setSelectedEra,
    searchText,
    setSearchText,
    clearFilters,

    // Zoom state
    zoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,

    // Selected event
    selectedEvent,
    setSelectedEvent,

    // Favorites
    favoriteEvents,
    toggleFavorite,
    isFavorite,

    // Analytics
    trackTimelineView,
    trackEventDetailClick,
    getAnalytics
  };

  return (
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  );
};
