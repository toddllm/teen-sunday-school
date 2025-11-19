/**
 * Complete Bible structure metadata
 * All 66 books with chapter counts and categorization
 */

export const BIBLE_BOOKS = [
  // Old Testament - Law (Torah/Pentateuch)
  { name: 'Genesis', code: 'GEN', chapters: 50, testament: 'old', category: 'Law' },
  { name: 'Exodus', code: 'EXO', chapters: 40, testament: 'old', category: 'Law' },
  { name: 'Leviticus', code: 'LEV', chapters: 27, testament: 'old', category: 'Law' },
  { name: 'Numbers', code: 'NUM', chapters: 36, testament: 'old', category: 'Law' },
  { name: 'Deuteronomy', code: 'DEU', chapters: 34, testament: 'old', category: 'Law' },

  // Old Testament - History
  { name: 'Joshua', code: 'JOS', chapters: 24, testament: 'old', category: 'History' },
  { name: 'Judges', code: 'JDG', chapters: 21, testament: 'old', category: 'History' },
  { name: 'Ruth', code: 'RUT', chapters: 4, testament: 'old', category: 'History' },
  { name: '1 Samuel', code: '1SA', chapters: 31, testament: 'old', category: 'History' },
  { name: '2 Samuel', code: '2SA', chapters: 24, testament: 'old', category: 'History' },
  { name: '1 Kings', code: '1KI', chapters: 22, testament: 'old', category: 'History' },
  { name: '2 Kings', code: '2KI', chapters: 25, testament: 'old', category: 'History' },
  { name: '1 Chronicles', code: '1CH', chapters: 29, testament: 'old', category: 'History' },
  { name: '2 Chronicles', code: '2CH', chapters: 36, testament: 'old', category: 'History' },
  { name: 'Ezra', code: 'EZR', chapters: 10, testament: 'old', category: 'History' },
  { name: 'Nehemiah', code: 'NEH', chapters: 13, testament: 'old', category: 'History' },
  { name: 'Esther', code: 'EST', chapters: 10, testament: 'old', category: 'History' },

  // Old Testament - Wisdom & Poetry
  { name: 'Job', code: 'JOB', chapters: 42, testament: 'old', category: 'Wisdom' },
  { name: 'Psalms', code: 'PSA', chapters: 150, testament: 'old', category: 'Wisdom' },
  { name: 'Proverbs', code: 'PRO', chapters: 31, testament: 'old', category: 'Wisdom' },
  { name: 'Ecclesiastes', code: 'ECC', chapters: 12, testament: 'old', category: 'Wisdom' },
  { name: 'Song of Solomon', code: 'SNG', chapters: 8, testament: 'old', category: 'Wisdom' },

  // Old Testament - Major Prophets
  { name: 'Isaiah', code: 'ISA', chapters: 66, testament: 'old', category: 'Major Prophets' },
  { name: 'Jeremiah', code: 'JER', chapters: 52, testament: 'old', category: 'Major Prophets' },
  { name: 'Lamentations', code: 'LAM', chapters: 5, testament: 'old', category: 'Major Prophets' },
  { name: 'Ezekiel', code: 'EZK', chapters: 48, testament: 'old', category: 'Major Prophets' },
  { name: 'Daniel', code: 'DAN', chapters: 12, testament: 'old', category: 'Major Prophets' },

  // Old Testament - Minor Prophets
  { name: 'Hosea', code: 'HOS', chapters: 14, testament: 'old', category: 'Minor Prophets' },
  { name: 'Joel', code: 'JOL', chapters: 3, testament: 'old', category: 'Minor Prophets' },
  { name: 'Amos', code: 'AMO', chapters: 9, testament: 'old', category: 'Minor Prophets' },
  { name: 'Obadiah', code: 'OBA', chapters: 1, testament: 'old', category: 'Minor Prophets' },
  { name: 'Jonah', code: 'JON', chapters: 4, testament: 'old', category: 'Minor Prophets' },
  { name: 'Micah', code: 'MIC', chapters: 7, testament: 'old', category: 'Minor Prophets' },
  { name: 'Nahum', code: 'NAM', chapters: 3, testament: 'old', category: 'Minor Prophets' },
  { name: 'Habakkuk', code: 'HAB', chapters: 3, testament: 'old', category: 'Minor Prophets' },
  { name: 'Zephaniah', code: 'ZEP', chapters: 3, testament: 'old', category: 'Minor Prophets' },
  { name: 'Haggai', code: 'HAG', chapters: 2, testament: 'old', category: 'Minor Prophets' },
  { name: 'Zechariah', code: 'ZEC', chapters: 14, testament: 'old', category: 'Minor Prophets' },
  { name: 'Malachi', code: 'MAL', chapters: 4, testament: 'old', category: 'Minor Prophets' },

  // New Testament - Gospels
  { name: 'Matthew', code: 'MAT', chapters: 28, testament: 'new', category: 'Gospels' },
  { name: 'Mark', code: 'MRK', chapters: 16, testament: 'new', category: 'Gospels' },
  { name: 'Luke', code: 'LUK', chapters: 24, testament: 'new', category: 'Gospels' },
  { name: 'John', code: 'JHN', chapters: 21, testament: 'new', category: 'Gospels' },

  // New Testament - History
  { name: 'Acts', code: 'ACT', chapters: 28, testament: 'new', category: 'History' },

  // New Testament - Paul's Letters
  { name: 'Romans', code: 'ROM', chapters: 16, testament: 'new', category: 'Pauline Epistles' },
  { name: '1 Corinthians', code: '1CO', chapters: 16, testament: 'new', category: 'Pauline Epistles' },
  { name: '2 Corinthians', code: '2CO', chapters: 13, testament: 'new', category: 'Pauline Epistles' },
  { name: 'Galatians', code: 'GAL', chapters: 6, testament: 'new', category: 'Pauline Epistles' },
  { name: 'Ephesians', code: 'EPH', chapters: 6, testament: 'new', category: 'Pauline Epistles' },
  { name: 'Philippians', code: 'PHP', chapters: 4, testament: 'new', category: 'Pauline Epistles' },
  { name: 'Colossians', code: 'COL', chapters: 4, testament: 'new', category: 'Pauline Epistles' },
  { name: '1 Thessalonians', code: '1TH', chapters: 5, testament: 'new', category: 'Pauline Epistles' },
  { name: '2 Thessalonians', code: '2TH', chapters: 3, testament: 'new', category: 'Pauline Epistles' },
  { name: '1 Timothy', code: '1TI', chapters: 6, testament: 'new', category: 'Pauline Epistles' },
  { name: '2 Timothy', code: '2TI', chapters: 4, testament: 'new', category: 'Pauline Epistles' },
  { name: 'Titus', code: 'TIT', chapters: 3, testament: 'new', category: 'Pauline Epistles' },
  { name: 'Philemon', code: 'PHM', chapters: 1, testament: 'new', category: 'Pauline Epistles' },

  // New Testament - General Letters
  { name: 'Hebrews', code: 'HEB', chapters: 13, testament: 'new', category: 'General Epistles' },
  { name: 'James', code: 'JAS', chapters: 5, testament: 'new', category: 'General Epistles' },
  { name: '1 Peter', code: '1PE', chapters: 5, testament: 'new', category: 'General Epistles' },
  { name: '2 Peter', code: '2PE', chapters: 3, testament: 'new', category: 'General Epistles' },
  { name: '1 John', code: '1JN', chapters: 5, testament: 'new', category: 'General Epistles' },
  { name: '2 John', code: '2JN', chapters: 1, testament: 'new', category: 'General Epistles' },
  { name: '3 John', code: '3JN', chapters: 1, testament: 'new', category: 'General Epistles' },
  { name: 'Jude', code: 'JUD', chapters: 1, testament: 'new', category: 'General Epistles' },

  // New Testament - Apocalyptic
  { name: 'Revelation', code: 'REV', chapters: 22, testament: 'new', category: 'Apocalyptic' }
];

