/**
 * Read-Aloud Service
 * Provides utility functions for text-to-speech processing
 */

/**
 * Format Bible verse content for speech
 * Removes HTML, verse numbers, and formats for natural speech
 */
export const formatBibleVerseForSpeech = (verseContent) => {
  if (!verseContent) return '';

  // Remove HTML tags
  let formatted = verseContent.replace(/<[^>]*>/g, '');

  // Remove verse numbers in various formats: [1], (1), 1:1, etc.
  formatted = formatted.replace(/\[\d+\]/g, '');
  formatted = formatted.replace(/\(\d+\)/g, '');
  formatted = formatted.replace(/\d+:\d+/g, '');

  // Remove extra whitespace
  formatted = formatted.replace(/\s+/g, ' ').trim();

  return formatted;
};

/**
 * Format Bible reference for speech
 * Converts "Genesis 1:1" to "Genesis chapter 1 verse 1"
 */
export const formatReferenceForSpeech = (reference) => {
  if (!reference) return '';

  // Handle chapter:verse format
  const match = reference.match(/^(.*?)\s*(\d+):(\d+)(?:-(\d+))?$/);
  if (match) {
    const [, book, chapter, startVerse, endVerse] = match;
    if (endVerse) {
      return `${book} chapter ${chapter} verses ${startVerse} through ${endVerse}`;
    }
    return `${book} chapter ${chapter} verse ${startVerse}`;
  }

  // Handle chapter only format
  const chapterMatch = reference.match(/^(.*?)\s*(\d+)$/);
  if (chapterMatch) {
    const [, book, chapter] = chapterMatch;
    return `${book} chapter ${chapter}`;
  }

  return reference;
};

/**
 * Create a complete Bible passage speech text with reference
 */
export const createBiblePassageSpeech = (reference, content, options = {}) => {
  const { includeReference = true, includeIntro = false } = options;

  let speechText = '';

  if (includeIntro) {
    speechText += 'Reading from ';
  }

  if (includeReference) {
    speechText += formatReferenceForSpeech(reference) + '. ';
  }

  speechText += formatBibleVerseForSpeech(content);

  return speechText;
};

/**
 * Split long text into chunks for better speech synthesis
 * Some browsers have limits on utterance length
 */
export const splitTextIntoChunks = (text, maxLength = 500) => {
  if (!text || text.length <= maxLength) {
    return [text];
  }

  const chunks = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length <= maxLength) {
      currentChunk += sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

/**
 * Get available English voices
 */
export const getEnglishVoices = (voices) => {
  return voices.filter(voice => voice.lang.startsWith('en'));
};

/**
 * Get preferred voice based on quality indicators
 * Prefers local voices and those with "premium" or "enhanced" in name
 */
export const getPreferredVoice = (voices) => {
  const englishVoices = getEnglishVoices(voices);

  // Prefer local voices
  const localVoices = englishVoices.filter(v => v.localService);
  if (localVoices.length > 0) {
    // Look for premium/enhanced voices
    const premiumVoice = localVoices.find(v =>
      v.name.toLowerCase().includes('premium') ||
      v.name.toLowerCase().includes('enhanced') ||
      v.name.toLowerCase().includes('natural')
    );
    if (premiumVoice) return premiumVoice;

    return localVoices[0];
  }

  // Fallback to first English voice
  return englishVoices[0] || voices[0];
};

/**
 * Format slide content for speech
 * Handles lesson slide sayText field
 */
export const formatSlideForSpeech = (slide) => {
  if (!slide) return '';

  // Use sayText if available, otherwise fall back to content
  const text = slide.sayText || slide.content || '';

  // Remove HTML tags
  let formatted = text.replace(/<[^>]*>/g, '');

  // Remove extra whitespace
  formatted = formatted.replace(/\s+/g, ' ').trim();

  return formatted;
};

/**
 * Calculate estimated speaking time in seconds
 * Average speech rate is ~150 words per minute
 */
export const estimateSpeakingTime = (text, rate = 0.9) => {
  if (!text) return 0;

  const words = text.trim().split(/\s+/).length;
  const baseWordsPerMinute = 150;
  const adjustedWordsPerMinute = baseWordsPerMinute * rate;
  const minutes = words / adjustedWordsPerMinute;

  return Math.ceil(minutes * 60); // Return seconds
};

/**
 * Format time in seconds to MM:SS format
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Clean special characters that might cause speech issues
 */
export const cleanSpecialCharacters = (text) => {
  if (!text) return '';

  let cleaned = text;

  // Convert em dashes to commas
  cleaned = cleaned.replace(/—/g, ', ');

  // Convert ellipsis to pause
  cleaned = cleaned.replace(/\.\.\./g, '. ');

  // Remove excessive punctuation
  cleaned = cleaned.replace(/[!?]{2,}/g, '!');

  // Normalize quotes
  cleaned = cleaned.replace(/[""]/g, '"');
  cleaned = cleaned.replace(/['']/g, "'");

  return cleaned;
};

const readAloudService = {
  formatBibleVerseForSpeech,
  formatReferenceForSpeech,
  createBiblePassageSpeech,
  splitTextIntoChunks,
  getEnglishVoices,
  getPreferredVoice,
  formatSlideForSpeech,
  estimateSpeakingTime,
  formatTime,
  cleanSpecialCharacters,
};

export default readAloudService;
