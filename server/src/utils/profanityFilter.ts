/**
 * Profanity Filter Utility
 *
 * Basic profanity detection for nickname validation.
 * This is a simple word-list based approach suitable for a teen-focused app.
 * For production, consider using a more sophisticated service like:
 * - PurgoMalum API
 * - CleanSpeak
 * - WebPurify
 */

// Basic list of blocked words (kept minimal for example)
// In production, expand this list or use an external service
const BLOCKED_WORDS = [
  'damn',
  'hell',
  'crap',
  'stupid',
  'idiot',
  'dumb',
  'hate',
  // Add more as needed
];

// Patterns that might indicate inappropriate content
const BLOCKED_PATTERNS = [
  /(.)\1{4,}/, // Repeated characters (e.g., "aaaaaaa")
  /\d{10,}/,   // Long numbers (phone numbers, etc.)
  /(.{2,})\1{3,}/, // Repeated patterns (e.g., "hahaha")
];

/**
 * Normalize text for comparison
 * - Lowercase
 * - Remove special characters
 * - Replace common character substitutions (l33t speak)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special chars
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if text contains blocked words
 */
function containsBlockedWord(text: string): boolean {
  const normalized = normalizeText(text);

  return BLOCKED_WORDS.some(word => {
    // Check for exact word match with word boundaries
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(normalized);
  });
}

/**
 * Check if text matches blocked patterns
 */
function matchesBlockedPattern(text: string): boolean {
  return BLOCKED_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Main profanity check function
 * Returns true if profanity is detected
 */
export function containsProfanity(text: string): boolean {
  if (!text || text.trim().length === 0) {
    return false;
  }

  // Check blocked words
  if (containsBlockedWord(text)) {
    return true;
  }

  // Check blocked patterns
  if (matchesBlockedPattern(text)) {
    return true;
  }

  return false;
}

/**
 * Get a user-friendly message explaining why content was blocked
 */
export function getProfanityMessage(text: string): string {
  if (containsBlockedWord(text)) {
    return 'Your nickname contains inappropriate language. Please choose a different one.';
  }

  if (matchesBlockedPattern(text)) {
    return 'Your nickname contains an invalid pattern. Please use a simpler nickname.';
  }

  return 'Your nickname may contain inappropriate content. Please choose a different one.';
}

/**
 * Check if text looks like personal information
 */
export function containsPersonalInfo(text: string): boolean {
  // Check for email-like patterns
  if (/@/.test(text)) {
    return true;
  }

  // Check for URL-like patterns
  if (/(https?:\/\/|www\.|\.com|\.org|\.net)/i.test(text)) {
    return true;
  }

  // Check for phone number patterns
  if (/(\d{3}[-.]?\d{3}[-.]?\d{4}|\(\d{3}\)\s*\d{3}[-.]?\d{4})/.test(text)) {
    return true;
  }

  return false;
}

/**
 * Comprehensive content check
 * Returns an object with validation results
 */
export interface ContentCheckResult {
  isValid: boolean;
  reason?: string;
}

export function checkContent(text: string): ContentCheckResult {
  if (containsProfanity(text)) {
    return {
      isValid: false,
      reason: getProfanityMessage(text),
    };
  }

  if (containsPersonalInfo(text)) {
    return {
      isValid: false,
      reason: 'Your nickname should not contain personal information like emails, URLs, or phone numbers.',
    };
  }

  return {
    isValid: true,
  };
}
