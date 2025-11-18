/**
 * Character Service
 * Utility functions for working with biblical characters
 */

/**
 * Format Bible passage reference for display
 */
export const formatPassageReference = (passage) => {
  if (passage.verses) {
    return `${passage.book} ${passage.chapter}:${passage.verses}`;
  } else if (passage.chapters) {
    return `${passage.book} ${passage.chapters}`;
  } else if (passage.chapter) {
    return `${passage.book} ${passage.chapter}`;
  }
  return `${passage.book}`;
};

/**
 * Format passage for Bible API lookup
 */
export const formatPassageForAPI = (passage) => {
  const bookCode = getBookCode(passage.book);

  if (passage.verses) {
    return `${bookCode}.${passage.chapter}.${passage.verses}`;
  } else if (passage.chapter) {
    return `${bookCode}.${passage.chapter}`;
  }
  return bookCode;
};

/**
 * Simple book name to code mapping
 * Matches the format used in bibleAPI.js
 */
const BOOK_CODES = {
  // Old Testament
  'Genesis': 'GEN',
  'Exodus': 'EXO',
  'Leviticus': 'LEV',
  'Numbers': 'NUM',
  'Deuteronomy': 'DEU',
  'Joshua': 'JOS',
  'Judges': 'JDG',
  'Ruth': 'RUT',
  '1 Samuel': '1SA',
  '2 Samuel': '2SA',
  '1 Kings': '1KI',
  '2 Kings': '2KI',
  '1 Chronicles': '1CH',
  '2 Chronicles': '2CH',
  'Ezra': 'EZR',
  'Nehemiah': 'NEH',
  'Esther': 'EST',
  'Job': 'JOB',
  'Psalm': 'PSA',
  'Psalms': 'PSA',
  'Proverbs': 'PRO',
  'Ecclesiastes': 'ECC',
  'Song of Songs': 'SNG',
  'Song of Solomon': 'SNG',
  'Isaiah': 'ISA',
  'Jeremiah': 'JER',
  'Lamentations': 'LAM',
  'Ezekiel': 'EZK',
  'Daniel': 'DAN',
  'Hosea': 'HOS',
  'Joel': 'JOL',
  'Amos': 'AMO',
  'Obadiah': 'OBA',
  'Jonah': 'JON',
  'Micah': 'MIC',
  'Nahum': 'NAM',
  'Habakkuk': 'HAB',
  'Zephaniah': 'ZEP',
  'Haggai': 'HAG',
  'Zechariah': 'ZEC',
  'Malachi': 'MAL',

  // New Testament
  'Matthew': 'MAT',
  'Mark': 'MRK',
  'Luke': 'LUK',
  'John': 'JHN',
  'Acts': 'ACT',
  'Romans': 'ROM',
  '1 Corinthians': '1CO',
  '2 Corinthians': '2CO',
  'Galatians': 'GAL',
  'Ephesians': 'EPH',
  'Philippians': 'PHP',
  'Colossians': 'COL',
  '1 Thessalonians': '1TH',
  '2 Thessalonians': '2TH',
  '1 Timothy': '1TI',
  '2 Timothy': '2TI',
  'Titus': 'TIT',
  'Philemon': 'PHM',
  'Hebrews': 'HEB',
  'James': 'JAS',
  '1 Peter': '1PE',
  '2 Peter': '2PE',
  '1 John': '1JN',
  '2 John': '2JN',
  '3 John': '3JN',
  'Jude': 'JUD',
  'Revelation': 'REV'
};

/**
 * Get book code from book name
 */
export const getBookCode = (bookName) => {
  return BOOK_CODES[bookName] || bookName;
};

/**
 * Get character testament (Old or New)
 */
