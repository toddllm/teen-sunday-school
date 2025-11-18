/**
 * Passage Metrics Service
 * Calculates reading time and difficulty for Bible passages
 */

/**
 * Extract plain text from HTML content
 * @param {string} htmlContent - HTML content from Bible API
 * @returns {string} Plain text without HTML tags
 */
const stripHTML = (htmlContent) => {
  if (!htmlContent) return '';

  // Create a temporary DOM element to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = htmlContent;

  // Remove script and style elements
  const scripts = temp.getElementsByTagName('script');
  const styles = temp.getElementsByTagName('style');
  for (let i = scripts.length - 1; i >= 0; i--) {
    scripts[i].remove();
  }
  for (let i = styles.length - 1; i >= 0; i--) {
    styles[i].remove();
  }

  // Get text content
  return temp.textContent || temp.innerText || '';
};

/**
 * Count words in text
 * @param {string} text - Plain text
 * @returns {number} Word count
 */
const countWords = (text) => {
  if (!text) return 0;

  // Split by whitespace and filter out empty strings
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
};

/**
 * Calculate reading time based on word count and reading speed
 * @param {number} wordCount - Number of words
 * @param {number} wordsPerMinute - Reading speed (default: 200 WPM)
 * @returns {object} Reading time estimate with min and max
 */
const calculateReadingTime = (wordCount, wordsPerMinute = 200) => {
  if (wordCount === 0) {
    return { minutes: 0, minMinutes: 0, maxMinutes: 0 };
  }

  // Calculate base reading time
  const baseMinutes = wordCount / wordsPerMinute;

  // Add variance (±20% for comprehension and reflection time)
  const minMinutes = Math.max(1, Math.floor(baseMinutes * 0.8));
  const maxMinutes = Math.ceil(baseMinutes * 1.2);
  const avgMinutes = Math.round(baseMinutes);

  return {
    minutes: avgMinutes,
    minMinutes,
    maxMinutes
  };
};

/**
 * Calculate average sentence length
 * @param {string} text - Plain text
 * @returns {number} Average words per sentence
 */
const calculateAverageSentenceLength = (text) => {
  if (!text) return 0;

  // Split by sentence-ending punctuation
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 0;

  const totalWords = countWords(text);
  return totalWords / sentences.length;
};

/**
 * Detect archaic language patterns
 * @param {string} text - Plain text
 * @returns {number} Archaic word count
 */
const detectArchaicLanguage = (text) => {
  if (!text) return 0;

  const archaicWords = [
    /\bthee\b/gi, /\bthou\b/gi, /\bthy\b/gi, /\bthine\b/gi,
    /\byea\b/gi, /\bnay\b/gi, /\bverily\b/gi, /\bbehold\b/gi,
    /\bwhence\b/gi, /\bwhither\b/gi, /\bwhoso\b/gi, /\bwherefore\b/gi,
    /\bherein\b/gi, /\btherein\b/gi, /\bhereby\b/gi, /\bthereby\b/gi,
    /\bhath\b/gi, /\bdoth\b/gi, /\bsaith\b/gi, /\bcometh\b/gi,
    /\bgoeth\b/gi, /\bshalt\b/gi, /\bwilt\b/gi, /\bart\b/gi
  ];

  let count = 0;
  archaicWords.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) count += matches.length;
  });

  return count;
};

/**
 * Calculate passage difficulty level
 * @param {string} text - Plain text
 * @param {number} wordCount - Word count
 * @returns {object} Difficulty assessment
 */
const calculateDifficulty = (text, wordCount) => {
  if (!text || wordCount === 0) {
    return {
      level: 'Unknown',
      score: 0,
      factors: []
    };
  }

  const factors = [];
  let score = 0;

  // Factor 1: Average sentence length
  const avgSentenceLength = calculateAverageSentenceLength(text);
  if (avgSentenceLength > 25) {
    score += 2;
    factors.push('Long sentences');
  } else if (avgSentenceLength > 18) {
    score += 1;
    factors.push('Moderate sentence length');
  }

  // Factor 2: Archaic language
  const archaicCount = detectArchaicLanguage(text);
  const archaicRatio = archaicCount / wordCount;
  if (archaicRatio > 0.05) {
    score += 2;
    factors.push('Archaic language');
  } else if (archaicRatio > 0.02) {
    score += 1;
    factors.push('Some archaic terms');
  }

  // Factor 3: Complex vocabulary (longer words)
  const words = text.split(/\s+/);
  const longWords = words.filter(word => word.length > 8).length;
  const longWordRatio = longWords / wordCount;
  if (longWordRatio > 0.15) {
    score += 2;
    factors.push('Complex vocabulary');
  } else if (longWordRatio > 0.10) {
    score += 1;
  }

  // Factor 4: Passage length
  if (wordCount > 1000) {
    score += 1;
    factors.push('Long passage');
  }

  // Determine difficulty level based on score
  let level;
  if (score <= 1) {
    level = 'Easy';
  } else if (score <= 3) {
    level = 'Moderate';
  } else if (score <= 5) {
    level = 'Challenging';
  } else {
    level = 'Difficult';
  }

  return {
    level,
    score,
    factors
  };
};

