// List of Bible books for matching
const BIBLE_BOOKS = [
  // Old Testament
  'Genesis', 'Gen', 'Exodus', 'Exo', 'Ex', 'Leviticus', 'Lev', 'Numbers', 'Num',
  'Deuteronomy', 'Deut', 'Deu', 'Joshua', 'Josh', 'Judges', 'Judg', 'Ruth',
  'Samuel', 'Sam', 'Kings', 'Chronicles', 'Chron', 'Chr', 'Ezra', 'Nehemiah', 'Neh',
  'Esther', 'Est', 'Job', 'Psalms', 'Psalm', 'Ps', 'Proverbs', 'Prov', 'Pro',
  'Ecclesiastes', 'Eccl', 'Ecc', 'Song of Solomon', 'Song', 'Isaiah', 'Isa',
  'Jeremiah', 'Jer', 'Lamentations', 'Lam', 'Ezekiel', 'Ezek', 'Eze', 'Daniel', 'Dan',
  'Hosea', 'Hos', 'Joel', 'Amos', 'Obadiah', 'Obad', 'Jonah', 'Jon', 'Micah', 'Mic',
  'Nahum', 'Nah', 'Habakkuk', 'Hab', 'Zephaniah', 'Zeph', 'Zep', 'Haggai', 'Hag',
  'Zechariah', 'Zech', 'Zec', 'Malachi', 'Mal',
  // New Testament
  'Matthew', 'Matt', 'Mat', 'Mark', 'Mar', 'Luke', 'Luk', 'John', 'Joh', 'Jhn',
  'Acts', 'Romans', 'Rom', 'Corinthians', 'Cor', 'Galatians', 'Gal',
  'Ephesians', 'Eph', 'Philippians', 'Phil', 'Colossians', 'Col',
  'Thessalonians', 'Thess', 'Thes', 'Timothy', 'Tim', 'Titus', 'Tit',
  'Philemon', 'Phlm', 'Hebrews', 'Heb', 'James', 'Jas', 'Peter', 'Pet',
  'Jude', 'Revelation', 'Rev'
];

/**
 * Parse Bible references from text and return an array of reference objects
 * Examples of supported formats:
 * - John 3:16
 * - 1 John 3:16
 * - Genesis 1:1-3
 * - Rom 8:28-30
 * - Matthew 5:1-10, 13-16
 * - 1 Corinthians 13
 */
export const parseReferences = (text) => {
  if (!text) return [];

  const references = [];

  // Build regex pattern for book names
  const bookPattern = BIBLE_BOOKS.join('|');

  // Pattern explanation:
  // (?:1|2|3)?\s* - Optional book number (1, 2, 3) followed by optional space
  // (book pattern) - Book name
  // \s+ - Required space
  // (\d+) - Chapter number
  // (?::(\d+)(?:-(\d+))?)? - Optional verse (:verse or :verse-verse)
  // (?:\s*,\s*(\d+)(?:-(\d+))?)* - Optional additional verses (,verse or ,verse-verse)
  const referenceRegex = new RegExp(
    `(?:(?:1|2|3)\\s+)?(${bookPattern})\\s+(\\d+)(?::(\\d+)(?:-(\\d+))?)?(?:\\s*,\\s*(\\d+)(?:-(\\d+))?)*`,
    'gi'
  );

  let match;
  while ((match = referenceRegex.exec(text)) !== null) {
    const book = match[1];
    const chapter = match[2];
    const verseStart = match[3];
    const verseEnd = match[4];

    let reference = `${book} ${chapter}`;
    if (verseStart) {
      reference += `:${verseStart}`;
      if (verseEnd) {
        reference += `-${verseEnd}`;
      }
    }

    references.push({
      fullText: match[0],
      book,
      chapter,
      verseStart,
      verseEnd,
      reference,
      startIndex: match.index,
      endIndex: match.index + match[0].length
    });
  }

  return references;
};

/**
 * Convert text with Bible references into React components with clickable links
 * Returns an array of text and link components
 */
