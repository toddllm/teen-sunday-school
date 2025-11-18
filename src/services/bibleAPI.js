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

export default {
  searchPassage,
  getPassage,
  parseReference,
  getVerseText
};
