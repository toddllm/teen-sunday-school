/**
 * Generate a short, memorable join code for sessions
 * Format: 6 characters, uppercase letters and numbers (excluding ambiguous chars)
 */
export function generateJoinCode(): string {
  // Exclude ambiguous characters: 0, O, I, 1, L
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  let code = '';

  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
}

/**
 * Validate join code format
 */
export function isValidJoinCodeFormat(code: string): boolean {
  if (!code || code.length !== 6) {
    return false;
  }

  // Check if code contains only valid characters
  const validChars = /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/;
  return validChars.test(code);
}
