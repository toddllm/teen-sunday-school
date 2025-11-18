// searchService.js - Comprehensive search across Bible, lessons, and notes

const BIBLE_BOOKS = {
  // Old Testament
  'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM', 'Deuteronomy': 'DEU',
  'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT', '1 Samuel': '1SA', '2 Samuel': '2SA',
  '1 Kings': '1KI', '2 Kings': '2KI', '1 Chronicles': '1CH', '2 Chronicles': '2CH',
  'Ezra': 'EZR', 'Nehemiah': 'NEH', 'Esther': 'EST', 'Job': 'JOB', 'Psalms': 'PSA',
  'Proverbs': 'PRO', 'Ecclesiastes': 'ECC', 'Song of Solomon': 'SNG',
  'Isaiah': 'ISA', 'Jeremiah': 'JER', 'Lamentations': 'LAM', 'Ezekiel': 'EZK', 'Daniel': 'DAN',
  'Hosea': 'HOS', 'Joel': 'JOL', 'Amos': 'AMO', 'Obadiah': 'OBA', 'Jonah': 'JON',
  'Micah': 'MIC', 'Nahum': 'NAM', 'Habakkuk': 'HAB', 'Zephaniah': 'ZEP', 'Haggai': 'HAG',
  'Zechariah': 'ZEC', 'Malachi': 'MAL',
  // New Testament
  'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN', 'Acts': 'ACT',
  'Romans': 'ROM', '1 Corinthians': '1CO', '2 Corinthians': '2CO', 'Galatians': 'GAL',
  'Ephesians': 'EPH', 'Philippians': 'PHP', 'Colossians': 'COL',
  '1 Thessalonians': '1TH', '2 Thessalonians': '2TH', '1 Timothy': '1TI', '2 Timothy': '2TI',
  'Titus': 'TIT', 'Philemon': 'PHM', 'Hebrews': 'HEB', 'James': 'JAS',
  '1 Peter': '1PE', '2 Peter': '2PE', '1 John': '1JN', '2 John': '2JN', '3 John': '3JN',
  'Jude': 'JUD', 'Revelation': 'REV'
};

const OLD_TESTAMENT_BOOKS = [
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
  '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO',
  'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO',
  'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL'
];

const NEW_TESTAMENT_BOOKS = [
  'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH',
  'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS',
  '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'
];

/**
 * Searches Bible verses using the Bible API
 * @param {string} query - Search query
 * @param {Object} filters - Search filters
 * @returns {Promise<Array>} Array of verse search results
 */