export const getCharacterTestament = (character) => {
  // Simple heuristic: check primary passages
  if (!character.primaryPassages || character.primaryPassages.length === 0) {
    return 'Unknown';
  }

  const firstPassage = character.primaryPassages[0];
  const otBooks = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
                   'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings',
                   '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
                   'Esther', 'Job', 'Psalm', 'Psalms', 'Proverbs', 'Ecclesiastes',
                   'Song of Songs', 'Song of Solomon', 'Isaiah', 'Jeremiah',
                   'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
                   'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah',
                   'Haggai', 'Zechariah', 'Malachi'];

  return otBooks.includes(firstPassage.book) ? 'Old Testament' : 'New Testament';
};

/**
 * Get character role/category
 */
export const getCharacterRole = (character) => {
  const name = character.name.toLowerCase();
  const summary = character.summary.toLowerCase();

  if (summary.includes('prophet')) return 'Prophet';
  if (summary.includes('king')) return 'King/Ruler';
  if (summary.includes('judge')) return 'Judge';
  if (summary.includes('apostle') || summary.includes('disciple')) return 'Apostle/Disciple';
  if (summary.includes('patriarch')) return 'Patriarch';
  if (name === 'jesus' || name === 'jesus christ') return 'Messiah';

  return 'Biblical Figure';
};

/**
 * Generate a shareable summary of a character
 */
export const generateCharacterSummary = (character) => {
  return `${character.name}: ${character.summary}`;
};

/**
 * Export character data for sharing
 */
export const exportCharacterData = (character) => {
  return {
    name: character.name,
    altNames: character.altNames,
    summary: character.summary,
    primaryPassages: character.primaryPassages.map(p => formatPassageReference(p)),
    keyLifeEvents: character.keyLifeEvents,
    testament: getCharacterTestament(character),
    role: getCharacterRole(character)
  };
};

/**
 * Get color for character category (for UI badges)
 */
export const getCategoryColor = (role) => {
  const colorMap = {
    'Prophet': '#9b59b6',
    'King/Ruler': '#e74c3c',
    'Judge': '#3498db',
    'Apostle/Disciple': '#2ecc71',
    'Patriarch': '#f39c12',
    'Messiah': '#e67e22',
    'Biblical Figure': '#95a5a6'
  };

  return colorMap[role] || colorMap['Biblical Figure'];
};

/**
 * Highlight search query in text
 */
export const highlightText = (text, query) => {
  if (!query) return text;

  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

/**
 * Get initial letter for grouping
 */
export const getInitialLetter = (name) => {
  return name.charAt(0).toUpperCase();
};

/**
 * Sort characters by various criteria
 */
export const sortCharacters = (characters, sortBy = 'name') => {
  const sorted = [...characters];

  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'testament':
      return sorted.sort((a, b) => {
        const testA = getCharacterTestament(a);
        const testB = getCharacterTestament(b);
        return testA.localeCompare(testB);
      });
    case 'role':
      return sorted.sort((a, b) => {
        const roleA = getCharacterRole(a);
        const roleB = getCharacterRole(b);
        return roleA.localeCompare(roleB);
      });
    default:
      return sorted;
  }
};

/**
 * Filter characters by testament
 */
export const filterByTestament = (characters, testament) => {
  if (!testament || testament === 'All') return characters;
  return characters.filter(char => getCharacterTestament(char) === testament);
};

/**
 * Filter characters by role
 */
export const filterByRole = (characters, role) => {
  if (!role || role === 'All') return characters;
  return characters.filter(char => getCharacterRole(char) === role);
};

/**
 * Get unique roles from character list
 */
export const getUniqueRoles = (characters) => {
  const roles = new Set(characters.map(char => getCharacterRole(char)));
  return Array.from(roles).sort();
};

const characterService = {
  formatPassageReference,
  formatPassageForAPI,
  getBookCode,
  getCharacterTestament,
  getCharacterRole,
  generateCharacterSummary,
  exportCharacterData,
  getCategoryColor,
  highlightText,
  getInitialLetter,
  sortCharacters,
  filterByTestament,
  filterByRole,
  getUniqueRoles
};

export default characterService;
