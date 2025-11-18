/**
 * Devotional Service
 *
 * Provides utility functions for devotional content management.
 * Devotionals are stored in localStorage and managed through DevotionalContext.
 */

/**
 * Validate a devotional object
 * @param {object} devotional
 * @returns {object} { valid: boolean, errors: string[] }
 */
export const validateDevotional = (devotional) => {
  const errors = [];

  if (!devotional.title || typeof devotional.title !== 'string' || devotional.title.trim() === '') {
    errors.push('Title is required and must be a non-empty string');
  }

  if (!devotional.body || typeof devotional.body !== 'string' || devotional.body.trim() === '') {
    errors.push('Body content is required');
  }

  if (!devotional.publishAt) {
    errors.push('Publish date is required');
  }

  if (devotional.publishAt && !isValidDate(devotional.publishAt)) {
    errors.push('Publish date must be a valid date in YYYY-MM-DD format');
  }

  if (devotional.expiryAt && !isValidDate(devotional.expiryAt)) {
    errors.push('Expiry date must be a valid date in YYYY-MM-DD format');
  }

  if (devotional.expiryAt && devotional.publishAt && devotional.expiryAt < devotional.publishAt) {
    errors.push('Expiry date cannot be before publish date');
  }

  if (devotional.targetType && !['global', 'plan', 'group'].includes(devotional.targetType)) {
    errors.push('Target type must be one of: global, plan, group');
  }

  if (devotional.status && !['draft', 'published', 'archived'].includes(devotional.status)) {
    errors.push('Status must be one of: draft, published, archived');
  }

  if (devotional.passageRefs && !Array.isArray(devotional.passageRefs)) {
    errors.push('Passage references must be an array');
  }

  if (devotional.tags && !Array.isArray(devotional.tags)) {
    errors.push('Tags must be an array');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Check if a date string is valid (YYYY-MM-DD format)
 * @param {string} dateString
 * @returns {boolean}
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Create an empty devotional template
 * @returns {object} Template devotional
 */
export const createEmptyDevotional = () => {
  return {
    title: '',
    subtitle: '',
    body: '',
    passageRefs: [],
    author: '',
    targetType: 'global',
    targetId: null,
    publishAt: new Date().toISOString().split('T')[0],
    expiryAt: null,
    status: 'draft',
    featured: false,
    tags: [],
    category: ''
  };
};

/**
 * Strip HTML tags from content for plain text preview
 * @param {string} html
 * @param {number} maxLength
 * @returns {string}
 */
export const stripHtml = (html, maxLength = null) => {
  if (!html) return '';

  // Create a temporary div to parse HTML
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  let text = tmp.textContent || tmp.innerText || '';

  if (maxLength && text.length > maxLength) {
    text = text.substring(0, maxLength) + '...';
  }

  return text;
};

/**
 * Get a summary of the devotional for previews
 * @param {object} devotional
 * @param {number} maxLength
 * @returns {string}
 */
export const getDevotionalSummary = (devotional, maxLength = 150) => {
  return stripHtml(devotional.body, maxLength);
};

/**
 * Format a date for display
 * @param {string} dateString - YYYY-MM-DD format
 * @param {string} format - 'short', 'long', or 'relative'
 * @returns {string}
 */
export const formatDate = (dateString, format = 'short') => {
  if (!dateString) return '';

  const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues

  if (format === 'relative') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate - today;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 1 && diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < -1 && diffDays > -7) return `${Math.abs(diffDays)} days ago`;
  }

  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Short format (default)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Parse passage reference string to object
 * @param {string} refString - e.g., "John 3:16" or "Psalm 23:1-6"
 * @returns {object|null}
 */
export const parsePassageRef = (refString) => {
  if (!refString) return null;

  const match = refString.match(/^(\d?\s?[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?/);

  if (!match) {
    return null;
  }

  return {
    ref: refString,
    book: match[1].trim(),
    chapter: parseInt(match[2]),
    verse: parseInt(match[3]),
    verseEnd: match[4] ? parseInt(match[4]) : null
  };
};

/**
 * Add a passage reference to devotional
 * @param {object} devotional
 * @param {string} refString
 * @returns {object} Updated devotional
 */
export const addPassageRef = (devotional, refString) => {
  const parsed = parsePassageRef(refString);
  if (!parsed) return devotional;

  const passageRefs = devotional.passageRefs || [];

  // Check if already exists
  if (passageRefs.some(ref => ref.ref === refString)) {
    return devotional;
  }

  return {
    ...devotional,
    passageRefs: [...passageRefs, parsed]
  };
};

/**
 * Remove a passage reference from devotional
 * @param {object} devotional
 * @param {string} refString
 * @returns {object} Updated devotional
 */
export const removePassageRef = (devotional, refString) => {
  return {
    ...devotional,
    passageRefs: (devotional.passageRefs || []).filter(ref => ref.ref !== refString)
  };
};

/**
 * Calculate reading time estimate
 * @param {string} htmlContent
 * @returns {number} Estimated minutes to read
 */
export const calculateReadingTime = (htmlContent) => {
  const text = stripHtml(htmlContent);
  const words = text.split(/\s+/).length;
  const wordsPerMinute = 200; // Average reading speed
  return Math.ceil(words / wordsPerMinute);
};

/**
 * Get status badge color
 * @param {string} status
 * @returns {string} CSS class name
 */
export const getStatusColor = (status) => {
  const colors = {
    draft: 'badge-secondary',
    published: 'badge-success',
    archived: 'badge-muted'
  };
  return colors[status] || 'badge-secondary';
};

/**
 * Export a devotional to JSON
 * @param {object} devotional
 * @returns {string} JSON string
 */
export const exportDevotional = (devotional) => {
  // Remove read count and internal tracking fields for export
  const { readCount, version, createdAt, updatedAt, ...exportData } = devotional;
  return JSON.stringify(exportData, null, 2);
};

/**
 * Import a devotional from JSON
 * @param {string} jsonString
 * @returns {object|null} Parsed devotional or null if invalid
 */
export const importDevotional = (jsonString) => {
  try {
    const devotional = JSON.parse(jsonString);
    const validation = validateDevotional(devotional);

    if (validation.valid) {
      return devotional;
    } else {
      console.error('Invalid devotional:', validation.errors);
      return null;
    }
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
};

/**
 * Filter devotionals by date range
 * @param {array} devotionals
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {array}
 */
export const filterByDateRange = (devotionals, startDate, endDate) => {
  return devotionals.filter(d => {
    if (!d.publishAt) return false;
    return d.publishAt >= startDate && d.publishAt <= endDate;
  });
};

/**
 * Filter devotionals by status
 * @param {array} devotionals
 * @param {string} status
 * @returns {array}
 */
export const filterByStatus = (devotionals, status) => {
  return devotionals.filter(d => d.status === status);
};

/**
 * Filter devotionals by category
 * @param {array} devotionals
 * @param {string} category
 * @returns {array}
 */
export const filterByCategory = (devotionals, category) => {
  return devotionals.filter(d => d.category === category);
};

/**
 * Get unique categories from devotionals
 * @param {array} devotionals
 * @returns {array}
 */
export const getUniqueCategories = (devotionals) => {
  const categories = devotionals
    .map(d => d.category)
    .filter(c => c && c.trim() !== '');
  return [...new Set(categories)].sort();
};

/**
 * Get unique tags from devotionals
 * @param {array} devotionals
 * @returns {array}
 */
export const getUniqueTags = (devotionals) => {
  const allTags = devotionals.flatMap(d => d.tags || []);
  return [...new Set(allTags)].sort();
};

const devotionalService = {
  validateDevotional,
  isValidDate,
  createEmptyDevotional,
  stripHtml,
  getDevotionalSummary,
  formatDate,
  parsePassageRef,
  addPassageRef,
  removePassageRef,
  calculateReadingTime,
  getStatusColor,
  exportDevotional,
  importDevotional,
  filterByDateRange,
  filterByStatus,
  filterByCategory,
  getUniqueCategories,
  getUniqueTags
};

export default devotionalService;
