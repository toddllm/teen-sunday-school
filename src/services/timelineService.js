import { bibleEvents } from '../data/bibleEvents';

/**
 * Timeline Service
 * Utility functions for Bible timeline data
 */

/**
 * Get event by ID
 */
export const getEventById = (eventId) => {
  return bibleEvents.find(event => event.id === eventId);
};

/**
 * Calculate position on timeline based on year
 * Returns percentage (0-100) for positioning
 */
export const calculateTimelinePosition = (event, allEvents) => {
  // Filter events that have yearBCE defined
  const datedEvents = allEvents.filter(e => e.yearBCE !== null);

  if (datedEvents.length === 0 || event.yearBCE === null) {
    return null;
  }

  // Get min and max years
  const years = datedEvents.map(e => e.yearBCE);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  // Calculate position (BCE years are negative, so flip the calculation)
  const range = maxYear - minYear;
  if (range === 0) return 50; // All same year, center it

  // For BCE years (negative), smaller numbers are more recent
  const position = ((event.yearBCE - minYear) / range) * 100;

  return position;
};

/**
 * Group events by era
 */
export const groupEventsByEra = (events) => {
  const grouped = {};

  events.forEach(event => {
    if (!grouped[event.era]) {
      grouped[event.era] = [];
    }
    grouped[event.era].push(event);
  });

  // Sort events within each era by yearBCE
  Object.keys(grouped).forEach(era => {
    grouped[era].sort((a, b) => {
      if (a.yearBCE === null) return 1;
      if (b.yearBCE === null) return -1;
      return a.yearBCE - b.yearBCE;
    });
  });

  return grouped;
};

/**
 * Get events in chronological order
 */
export const getChronologicalEvents = (events) => {
  return [...events].sort((a, b) => {
    if (a.yearBCE === null) return 1;
    if (b.yearBCE === null) return -1;
    return a.yearBCE - b.yearBCE;
  });
};

/**
 * Format year for display
 */
export const formatYear = (yearBCE) => {
  if (yearBCE === null) return 'Unknown';

  if (yearBCE < 0) {
    return `${Math.abs(yearBCE)} BCE`;
  } else {
    return `${yearBCE} CE`;
  }
};

/**
 * Get related events (same era or theme)
 */
export const getRelatedEvents = (event, limit = 5) => {
  const related = bibleEvents.filter(e => {
    if (e.id === event.id) return false;
    return e.era === event.era || e.theme === event.theme;
  });

  // Sort by proximity in time if possible
  const sorted = related.sort((a, b) => {
    if (event.yearBCE === null || a.yearBCE === null || b.yearBCE === null) {
      return 0;
    }

    const aDiff = Math.abs(a.yearBCE - event.yearBCE);
    const bDiff = Math.abs(b.yearBCE - event.yearBCE);
    return aDiff - bDiff;
  });

  return sorted.slice(0, limit);
};

/**
 * Search events by text
 */
export const searchEvents = (searchText) => {
  if (!searchText.trim()) return bibleEvents;

  const search = searchText.toLowerCase();

  return bibleEvents.filter(event =>
    event.title.toLowerCase().includes(search) ||
    event.description.toLowerCase().includes(search) ||
    event.relatedPeople.some(person => person.toLowerCase().includes(search)) ||
    event.keyPassages.some(passage => passage.toLowerCase().includes(search)) ||
    event.theme.toLowerCase().includes(search) ||
    event.era.toLowerCase().includes(search)
  );
};

/**
 * Get timeline statistics
 */
export const getTimelineStats = () => {
  return {
    totalEvents: bibleEvents.length,
    oldTestamentEvents: bibleEvents.filter(e => e.testament === 'OT').length,
    newTestamentEvents: bibleEvents.filter(e => e.testament === 'NT').length,
    eras: [...new Set(bibleEvents.map(e => e.era))].length,
    themes: [...new Set(bibleEvents.map(e => e.theme))].length
  };
};

/**
 * Calculate era time spans
 */
export const getEraTimeSpans = () => {
  const eras = {};

  bibleEvents.forEach(event => {
    if (event.yearBCE === null) return;

    if (!eras[event.era]) {
      eras[event.era] = {
        name: event.era,
        minYear: event.yearBCE,
        maxYear: event.yearBCE,
        eventCount: 0
      };
    }

    eras[event.era].minYear = Math.min(eras[event.era].minYear, event.yearBCE);
    eras[event.era].maxYear = Math.max(eras[event.era].maxYear, event.yearBCE);
    eras[event.era].eventCount++;
  });

  return Object.values(eras).sort((a, b) => a.minYear - b.minYear);
};

const timelineService = {
  getEventById,
  calculateTimelinePosition,
  groupEventsByEra,
  getChronologicalEvents,
  formatYear,
  getRelatedEvents,
  searchEvents,
  getTimelineStats,
  getEraTimeSpans
};

export default timelineService;