export const linkifyReferences = (text, onReferenceClick) => {
  if (!text) return [];

  const references = parseReferences(text);

  if (references.length === 0) {
    return [text];
  }

  const elements = [];
  let lastIndex = 0;

  references.forEach((ref, index) => {
    // Add text before the reference
    if (ref.startIndex > lastIndex) {
      elements.push(text.substring(lastIndex, ref.startIndex));
    }

    // Add the reference as a clickable element (we'll return the data to create the link)
    elements.push({
      type: 'reference',
      key: `ref-${index}`,
      text: ref.fullText,
      reference: ref.reference,
      onClick: () => onReferenceClick && onReferenceClick(ref)
    });

    lastIndex = ref.endIndex;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return elements;
};

/**
 * Count the number of references in text (for analytics)
 */
export const countReferences = (text) => {
  return parseReferences(text).length;
};

/**
 * Normalize a Bible reference for Bible API lookup
 * Converts abbreviated forms to full forms where possible
 */
export const normalizeReference = (reference) => {
  // This is a simplified version - in production you might want more sophisticated mapping
  return reference
    .replace(/Gen(?:\.|(?=\s))/i, 'Genesis')
    .replace(/Exo(?:\.|(?=\s))/i, 'Exodus')
    .replace(/Lev(?:\.|(?=\s))/i, 'Leviticus')
    .replace(/Num(?:\.|(?=\s))/i, 'Numbers')
    .replace(/Deut(?:\.|(?=\s))/i, 'Deuteronomy')
    .replace(/Josh(?:\.|(?=\s))/i, 'Joshua')
    .replace(/Judg(?:\.|(?=\s))/i, 'Judges')
    .replace(/Sam(?:\.|(?=\s))/i, 'Samuel')
    .replace(/Chr(?:on)?(?:\.|(?=\s))/i, 'Chronicles')
    .replace(/Neh(?:\.|(?=\s))/i, 'Nehemiah')
    .replace(/Ps(?:alm)?(?:\.|(?=\s))/i, 'Psalms')
    .replace(/Prov(?:\.|(?=\s))/i, 'Proverbs')
    .replace(/Eccl(?:\.|(?=\s))/i, 'Ecclesiastes')
    .replace(/Isa(?:\.|(?=\s))/i, 'Isaiah')
    .replace(/Jer(?:\.|(?=\s))/i, 'Jeremiah')
    .replace(/Lam(?:\.|(?=\s))/i, 'Lamentations')
    .replace(/Ezek(?:\.|(?=\s))/i, 'Ezekiel')
    .replace(/Dan(?:\.|(?=\s))/i, 'Daniel')
    .replace(/Hos(?:\.|(?=\s))/i, 'Hosea')
    .replace(/Obad(?:\.|(?=\s))/i, 'Obadiah')
    .replace(/Jon(?:\.|(?=\s))/i, 'Jonah')
    .replace(/Mic(?:\.|(?=\s))/i, 'Micah')
    .replace(/Nah(?:\.|(?=\s))/i, 'Nahum')
    .replace(/Hab(?:\.|(?=\s))/i, 'Habakkuk')
    .replace(/Zeph(?:\.|(?=\s))/i, 'Zephaniah')
    .replace(/Hag(?:\.|(?=\s))/i, 'Haggai')
    .replace(/Zech(?:\.|(?=\s))/i, 'Zechariah')
    .replace(/Mal(?:\.|(?=\s))/i, 'Malachi')
    .replace(/Matt(?:\.|(?=\s))/i, 'Matthew')
    .replace(/Mar(?:k)?(?:\.|(?=\s))/i, 'Mark')
    .replace(/Luk(?:e)?(?:\.|(?=\s))/i, 'Luke')
    .replace(/Joh(?:n)?(?:\.|(?=\s))/i, 'John')
    .replace(/Rom(?:\.|(?=\s))/i, 'Romans')
    .replace(/Cor(?:\.|(?=\s))/i, 'Corinthians')
    .replace(/Gal(?:\.|(?=\s))/i, 'Galatians')
    .replace(/Eph(?:\.|(?=\s))/i, 'Ephesians')
    .replace(/Phil(?:\.|(?=\s))/i, 'Philippians')
    .replace(/Col(?:\.|(?=\s))/i, 'Colossians')
    .replace(/Thess(?:\.|(?=\s))/i, 'Thessalonians')
    .replace(/Tim(?:\.|(?=\s))/i, 'Timothy')
    .replace(/Tit(?:\.|(?=\s))/i, 'Titus')
    .replace(/Phlm(?:\.|(?=\s))/i, 'Philemon')
    .replace(/Heb(?:\.|(?=\s))/i, 'Hebrews')
    .replace(/Jas(?:\.|(?=\s))/i, 'James')
    .replace(/Pet(?:\.|(?=\s))/i, 'Peter')
    .replace(/Rev(?:\.|(?=\s))/i, 'Revelation');
};