/**
 * Get book by name
 */
export const getBookByName = (name) => {
  return BIBLE_BOOKS.find(book =>
    book.name.toLowerCase() === name.toLowerCase()
  );
};

/**
 * Get book by code
 */
export const getBookByCode = (code) => {
  return BIBLE_BOOKS.find(book =>
    book.code.toLowerCase() === code.toLowerCase()
  );
};

/**
 * Get all books by testament
 */
export const getBooksByTestament = (testament) => {
  return BIBLE_BOOKS.filter(book => book.testament === testament);
};

/**
 * Get all books by category
 */
export const getBooksByCategory = (category) => {
  return BIBLE_BOOKS.filter(book => book.category === category);
};

/**
 * Get total chapters in the Bible
 */
export const getTotalChapters = () => {
  return BIBLE_BOOKS.reduce((total, book) => total + book.chapters, 0);
};

/**
 * Get total chapters in a testament
 */
export const getTotalChaptersByTestament = (testament) => {
  return BIBLE_BOOKS
    .filter(book => book.testament === testament)
    .reduce((total, book) => total + book.chapters, 0);
};

/**
 * Parse a reference like "John 3:16" or "Genesis 1:1-31"
 * Returns: { book, chapter, verses }
 */
export const parseReference = (reference) => {
  const match = reference.match(/^((?:\d\s)?[A-Za-z\s]+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);

  if (!match) {
    return null;
  }

  const [, bookName, chapter, startVerse, endVerse] = match;
  const book = getBookByName(bookName.trim());

  if (!book) {
    return null;
  }

  return {
    book: book.name,
    bookCode: book.code,
    chapter: parseInt(chapter, 10),
    startVerse: startVerse ? parseInt(startVerse, 10) : null,
    endVerse: endVerse ? parseInt(endVerse, 10) : startVerse ? parseInt(startVerse, 10) : null
  };
};

/**
 * Get categories in order
 */
export const CATEGORIES = {
  old: [
    'Law',
    'History',
    'Wisdom',
    'Major Prophets',
    'Minor Prophets'
  ],
  new: [
    'Gospels',
    'History',
    'Pauline Epistles',
    'General Epistles',
    'Apocalyptic'
  ]
};

export default BIBLE_BOOKS;
