/**
 * Context Card Service
 *
 * Provides API-like functions for accessing context cards for difficult Bible verses.
 * Context cards are stored in localStorage and managed through ContextCardContext.
 */

/**
 * Parse a verse reference to extract book, chapter, and verse information
 * @param {string} verseRef - e.g., "John 3:16" or "John 3:16-17"
 * @returns {object} Parsed reference components
 */
export const parseVerseReference = (verseRef) => {
  const match = verseRef.match(/^(\d?\s?[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?/);

  if (!match) {
    return null;
  }

  return {
    book: match[1].trim(),
    chapter: parseInt(match[2]),
    verseStart: parseInt(match[3]),
    verseEnd: match[4] ? parseInt(match[4]) : parseInt(match[3]),
    fullReference: verseRef
  };
};

/**
 * Check if a verse reference matches or is contained within a verse range
 * @param {string} singleVerse - e.g., "John 3:16"
 * @param {string} rangeVerse - e.g., "John 3:14-18" or "John 3:16"
 * @returns {boolean} True if the single verse is within the range
 */
export const isVerseInRange = (singleVerse, rangeVerse) => {
  const single = parseVerseReference(singleVerse);
  const range = parseVerseReference(rangeVerse);

  if (!single || !range) {
    return false;
  }

  // Must be same book and chapter
  if (single.book !== range.book || single.chapter !== range.chapter) {
    return false;
  }

  // Check if single verse is within range
  return single.verseStart >= range.verseStart && single.verseStart <= range.verseEnd;
};

/**
 * Normalize a verse reference for comparison
 * Handles variations like "1 John" vs "1John", extra spaces, etc.
 * @param {string} verseRef
 * @returns {string} Normalized reference
 */
export const normalizeVerseReference = (verseRef) => {
  return verseRef
    .trim()
    .replace(/\s+/g, ' ')  // Multiple spaces to single space
    .replace(/(\d)\s+([A-Za-z])/g, '$1$2');  // Remove space between number and book name
};

/**
 * Format a cross-reference for display
 * @param {object} crossRef - { ref: string, note: string }
 * @returns {string} Formatted cross-reference
 */
export const formatCrossReference = (crossRef) => {
  return `${crossRef.ref}: ${crossRef.note}`;
};

/**
 * Get context card summary (shortened version for tooltips/previews)
 * @param {object} contextCard
 * @param {number} maxLength - Maximum length of summary
 * @returns {string} Shortened summary
 */
export const getContextCardSummary = (contextCard, maxLength = 150) => {
  const summary = contextCard.keyTheme || contextCard.historicalContext || '';

  if (summary.length <= maxLength) {
    return summary;
  }

  return summary.substring(0, maxLength) + '...';
};

/**
 * Validate a context card object
 * @param {object} card
 * @returns {object} { valid: boolean, errors: string[] }
 */
export const validateContextCard = (card) => {
  const errors = [];

  if (!card.verseRef || typeof card.verseRef !== 'string') {
    errors.push('verseRef is required and must be a string');
  }

  if (card.verseRef && !parseVerseReference(card.verseRef)) {
    errors.push('verseRef must be a valid Bible reference (e.g., "John 3:16")');
  }

  if (!card.historicalContext && !card.literaryContext && !card.keyTheme) {
    errors.push('At least one of historicalContext, literaryContext, or keyTheme is required');
  }

  if (card.crossReferences && !Array.isArray(card.crossReferences)) {
    errors.push('crossReferences must be an array');
  }

  if (card.crossReferences) {
    card.crossReferences.forEach((ref, index) => {
      if (!ref.ref || !ref.note) {
        errors.push(`crossReferences[${index}] must have both 'ref' and 'note' properties`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Create an empty context card template
 * @param {string} verseRef
 * @returns {object} Template context card
 */
export const createEmptyContextCard = (verseRef) => {
  return {
    verseRef: verseRef || '',
    verseRange: verseRef || '',
    historicalContext: '',
    literaryContext: '',
    keyTheme: '',
    crossReferences: []
  };
};

/**
 * Export a context card to JSON
 * @param {object} card
 * @returns {string} JSON string
 */
export const exportContextCard = (card) => {
  return JSON.stringify(card, null, 2);
};

/**
 * Import a context card from JSON
 * @param {string} jsonString
 * @returns {object|null} Parsed context card or null if invalid
 */
export const importContextCard = (jsonString) => {
  try {
    const card = JSON.parse(jsonString);
    const validation = validateContextCard(card);

    if (validation.valid) {
      return card;
    } else {
      console.error('Invalid context card:', validation.errors);
      return null;
    }
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
};

const contextCardService = {
  parseVerseReference,
  isVerseInRange,
  normalizeVerseReference,
  formatCrossReference,
  getContextCardSummary,
  validateContextCard,
  createEmptyContextCard,
  exportContextCard,
  importContextCard
};

export default contextCardService;