async function searchBibleVerses(query, filters = {}) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const results = [];
  const apiKey = process.env.REACT_APP_BIBLE_API_KEY || 'demo-key';
  const bibleId = 'de4e12af7f28f599-02'; // NIV

  try {
    // If query looks like a reference (e.g., "John 3:16"), fetch that passage
    if (/[0-9]/.test(query) && /[a-zA-Z]/.test(query)) {
      const verseText = await getVerseByReference(query);
      if (verseText) {
        results.push({
          type: 'verse',
          id: `verse-${query}`,
          reference: query,
          text: verseText.text,
          snippet: verseText.text,
          score: 100
        });
      }
    } else {
      // Search for the query in Bible text
      const searchUrl = `https://api.scripture.api.bible/v1/bibles/${bibleId}/search?query=${encodeURIComponent(query)}&limit=20`;

      const response = await fetch(searchUrl, {
        headers: {
          'api-key': apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();

        if (data.data && data.data.verses) {
          data.data.verses.forEach(verse => {
            // Apply filters
            if (shouldIncludeVerse(verse, filters)) {
              results.push({
                type: 'verse',
                id: verse.id,
                reference: verse.reference,
                text: verse.text,
                snippet: highlightMatch(verse.text, query),
                score: calculateRelevanceScore(verse.text, query)
              });
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Error searching Bible verses:', error);
  }

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Gets a specific verse by reference
 */
async function getVerseByReference(reference) {
  const apiKey = process.env.REACT_APP_BIBLE_API_KEY || 'demo-key';
  const bibleId = 'de4e12af7f28f599-02'; // NIV

  try {
    const passageId = parseReference(reference);
    const url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/passages/${passageId}?content-type=text`;

    const response = await fetch(url, {
      headers: {
        'api-key': apiKey
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.content) {
        return {
          reference: data.data.reference,
          text: data.data.content.trim()
        };
      }
    }
  } catch (error) {
    console.error('Error fetching verse:', error);
  }

  return null;
}

/**
 * Parses a scripture reference into API format
 */
function parseReference(reference) {
  // Simple parser - convert "John 3:16" to "JHN.3.16"
  const match = reference.match(/^(\d?\s?[A-Za-z]+)\s*(\d+):?(\d+)?-?(\d+)?/);
  if (match) {
    const [, book, chapter, verseStart, verseEnd] = match;
    const bookCode = BIBLE_BOOKS[book.trim()] || book.trim().toUpperCase().substring(0, 3);
    let parsed = `${bookCode}.${chapter}`;
    if (verseStart) {
      parsed += `.${verseStart}`;
      if (verseEnd) {
        parsed += `-${bookCode}.${chapter}.${verseEnd}`;
      }
    }
    return parsed;
  }
  return reference;
}

/**
 * Checks if a verse should be included based on filters
 */
function shouldIncludeVerse(verse, filters) {
  if (!filters) return true;

  // Testament filter
  if (filters.testament && filters.testament !== 'all') {
    const bookCode = verse.id.split('.')[0];
    if (filters.testament === 'old' && !OLD_TESTAMENT_BOOKS.includes(bookCode)) {
      return false;
    }
    if (filters.testament === 'new' && !NEW_TESTAMENT_BOOKS.includes(bookCode)) {
      return false;
    }
  }

  // Specific books filter
  if (filters.books && filters.books.length > 0) {
    const bookCode = verse.id.split('.')[0];
    if (!filters.books.includes(bookCode)) {
      return false;
    }
  }

  return true;
}

/**
 * Searches lesson content
 * @param {string} query - Search query
 * @param {Array} lessons - All lessons
 * @param {Object} filters - Search filters
 * @returns {Array} Array of lesson search results
 */
function searchLessons(query, lessons, filters = {}) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const results = [];
  const lowerQuery = query.toLowerCase();

  lessons.forEach(lesson => {
    let matches = [];

    // Search in lesson title
    if (lesson.title && lesson.title.toLowerCase().includes(lowerQuery)) {
      matches.push({
        type: 'lesson',
        id: `lesson-title-${lesson.id}`,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        matchType: 'Title',
        snippet: highlightMatch(lesson.title, query),
        reference: `Lesson ${lesson.lessonNumber || ''}`,
        score: 90
      });
    }

    // Search in connection
    if (lesson.connection && lesson.connection.toLowerCase().includes(lowerQuery)) {
      matches.push({
        type: 'lesson',
        id: `lesson-connection-${lesson.id}`,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        matchType: 'Main Connection',
        snippet: highlightMatch(lesson.connection, query),
        reference: `Lesson ${lesson.lessonNumber || ''}`,
        score: 85
      });
    }

    // Search in scripture references
    if (lesson.scripture && Array.isArray(lesson.scripture)) {
      lesson.scripture.forEach(ref => {
        if (ref.toLowerCase().includes(lowerQuery)) {
          matches.push({
            type: 'lesson',
            id: `lesson-scripture-${lesson.id}-${ref}`,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            matchType: 'Scripture Reference',
            snippet: ref,
            reference: `Lesson ${lesson.lessonNumber || ''}`,
            score: 80
          });
        }
      });
    }

    // Search in remember verse
    if (lesson.rememberVerse) {
      if (lesson.rememberVerse.text && lesson.rememberVerse.text.toLowerCase().includes(lowerQuery)) {
        matches.push({
          type: 'lesson',
          id: `lesson-verse-${lesson.id}`,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          matchType: 'Remember Verse',
          snippet: highlightMatch(lesson.rememberVerse.text, query),
          reference: lesson.rememberVerse.reference,
          score: 85
        });
      }
    }

    // Search in slides
    if (lesson.slides && Array.isArray(lesson.slides)) {
      lesson.slides.forEach((slide, index) => {
        // Search in slide HTML content (strip tags first)
        if (slide.html) {
          const textContent = slide.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
          if (textContent.toLowerCase().includes(lowerQuery)) {
            matches.push({
              type: 'lesson',
              id: `lesson-slide-${lesson.id}-${slide.id}`,
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              matchType: `Slide ${index + 1}`,
              snippet: highlightMatch(textContent.substring(0, 200), query),
              reference: `Lesson ${lesson.lessonNumber || ''}, Slide ${index + 1}`,
              score: 70
            });
          }
        }
      });
    }

    // Search in discussion questions
    if (lesson.discussionQuestions && Array.isArray(lesson.discussionQuestions)) {
      lesson.discussionQuestions.forEach((question, index) => {
        if (question.toLowerCase().includes(lowerQuery)) {
          matches.push({
            type: 'lesson',
            id: `lesson-question-${lesson.id}-${index}`,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            matchType: 'Discussion Question',
            snippet: highlightMatch(question, query),
            reference: `Lesson ${lesson.lessonNumber || ''}`,
            score: 75
          });
        }
      });
    }

    results.push(...matches);
  });

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Searches teacher notes
 * @param {string} query - Search query
 * @param {Array} lessons - All lessons
 * @returns {Array} Array of note search results
 */
function searchNotes(query, lessons) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const results = [];
  const lowerQuery = query.toLowerCase();

  lessons.forEach(lesson => {
    if (lesson.slides && Array.isArray(lesson.slides)) {
      lesson.slides.forEach((slide, index) => {
        if (slide.notes && slide.notes.toLowerCase().includes(lowerQuery)) {
          results.push({
            type: 'note',
            id: `note-${lesson.id}-${slide.id}`,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            snippet: highlightMatch(slide.notes, query),
            reference: `Lesson ${lesson.lessonNumber || ''}, Slide ${index + 1}`,
            slideIndex: index,
            score: calculateRelevanceScore(slide.notes, query)
          });
        }
      });
    }
  });

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Performs a comprehensive search across all content types
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Search results grouped by type
 */
export async function performSearch(query, options = {}) {
  const {
    scope = 'all',
    lessons = [],
    filters = {}
  } = options;

  const results = {
    verses: [],
    lessons: [],
    notes: [],
    total: 0
  };

  if (!query || query.trim().length < 2) {
    return results;
  }

  try {
    // Search Bible verses
    if (scope === 'all' || scope === 'bible') {
      results.verses = await searchBibleVerses(query, filters);
    }

    // Search lessons
    if (scope === 'all' || scope === 'lessons') {
      results.lessons = searchLessons(query, lessons, filters);
    }

    // Search notes
    if (scope === 'all' || scope === 'notes') {
      results.notes = searchNotes(query, lessons);
    }

    results.total = results.verses.length + results.lessons.length + results.notes.length;
  } catch (error) {
    console.error('Error performing search:', error);
  }

  return results;
}

/**
 * Highlights matching text in a snippet
 */
function highlightMatch(text, query) {
  if (!text || !query) return text;

  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '**$1**');
}

/**
 * Escapes special regex characters
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Calculates relevance score based on query match
 */
function calculateRelevanceScore(text, query) {
  if (!text || !query) return 0;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Exact match
  if (lowerText === lowerQuery) return 100;

  // Starts with query
  if (lowerText.startsWith(lowerQuery)) return 90;

  // Contains query as whole word
  const wordRegex = new RegExp(`\\b${escapeRegex(lowerQuery)}\\b`, 'i');
  if (wordRegex.test(text)) return 80;

  // Contains query
  if (lowerText.includes(lowerQuery)) return 70;

  // Word-by-word match
  const queryWords = lowerQuery.split(/\s+/);
  const matchedWords = queryWords.filter(word => lowerText.includes(word));
  return (matchedWords.length / queryWords.length) * 60;
}

/**
 * Gets all available Bible books for filtering
 */
export function getBibleBooks() {
  return Object.keys(BIBLE_BOOKS).map(name => ({
    name,
    code: BIBLE_BOOKS[name]
  }));
}

/**
 * Gets books by testament
 */
export function getBooksByTestament(testament) {
  const books = getBibleBooks();
  if (testament === 'old') {
    return books.filter(book => OLD_TESTAMENT_BOOKS.includes(book.code));
  }
  if (testament === 'new') {
    return books.filter(book => NEW_TESTAMENT_BOOKS.includes(book.code));
  }
  return books;
}

const searchService = {
  performSearch,
  searchBibleVerses,
  searchLessons,
  searchNotes,
  getBibleBooks,
  getBooksByTestament
};

export default searchService;