/**
 * Calculate comprehensive metrics for a passage
 * @param {string} htmlContent - HTML content from Bible API
 * @param {number} wordsPerMinute - User's reading speed (default: 200)
 * @returns {object} Complete passage metrics
 */
export const calculatePassageMetrics = (htmlContent, wordsPerMinute = 200) => {
  // Extract plain text
  const plainText = stripHTML(htmlContent);

  // Calculate word count
  const wordCount = countWords(plainText);

  // Calculate reading time
  const readingTime = calculateReadingTime(wordCount, wordsPerMinute);

  // Calculate difficulty
  const difficulty = calculateDifficulty(plainText, wordCount);

  return {
    wordCount,
    readingTime,
    difficulty,
    plainText: plainText.substring(0, 200) // First 200 chars for preview
  };
};

/**
 * Format reading time for display
 * @param {object} readingTime - Reading time object from calculateReadingTime
 * @returns {string} Formatted string like "~5-7 minutes" or "< 1 minute"
 */
export const formatReadingTime = (readingTime) => {
  if (!readingTime) return 'Unknown';

  const { minMinutes, maxMinutes } = readingTime;

  if (maxMinutes === 0) {
    return '< 1 minute';
  } else if (minMinutes === maxMinutes) {
    return `~${minMinutes} minute${minMinutes !== 1 ? 's' : ''}`;
  } else {
    return `~${minMinutes}-${maxMinutes} minutes`;
  }
};

/**
 * Get difficulty color for UI styling
 * @param {string} level - Difficulty level
 * @returns {string} Color name or hex code
 */
export const getDifficultyColor = (level) => {
  const colors = {
    'Easy': '#22c55e',        // green
    'Moderate': '#3b82f6',    // blue
    'Challenging': '#f59e0b', // orange
    'Difficult': '#ef4444',   // red
    'Unknown': '#6b7280'      // gray
  };

  return colors[level] || colors['Unknown'];
};

/**
 * Get difficulty icon for UI
 * @param {string} level - Difficulty level
 * @returns {string} Icon character or emoji
 */
export const getDifficultyIcon = (level) => {
  const icons = {
    'Easy': '📖',
    'Moderate': '📚',
    'Challenging': '🎓',
    'Difficult': '🔬',
    'Unknown': '❓'
  };

  return icons[level] || icons['Unknown'];
};

/**
 * Calculate metrics for a chapter reference
 * This is useful when you have book + chapter info but not the content yet
 * @param {string} bookId - Book ID (e.g., "GEN", "JHN")
 * @param {number} chapter - Chapter number
 * @returns {object} Estimated metrics based on typical chapter lengths
 */
export const estimateChapterMetrics = (bookId, chapter) => {
  // Typical chapter word counts (approximate averages)
  const typicalWordCounts = {
    // Old Testament
    'GEN': 600, 'EXO': 650, 'LEV': 550, 'NUM': 600, 'DEU': 700,
    'PSA': 150, 'PRO': 80, 'ISA': 550, 'JER': 700,
    // New Testament
    'MAT': 550, 'MRK': 450, 'LUK': 650, 'JHN': 500,
    'ACT': 650, 'ROM': 400, '1CO': 400, '2CO': 350,
    'GAL': 250, 'EPH': 300, 'PHP': 200, 'COL': 250,
    'JAS': 200, '1PE': 200, 'REV': 450
  };

  const estimatedWordCount = typicalWordCounts[bookId] || 500;
  const readingTime = calculateReadingTime(estimatedWordCount);

  return {
    wordCount: estimatedWordCount,
    readingTime,
    difficulty: {
      level: 'Moderate',
      score: 2,
      factors: ['Estimated']
    },
    isEstimate: true
  };
};

const passageMetricsService = {
  calculatePassageMetrics,
  formatReadingTime,
  getDifficultyColor,
  getDifficultyIcon,
  estimateChapterMetrics,
  stripHTML,
  countWords
};

export default passageMetricsService;
