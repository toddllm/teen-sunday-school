import axios from 'axios';
import { getCrossReferencesForVerse, getCrossReferencesGrouped } from '../data/crossReferences';

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
 * Get a full chapter
 * @param {string} book - Book code (e.g., "JHN", "GEN")
 * @param {number} chapter - Chapter number
 * @param {string} bibleId - Bible version ID
 */
export const getChapter = async (book, chapter, bibleId = DEFAULT_BIBLE_ID) => {
  try {
    const chapterId = `${book}.${chapter}`;
    const response = await bibleAPI.get(`/bibles/${bibleId}/chapters/${chapterId}`, {
      params: {
        'content-type': 'html',
        'include-notes': false,
        'include-titles': true,
        'include-chapter-numbers': false,
        'include-verse-numbers': true,
        'include-verse-spans': true
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return null;
  }
};

/**
 * Get multiple translations of the same passage in parallel
 * @param {string} passageId - e.g., "JHN.3.16"
 * @param {string[]} bibleIds - Array of Bible version IDs
 */
export const getParallelPassages = async (passageId, bibleIds) => {
  try {
    const promises = bibleIds.map(bibleId => getPassage(passageId, bibleId));
    const results = await Promise.all(promises);

    return bibleIds.map((bibleId, index) => ({
      bibleId,
      data: results[index]
    }));
  } catch (error) {
    console.error('Error fetching parallel passages:', error);
    return [];
  }
};

/**
 * Get multiple translations of the same chapter in parallel
 * @param {string} book - Book code (e.g., "JHN", "GEN")
 * @param {number} chapter - Chapter number
 * @param {string[]} bibleIds - Array of Bible version IDs
 */
export const getParallelChapters = async (book, chapter, bibleIds) => {
  try {
    const promises = bibleIds.map(bibleId => getChapter(book, chapter, bibleId));
    const results = await Promise.all(promises);

    return bibleIds.map((bibleId, index) => ({
      bibleId,
      data: results[index]
    }));
  } catch (error) {
    console.error('Error fetching parallel chapters:', error);
    return [];
  }
};

/**
 * Get list of available Bibles
 */
export const getAvailableBibles = async () => {
  try {
    const response = await bibleAPI.get('/bibles', {
      params: {
        language: 'eng'
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching available Bibles:', error);
    return [];
  }
};

/**
 * Get books of a specific Bible
 * @param {string} bibleId - Bible version ID
 */
export const getBooks = async (bibleId = DEFAULT_BIBLE_ID) => {
  try {
    const response = await bibleAPI.get(`/bibles/${bibleId}/books`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
};

/**
 * Get chapters of a specific book
 * @param {string} bibleId - Bible version ID
 * @param {string} bookId - Book ID (e.g., "GEN", "JHN")
 */
export const getChapters = async (bibleId, bookId) => {
  try {
    const response = await bibleAPI.get(`/bibles/${bibleId}/books/${bookId}/chapters`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return [];
  }
};

/**
 * Convert a verse reference string to verse ID format
 * @param {string} reference - e.g., "John 3:16"
 * @returns {string|null} Verse ID like "JHN.3.16" or null if parsing fails
 */
export const referenceToVerseId = (reference) => {
  const bookMap = {
    'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM',
    'Deuteronomy': 'DEU', 'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT',
    '1 Samuel': '1SA', '2 Samuel': '2SA', '1 Kings': '1KI', '2 Kings': '2KI',
    'Isaiah': 'ISA', 'Jeremiah': 'JER', 'Ezekiel': 'EZK', 'Daniel': 'DAN',
    'Hosea': 'HOS', 'Joel': 'JOL', 'Amos': 'AMO', 'Obadiah': 'OBA',
    'Jonah': 'JON', 'Micah': 'MIC', 'Nahum': 'NAM', 'Habakkuk': 'HAB',
    'Zephaniah': 'ZEP', 'Haggai': 'HAG', 'Zechariah': 'ZEC', 'Malachi': 'MAL',
    'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN',
    'Acts': 'ACT', 'Romans': 'ROM', '1 Corinthians': '1CO', '2 Corinthians': '2CO',
    'Galatians': 'GAL', 'Ephesians': 'EPH', 'Philippians': 'PHP', 'Colossians': 'COL',
    '1 Thessalonians': '1TH', '2 Thessalonians': '2TH', 'Timothy': '1TI', '2 Timothy': '2TI',
    'Titus': 'TIT', 'Philemon': 'PHM', 'Hebrews': 'HEB', 'James': 'JAS',
    '1 Peter': '1PE', '2 Peter': '2PE', '1 John': '1JN', '2 John': '2JN', '3 John': '3JN',
    'Jude': 'JUD', 'Revelation': 'REV', 'Psalms': 'PSA', 'Psalm': 'PSA', 'Proverbs': 'PRO',
    'Job': 'JOB', 'Song of Solomon': 'SNG', 'Ecclesiastes': 'ECC', 'Lamentations': 'LAM'
  };

  // Try each book name
  for (const [book, code] of Object.entries(bookMap)) {
    if (reference.startsWith(book)) {
      const rest = reference.substring(book.length).trim();
      const parts = rest.split(':');
      if (parts.length >= 1) {
        const chapter = parts[0];
        const verse = parts[1] ? parts[1].split('-')[0] : '1'; // Handle ranges like "8-9"
        return `${code}.${chapter}${verse ? '.' + verse : ''}`;
      }
    }
  }
  return null;
};

/**
 * Convert verse ID format to human-readable reference
 * @param {string} verseId - e.g., "JHN.3.16" or "ROM.8.28"
 * @returns {string} Human-readable reference like "John 3:16"
 */
export const verseIdToReference = (verseId) => {
  const bookCodeMap = {
    'GEN': 'Genesis', 'EXO': 'Exodus', 'LEV': 'Leviticus', 'NUM': 'Numbers',
    'DEU': 'Deuteronomy', 'JOS': 'Joshua', 'JDG': 'Judges', 'RUT': 'Ruth',
    '1SA': '1 Samuel', '2SA': '2 Samuel', '1KI': '1 Kings', '2KI': '2 Kings',
    'ISA': 'Isaiah', 'JER': 'Jeremiah', 'EZK': 'Ezekiel', 'DAN': 'Daniel',
    'HOS': 'Hosea', 'JOL': 'Joel', 'AMO': 'Amos', 'OBA': 'Obadiah',
    'JON': 'Jonah', 'MIC': 'Micah', 'NAM': 'Nahum', 'HAB': 'Habakkuk',
    'ZEP': 'Zephaniah', 'HAG': 'Haggai', 'ZEC': 'Zechariah', 'MAL': 'Malachi',
    'MAT': 'Matthew', 'MRK': 'Mark', 'LUK': 'Luke', 'JHN': 'John',
    'ACT': 'Acts', 'ROM': 'Romans', '1CO': '1 Corinthians', '2CO': '2 Corinthians',
    'GAL': 'Galatians', 'EPH': 'Ephesians', 'PHP': 'Philippians', 'COL': 'Colossians',
    '1TH': '1 Thessalonians', '2TH': '2 Thessalonians', '1TI': '1 Timothy', '2TI': '2 Timothy',
    'TIT': 'Titus', 'PHM': 'Philemon', 'HEB': 'Hebrews', 'JAS': 'James',
    '1PE': '1 Peter', '2PE': '2 Peter', '1JN': '1 John', '2JN': '2 John', '3JN': '3 John',
    'JUD': 'Jude', 'REV': 'Revelation', 'PSA': 'Psalm', 'PRO': 'Proverbs',
    'JOB': 'Job', 'SNG': 'Song of Solomon', 'ECC': 'Ecclesiastes', 'LAM': 'Lamentations'
  };

  const parts = verseId.split('.');
  if (parts.length >= 2) {
    const book = bookCodeMap[parts[0]] || parts[0];
    const chapter = parts[1];
    const verse = parts[2];

    if (verse) {
      // Handle verse ranges like "8-9"
      return `${book} ${chapter}:${verse}`;
    } else {
      // Just a chapter reference
      return `${book} ${chapter}`;
    }
  }
  return verseId;
};

/**
 * Get cross-references for a specific verse
 * @param {string} verseId - Verse ID in format like 'JHN.3.16'
 * @param {boolean} grouped - Whether to group by type
 * @returns {Array|Object} Array of cross-references or grouped object
 */
export const getCrossReferences = (verseId, grouped = false) => {
  if (grouped) {
    return getCrossReferencesGrouped(verseId);
  }
  return getCrossReferencesForVerse(verseId);
};

/**
 * Fetch cross-reference verses with their full text
 * @param {string} verseId - Source verse ID
 * @param {string} bibleId - Bible version ID
 * @returns {Promise<Array>} Array of cross-references with fetched text
 */
export const fetchCrossReferencesWithText = async (verseId, bibleId = DEFAULT_BIBLE_ID) => {
  try {
    const crossRefs = getCrossReferencesForVerse(verseId);

    if (!crossRefs || crossRefs.length === 0) {
      return [];
    }

    // Fetch all cross-reference verses in parallel
    const promises = crossRefs.map(async (ref) => {
      try {
        const passage = await getPassage(ref.target, bibleId);
        return {
          ...ref,
          reference: verseIdToReference(ref.target),
          verseId: ref.target,
          text: passage ? passage.content : 'Unable to load verse text',
          loaded: !!passage
        };
      } catch (error) {
        console.error(`Error fetching cross-reference ${ref.target}:`, error);
        return {
          ...ref,
          reference: verseIdToReference(ref.target),
          verseId: ref.target,
          text: 'Unable to load verse text',
          loaded: false
        };
      }
    });

    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Error fetching cross-references:', error);
    return [];
  }
};

/**
 * Get cross-references grouped by type with verse text
 * @param {string} verseId - Source verse ID
 * @param {string} bibleId - Bible version ID
 * @returns {Promise<Object>} Object with cross-references grouped by type
 */
export const fetchCrossReferencesGrouped = async (verseId, bibleId = DEFAULT_BIBLE_ID) => {
  try {
    const allRefs = await fetchCrossReferencesWithText(verseId, bibleId);

    const grouped = {
      quotation: [],
      parallel: [],
      theme: [],
      allusion: [],
      prophecy: []
    };

    allRefs.forEach(ref => {
      if (grouped[ref.type]) {
        grouped[ref.type].push(ref);
      }
    });

    return grouped;
  } catch (error) {
    console.error('Error fetching grouped cross-references:', error);
    return {
      quotation: [],
      parallel: [],
      theme: [],
      allusion: [],
      prophecy: []
    };
  }
};

const bibleAPIService = {
  searchPassage,
  getPassage,
  parseReference,
  getVerseText,
  getChapter,
  getParallelPassages,
  getParallelChapters,
  getAvailableBibles,
  getBooks,
  getChapters,
  referenceToVerseId,
  verseIdToReference,
  getCrossReferences,
  fetchCrossReferencesWithText,
  fetchCrossReferencesGrouped
};

export default bibleAPIService;
