import { checkContent } from '../utils/profanityFilter';

/**
 * Nickname Validation Service
 *
 * Validates nicknames according to safety and usability rules.
 */

export interface NicknameValidationResult {
  isValid: boolean;
  errors: string[];
}

const NICKNAME_RULES = {
  minLength: 3,
  maxLength: 20,
  // Allow letters, numbers, spaces, hyphens, underscores
  allowedPattern: /^[a-zA-Z0-9\s_-]+$/,
  // No consecutive special characters
  noConsecutiveSpecial: /[_-]{2,}/,
  // Must contain at least one letter
  mustContainLetter: /[a-zA-Z]/,
};

/**
 * Validate nickname length
 */
function validateLength(nickname: string): string | null {
  if (nickname.length < NICKNAME_RULES.minLength) {
    return `Nickname must be at least ${NICKNAME_RULES.minLength} characters long.`;
  }

  if (nickname.length > NICKNAME_RULES.maxLength) {
    return `Nickname must be no more than ${NICKNAME_RULES.maxLength} characters long.`;
  }

  return null;
}

/**
 * Validate nickname characters
 */
function validateCharacters(nickname: string): string | null {
  if (!NICKNAME_RULES.allowedPattern.test(nickname)) {
    return 'Nickname can only contain letters, numbers, spaces, hyphens, and underscores.';
  }

  return null;
}

/**
 * Validate nickname doesn't have consecutive special characters
 */
function validateNoConsecutiveSpecial(nickname: string): string | null {
  if (NICKNAME_RULES.noConsecutiveSpecial.test(nickname)) {
    return 'Nickname cannot contain consecutive special characters (-- or __).';
  }

  return null;
}

/**
 * Validate nickname contains at least one letter
 */
function validateContainsLetter(nickname: string): string | null {
  if (!NICKNAME_RULES.mustContainLetter.test(nickname)) {
    return 'Nickname must contain at least one letter.';
  }

  return null;
}

/**
 * Validate nickname doesn't start or end with special characters
 */
function validateNoLeadingTrailingSpecial(nickname: string): string | null {
  if (/^[_-]/.test(nickname) || /[_-]$/.test(nickname)) {
    return 'Nickname cannot start or end with special characters.';
  }

  return null;
}

/**
 * Validate nickname doesn't contain only whitespace
 */
function validateNotOnlyWhitespace(nickname: string): string | null {
  if (nickname.trim().length === 0) {
    return 'Nickname cannot be empty or contain only spaces.';
  }

  return null;
}

/**
 * Main nickname validation function
 *
 * Performs comprehensive validation including:
 * - Length requirements
 * - Character restrictions
 * - Pattern validation
 * - Content safety (profanity, personal info)
 */
export function validateNickname(nickname: string): NicknameValidationResult {
  const errors: string[] = [];

  // Basic validation
  if (!nickname) {
    return {
      isValid: false,
      errors: ['Nickname is required.'],
    };
  }

  // Trim whitespace for validation
  const trimmedNickname = nickname.trim();

  // Check for only whitespace
  const whitespaceError = validateNotOnlyWhitespace(trimmedNickname);
  if (whitespaceError) {
    errors.push(whitespaceError);
    return { isValid: false, errors };
  }

  // Length validation
  const lengthError = validateLength(trimmedNickname);
  if (lengthError) {
    errors.push(lengthError);
  }

  // Character validation
  const characterError = validateCharacters(trimmedNickname);
  if (characterError) {
    errors.push(characterError);
  }

  // Consecutive special characters
  const consecutiveError = validateNoConsecutiveSpecial(trimmedNickname);
  if (consecutiveError) {
    errors.push(consecutiveError);
  }

  // Must contain letter
  const letterError = validateContainsLetter(trimmedNickname);
  if (letterError) {
    errors.push(letterError);
  }

  // Leading/trailing special characters
  const leadingTrailingError = validateNoLeadingTrailingSpecial(trimmedNickname);
  if (leadingTrailingError) {
    errors.push(leadingTrailingError);
  }

  // Content safety check (profanity, personal info)
  const contentCheck = checkContent(trimmedNickname);
  if (!contentCheck.isValid && contentCheck.reason) {
    errors.push(contentCheck.reason);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Quick validation check (returns boolean)
 */
export function isValidNickname(nickname: string): boolean {
  return validateNickname(nickname).isValid;
}

/**
 * Get validation errors as a single string
 */
export function getValidationErrorMessage(nickname: string): string {
  const result = validateNickname(nickname);
  return result.errors.join(' ');
}

/**
 * Sanitize nickname (trim and normalize)
 */
export function sanitizeNickname(nickname: string): string {
  return nickname
    .trim()
    // Collapse multiple spaces into one
    .replace(/\s+/g, ' ')
    // Remove leading/trailing special characters
    .replace(/^[_-]+|[_-]+$/g, '');
}
