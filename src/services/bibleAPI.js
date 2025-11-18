import axios from 'axios';

// Using the free Bible API (api.scripture.api.bible)
// You can get a free API key at https://scripture.api.bible/

const BIBLE_API_KEY = process.env.REACT_APP_BIBLE_API_KEY || 'demo-key';
const BIBLE_API_BASE = 'https://api.scripture.api.bible/v1';

// Default Bible version (NIV)
const DEFAULT_BIBLE_ID = 'de4e12af7f28f599-02';

const bibleAPI = axios.create({
  baseURL: BIBLE_API_BASE,
  headers: {
    'api-key': BIBLE_API_KEY
  }
});

/**
 * Search for a Bible passage
 * @param {string} query - e.g., "John 3:16" or "Psalm 23"
 * @param {string} bibleId - Optional Bible version ID
 */
export const searchPassage = async (query, bibleId = DEFAULT_BIBLE_ID) => {
  try {
    const response = await bibleAPI.get(`/bibles/${bibleId}/search`, {
      params: { query, limit: 10 }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching Bible:', error);
    return null;
  }
};

/**
 * Get a specific passage
 * @param {string} passageId - e.g., "JHN.3.16"
 * @param {string} bibleId - Optional Bible version ID
 */
export const getPassage = async (passageId, bibleId = DEFAULT_BIBLE_ID) => {
  try {
    const response = await bibleAPI.get(`/bibles/${bibleId}/passages/${passageId}`, {
      params: {
        'content-type': 'text',
        'include-notes': false,
        'include-titles': true,
        'include-chapter-numbers': false,
        'include-verse-numbers': true
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching passage:', error);
    return null;
  }
};

/**
 * Parse a reference string to passage ID
 * @param {string} reference - e.g., "John 3:16-17"
 */
export const parseReference = (reference) => {
  // This is a simplified parser
  // In production, you'd want a more robust solution
  const bookMap = {
    'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM',
    'Deuteronomy': 'DEU', 'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT',
    '1 Samuel': '1SA', '2 Samuel': '2SA', '1 Kings': '1KI', '2 Kings': '2KI',
    'Isaiah': 'ISA', 'Jeremiah': 'JER', 'Ezekiel': 'EZK', 'Daniel': 'DAN',
    'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN',
    'Acts': 'ACT', 'Romans': 'ROM', '1 Corinthians': '1CO', '2 Corinthians': '2CO',
    'Galatians': 'GAL', 'Ephesians': 'EPH', 'Philippians': 'PHP', 'Colossians': 'COL',
    '1 Thessalonians': '1TH', '2 Thessalonians': '2TH', 'James': 'JAS',
    '1 Peter': '1PE', '2 Peter': '2PE', '1 John': '1JN', 'Revelation': 'REV',
    'Psalms': 'PSA', 'Psalm': 'PSA', 'Proverbs': 'PRO'
  };

  // Find book name in reference
  for (const [book, code] of Object.entries(bookMap)) {
    if (reference.startsWith(book)) {
      const rest = reference.substring(book.length).trim();
      const [chapter, verse] = rest.split(':');
      if (chapter && verse) {
        return `${code}.${chapter}.${verse}`;
      }
    }
  }
  return null;
};

/**
 * Get verse text from a reference
 * @param {string} reference - e.g., "John 3:16"
 */
export const getVerseText = async (reference) => {
  try {
    // Try to search for the passage
    const searchResults = await searchPassage(reference);
    if (searchResults && searchResults.data && searchResults.data.passages && searchResults.data.passages.length > 0) {
      return {
        text: searchResults.data.passages[0].content,
        reference: searchResults.data.passages[0].reference
      };
    }

    // Fallback to static verses for common references
    return getStaticVerse(reference);
  } catch (error) {
    console.error('Error getting verse:', error);
    return getStaticVerse(reference);
  }
};

/**
 * Fallback static verses (for offline use or API failures)
 */
const staticVerses = {
  "Isaiah 43:2a": {
    text: "When you pass through the waters, I will be with you; and when you pass through the rivers, they will not sweep over you.",
    reference: "Isaiah 43:2a"
  },
  "Isaiah 43:1-7": {
    text: "But now, this is what the Lord says—he who created you, Jacob, he who formed you, Israel: \"Do not fear, for I have redeemed you; I have summoned you by name; you are mine. When you pass through the waters, I will be with you; and when you pass through the rivers, they will not sweep over you. When you walk through the fire, you will not be burned; the flames will not set you ablaze. For I am the Lord your God, the Holy One of Israel, your Savior...\"",
    reference: "Isaiah 43:1-7"
  },
  "John 3:16": {
    text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    reference: "John 3:16"
  },
  "Psalm 23:1": {
    text: "The Lord is my shepherd, I lack nothing.",
    reference: "Psalm 23:1"
  }
};

const getStaticVerse = (reference) => {
  return staticVerses[reference] || {
    text: `Verse text for ${reference} (API key needed for full functionality)`,
    reference
  };
};

/**
 * Audio Bible Support
 * In production, this would integrate with an audio Bible API like:
 * - Faith Comes By Hearing (bible.is API)
 * - Audio Bible from api.scripture.api.bible
 * - Or other audio Bible providers
 */

// Book code mapping for audio
const AUDIO_BOOK_CODES = {
  'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM',
  'Deuteronomy': 'DEU', 'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT',
  '1 Samuel': '1SA', '2 Samuel': '2SA', '1 Kings': '1KI', '2 Kings': '2KI',
  '1 Chronicles': '1CH', '2 Chronicles': '2CH', 'Ezra': 'EZR', 'Nehemiah': 'NEH',
  'Esther': 'EST', 'Job': 'JOB', 'Psalms': 'PSA', 'Psalm': 'PSA',
  'Proverbs': 'PRO', 'Ecclesiastes': 'ECC', 'Song of Solomon': 'SNG',
  'Isaiah': 'ISA', 'Jeremiah': 'JER', 'Lamentations': 'LAM', 'Ezekiel': 'EZK',
  'Daniel': 'DAN', 'Hosea': 'HOS', 'Joel': 'JOL', 'Amos': 'AMO',
  'Obadiah': 'OBA', 'Jonah': 'JON', 'Micah': 'MIC', 'Nahum': 'NAM',
  'Habakkuk': 'HAB', 'Zephaniah': 'ZEP', 'Haggai': 'HAG', 'Zechariah': 'ZEC',
  'Malachi': 'MAL', 'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK',
  'John': 'JHN', 'Acts': 'ACT', 'Romans': 'ROM',
  '1 Corinthians': '1CO', '2 Corinthians': '2CO', 'Galatians': 'GAL',
  'Ephesians': 'EPH', 'Philippians': 'PHP', 'Colossians': 'COL',
  '1 Thessalonians': '1TH', '2 Thessalonians': '2TH', '1 Timothy': '1TI',
  '2 Timothy': '2TI', 'Titus': 'TIT', 'Philemon': 'PHM', 'Hebrews': 'HEB',
  'James': 'JAS', '1 Peter': '1PE', '2 Peter': '2PE', '1 John': '1JN',
  '2 John': '2JN', '3 John': '3JN', 'Jude': 'JUD', 'Revelation': 'REV'
};

// Sample audio tracks for demonstration
// In production, replace this with actual API calls to an audio Bible service
const SAMPLE_AUDIO_TRACKS = {
  'John_3': {
    book: 'John',
    chapter: 3,
    translation: 'NIV',
    audioUrl: 'https://www.bible.com/audio-bible/111/JHN.3.NIV',
    duration: 420, // 7 minutes in seconds
    title: 'John Chapter 3'
  },
  'Psalm_23': {
    book: 'Psalm',
    chapter: 23,
    translation: 'NIV',
    audioUrl: 'https://www.bible.com/audio-bible/111/PSA.23.NIV',
    duration: 180, // 3 minutes in seconds
    title: 'Psalm 23'
  },
  'Matthew_5': {
    book: 'Matthew',
    chapter: 5,
    translation: 'NIV',
    audioUrl: 'https://www.bible.com/audio-bible/111/MAT.5.NIV',
    duration: 540, // 9 minutes in seconds
    title: 'Matthew Chapter 5 - The Sermon on the Mount'
  },
  'Genesis_1': {
    book: 'Genesis',
    chapter: 1,
    translation: 'NIV',
    audioUrl: 'https://www.bible.com/audio-bible/111/GEN.1.NIV',
    duration: 480, // 8 minutes in seconds
    title: 'Genesis Chapter 1 - Creation'
  },
  'Romans_8': {
    book: 'Romans',
    chapter: 8,
    translation: 'NIV',
    audioUrl: 'https://www.bible.com/audio-bible/111/ROM.8.NIV',
    duration: 600, // 10 minutes in seconds
    title: 'Romans Chapter 8'
  },
  'Proverbs_3': {
    book: 'Proverbs',
    chapter: 3,
    translation: 'NIV',
    audioUrl: 'https://www.bible.com/audio-bible/111/PRO.3.NIV',
    duration: 420, // 7 minutes in seconds
    title: 'Proverbs Chapter 3'
  }
};

/**
 * Get audio track for a specific book and chapter
 * @param {string} book - Book name (e.g., "John", "Psalm")
 * @param {number|string} chapter - Chapter number
 * @param {string} translation - Bible translation (default: NIV)
 * @returns {Promise<Object|null>} Audio track object or null
 */
export const getAudioTrack = async (book, chapter, translation = 'NIV') => {
  try {
    // In production, this would call an audio Bible API
    // For now, return sample data if available
    const trackKey = `${book}_${chapter}`;
    const sampleTrack = SAMPLE_AUDIO_TRACKS[trackKey];

    if (sampleTrack) {
      return {
        id: `${translation}_${book}_${chapter}`,
        ...sampleTrack,
        translation
      };
    }

    // Return a placeholder track for demonstration
    // In production, this would fetch from a real API
    const bookCode = AUDIO_BOOK_CODES[book] || book.substring(0, 3).toUpperCase();
    return {
      id: `${translation}_${book}_${chapter}`,
      book,
      chapter: parseInt(chapter),
      translation,
      audioUrl: `https://www.bible.com/audio-bible/111/${bookCode}.${chapter}.${translation}`,
      duration: 300, // Default 5 minutes
      title: `${book} Chapter ${chapter}`,
      // Note: This is a placeholder URL. In production, use a real audio Bible API
      isPlaceholder: true
    };
  } catch (error) {
    console.error('Error fetching audio track:', error);
    return null;
  }
};

/**
 * Search for audio tracks by book name
 * @param {string} bookName - Book name to search for
 * @returns {Promise<Array>} Array of available chapters with audio
 */
export const searchAudioByBook = async (bookName) => {
  try {
    // In production, this would query an audio Bible API
    // For now, return available sample tracks for the book
    const availableTracks = Object.values(SAMPLE_AUDIO_TRACKS)
      .filter(track => track.book.toLowerCase() === bookName.toLowerCase())
      .map(track => ({
        ...track,
        id: `${track.translation}_${track.book}_${track.chapter}`
      }));

    return availableTracks;
  } catch (error) {
    console.error('Error searching audio tracks:', error);
    return [];
  }
};

/**
 * Get all available audio books
 * @returns {Array} Array of books with audio available
 */
export const getAvailableAudioBooks = () => {
  // In production, this would fetch from an audio Bible API
  const books = [...new Set(Object.values(SAMPLE_AUDIO_TRACKS).map(t => t.book))];
  return books.map(book => ({
    name: book,
    code: AUDIO_BOOK_CODES[book] || book.substring(0, 3).toUpperCase(),
    hasAudio: true
  }));
};

/**
 * Parse reference and get audio track
 * @param {string} reference - e.g., "John 3" or "Psalm 23"
 * @returns {Promise<Object|null>} Audio track or null
 */
export const getAudioByReference = async (reference) => {
  try {
    // Parse the reference
    const parts = reference.trim().split(/\s+/);
    let book = '';
    let chapter = '';

    // Handle multi-word book names (e.g., "1 John", "Song of Solomon")
    if (parts[0].match(/^\d/)) {
      // Books starting with a number (e.g., "1 John", "2 Corinthians")
      book = `${parts[0]} ${parts[1]}`;
      chapter = parts[2];
    } else if (parts.length > 2 && ['of', 'Song'].includes(parts[1])) {
      // Handle "Song of Solomon"
      book = parts.slice(0, -1).join(' ');
      chapter = parts[parts.length - 1];
    } else {
      // Single word book name
      book = parts[0];
      chapter = parts[1];
    }

    // Remove any punctuation from chapter
    chapter = chapter?.replace(/[^\d]/g, '');

    if (!book || !chapter) {
      console.error('Invalid reference format:', reference);
      return null;
    }

    return await getAudioTrack(book, chapter);
  } catch (error) {
    console.error('Error parsing audio reference:', error);
    return null;
  }
};

/**
 * Check if audio is available for a specific passage
 * @param {string} book - Book name
 * @param {number|string} chapter - Chapter number
 * @returns {boolean} True if audio is available
 */
export const hasAudioAvailable = (book, chapter) => {
  const trackKey = `${book}_${chapter}`;
  return trackKey in SAMPLE_AUDIO_TRACKS;
};

const bibleAPIService = {
  searchPassage,
  getPassage,
  parseReference,
  getVerseText,
  // Audio Bible functions
  getAudioTrack,
  searchAudioByBook,
  getAvailableAudioBooks,
  getAudioByReference,
  hasAudioAvailable
};

export default bibleAPIService;
