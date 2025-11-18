/**
 * Lexicon API Service
 *
 * Provides access to Greek and Hebrew word information including:
 * - Lemmas (dictionary forms)
 * - Transliterations
 * - Glosses (definitions)
 * - Part of speech
 * - Strong's numbers
 * - Occurrence data
 */

// Mock lexicon database - in production, this would come from a licensed lexicon API
const lexiconDatabase = {
  // Greek words
  'G25': {
    id: 'G25',
    lemma: 'ἀγαπάω',
    transliteration: 'agapaō',
    language: 'Greek',
    glosses: ['to love', 'to show love', 'to have affection for'],
    primaryGloss: 'to love',
    partOfSpeech: 'verb',
    strongsNumber: 'G25',
    definition: 'To love in a social or moral sense; Christian love, charitable love, or love that springs from a sense of value and preciousness.',
    occurrenceCount: 143,
    keyReferences: [
      { ref: 'John 3:16', text: 'For God so loved the world...' },
      { ref: 'John 14:21', text: 'Whoever has my commands and keeps them is the one who loves me.' },
      { ref: '1 John 4:8', text: 'God is love.' },
      { ref: 'Romans 5:8', text: 'But God demonstrates his own love for us...' },
      { ref: '1 Corinthians 13:4', text: 'Love is patient, love is kind...' }
    ]
  },
  'G26': {
    id: 'G26',
    lemma: 'ἀγάπη',
    transliteration: 'agapē',
    language: 'Greek',
    glosses: ['love', 'affection', 'charity'],
    primaryGloss: 'love',
    partOfSpeech: 'noun',
    strongsNumber: 'G26',
    definition: 'Divine love, Christian love, charitable love; unconditional love rooted in the will and characterized by self-sacrifice.',
    occurrenceCount: 116,
    keyReferences: [
      { ref: '1 Corinthians 13:13', text: 'And now these three remain: faith, hope and love. But the greatest of these is love.' },
      { ref: '1 John 4:16', text: 'God is love.' },
      { ref: 'Romans 8:39', text: 'Neither height nor depth...will be able to separate us from the love of God.' },
      { ref: 'Galatians 5:22', text: 'But the fruit of the Spirit is love, joy, peace...' }
    ]
  },
  'G2316': {
    id: 'G2316',
    lemma: 'θεός',
    transliteration: 'theos',
    language: 'Greek',
    glosses: ['God', 'god', 'deity'],
    primaryGloss: 'God',
    partOfSpeech: 'noun',
    strongsNumber: 'G2316',
    definition: 'God, the Supreme Divinity; also used of pagan deities and magistrates.',
    occurrenceCount: 1317,
    keyReferences: [
      { ref: 'John 1:1', text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
      { ref: 'Genesis 1:1', text: 'In the beginning God created the heavens and the earth.' },
      { ref: 'Romans 1:20', text: "For since the creation of the world God's invisible qualities..." },
      { ref: '1 John 4:8', text: 'God is love.' }
    ]
  },
  'G2889': {
    id: 'G2889',
    lemma: 'κόσμος',
    transliteration: 'kosmos',
    language: 'Greek',
    glosses: ['world', 'universe', 'mankind', 'adornment'],
    primaryGloss: 'world',
    partOfSpeech: 'noun',
    strongsNumber: 'G2889',
    definition: 'The ordered universe; the world system; mankind as a whole; the present evil age.',
    occurrenceCount: 186,
    keyReferences: [
      { ref: 'John 3:16', text: 'For God so loved the world that he gave his one and only Son...' },
      { ref: 'John 1:10', text: 'He was in the world, and though the world was made through him...' },
      { ref: '1 John 2:15', text: 'Do not love the world or anything in the world.' },
      { ref: 'Romans 12:2', text: 'Do not conform to the pattern of this world...' }
    ]
  },
  'G4102': {
    id: 'G4102',
    lemma: 'πίστις',
    transliteration: 'pistis',
    language: 'Greek',
    glosses: ['faith', 'belief', 'trust', 'faithfulness'],
    primaryGloss: 'faith',
    partOfSpeech: 'noun',
    strongsNumber: 'G4102',
    definition: 'Faith, belief, trust, confidence; fidelity, faithfulness.',
    occurrenceCount: 243,
    keyReferences: [
      { ref: 'Hebrews 11:1', text: 'Now faith is confidence in what we hope for...' },
      { ref: 'Ephesians 2:8', text: 'For it is by grace you have been saved, through faith...' },
      { ref: 'Romans 10:17', text: 'Consequently, faith comes from hearing the message...' },
      { ref: 'James 2:17', text: 'Faith by itself, if it is not accompanied by action, is dead.' }
    ]
  },
  'G5485': {
    id: 'G5485',
    lemma: 'χάρις',
    transliteration: 'charis',
    language: 'Greek',
    glosses: ['grace', 'favor', 'thanks', 'gratitude'],
    primaryGloss: 'grace',
    partOfSpeech: 'noun',
    strongsNumber: 'G5485',
    definition: "Grace, favor, kindness; God's unmerited favor and enabling power.",
    occurrenceCount: 156,
    keyReferences: [
      { ref: 'Ephesians 2:8', text: 'For it is by grace you have been saved, through faith...' },
      { ref: '2 Corinthians 12:9', text: 'My grace is sufficient for you...' },
      { ref: 'Romans 5:20', text: 'Where sin increased, grace increased all the more...' },
      { ref: 'Titus 2:11', text: 'For the grace of God has appeared that offers salvation...' }
    ]
  },
  // Hebrew words
  'H430': {
    id: 'H430',
    lemma: 'אֱלֹהִים',
    transliteration: 'ʾĕlōhîm',
    language: 'Hebrew',
    glosses: ['God', 'gods', 'judges', 'mighty ones'],
    primaryGloss: 'God',
    partOfSpeech: 'noun',
    strongsNumber: 'H430',
    definition: 'God, gods, judges, angels; the Supreme God; plural form often used for the one true God.',
    occurrenceCount: 2606,
    keyReferences: [
      { ref: 'Genesis 1:1', text: 'In the beginning God created the heavens and the earth.' },
      { ref: 'Deuteronomy 6:4', text: 'Hear, O Israel: The LORD our God, the LORD is one.' },
      { ref: 'Psalm 90:2', text: 'Before the mountains were born...you are God.' },
      { ref: 'Isaiah 45:5', text: 'I am the LORD, and there is no other; apart from me there is no God.' }
    ]
  },
  'H157': {
    id: 'H157',
    lemma: 'אָהַב',
    transliteration: 'ʾāhab',
    language: 'Hebrew',
    glosses: ['to love', 'to like', 'to be a friend'],
    primaryGloss: 'to love',
    partOfSpeech: 'verb',
    strongsNumber: 'H157',
    definition: 'To love (of human and divine love); to like; to show affection.',
    occurrenceCount: 217,
    keyReferences: [
      { ref: 'Deuteronomy 6:5', text: 'Love the LORD your God with all your heart...' },
      { ref: 'Leviticus 19:18', text: 'Love your neighbor as yourself.' },
      { ref: 'Hosea 11:1', text: 'When Israel was a child, I loved him...' },
      { ref: 'Psalm 116:1', text: 'I love the LORD, for he heard my voice...' }
    ]
  },
  'H3068': {
    id: 'H3068',
    lemma: 'יְהוָה',
    transliteration: 'YHWH',
    language: 'Hebrew',
    glosses: ['LORD', 'Yahweh', 'Jehovah'],
    primaryGloss: 'LORD',
    partOfSpeech: 'proper noun',
    strongsNumber: 'H3068',
    definition: 'The proper name of the God of Israel; usually represented as LORD in English translations.',
    occurrenceCount: 6828,
    keyReferences: [
      { ref: 'Exodus 3:14', text: 'God said to Moses, "I AM WHO I AM."' },
      { ref: 'Deuteronomy 6:4', text: 'Hear, O Israel: The LORD our God, the LORD is one.' },
      { ref: 'Psalm 23:1', text: 'The LORD is my shepherd...' },
      { ref: 'Isaiah 40:31', text: 'But those who hope in the LORD will renew their strength...' }
    ]
  },
  'H7965': {
    id: 'H7965',
    lemma: 'שָׁלוֹם',
    transliteration: 'shālôm',
    language: 'Hebrew',
    glosses: ['peace', 'wholeness', 'welfare', 'health'],
    primaryGloss: 'peace',
    partOfSpeech: 'noun',
    strongsNumber: 'H7965',
    definition: 'Completeness, soundness, welfare, peace; used as a greeting and blessing.',
    occurrenceCount: 237,
    keyReferences: [
      { ref: 'Numbers 6:26', text: 'The LORD...give you peace.' },
      { ref: 'Psalm 29:11', text: 'The LORD blesses his people with peace.' },
      { ref: 'Isaiah 9:6', text: 'And he will be called...Prince of Peace.' },
      { ref: 'Isaiah 26:3', text: 'You will keep in perfect peace those whose minds are steadfast...' }
    ]
  }
};

// Mock word-to-Strong's mapping for common Bible verses
// In production, this would be derived from a morphologically tagged Bible text
const wordMappings = {
  // John 3:16 (NIV)
  'JHN.3.16': {
    'God': 'G2316',
    'loved': 'G25',
    'world': 'G2889',
    'gave': 'G1325',
    'Son': 'G5207',
    'believes': 'G4100',
    'eternal': 'G166',
    'life': 'G2222'
  },
  // 1 Corinthians 13:13
  'CO1.13.13': {
    'faith': 'G4102',
    'hope': 'G1680',
    'love': 'G26',
    'greatest': 'G3187'
  },
  // Ephesians 2:8
  'EPH.2.8': {
    'grace': 'G5485',
    'saved': 'G4982',
    'faith': 'G4102',
    'gift': 'G1435',
    'God': 'G2316'
  },
  // Genesis 1:1
  'GEN.1.1': {
    'beginning': 'H7225',
    'God': 'H430',
    'created': 'H1254',
    'heavens': 'H8064',
    'earth': 'H776'
  },
  // Psalm 23:1
  'PSA.23.1': {
    'LORD': 'H3068',
    'shepherd': 'H7462',
    'lack': 'H2637'
  }
};

/**
 * Get lexeme information by verse reference and word
 * Simulates: GET /bible/lexeme?verse_ref=...&word_index=...
 *
 * @param {string} verseRef - Verse ID (e.g., 'JHN.3.16')
 * @param {string} word - The word to lookup
 * @returns {Object|null} Lexeme data or null if not found
 */
export const getLexemeByWord = (verseRef, word) => {
  // Normalize the word (remove punctuation, convert to lowercase for matching)
  const normalizedWord = word.replace(/[.,!?;:'"]/g, '').toLowerCase();

  // Check if we have mappings for this verse
  const verseMappings = wordMappings[verseRef];
  if (!verseMappings) {
    return null;
  }

  // Find the word in the mappings (case-insensitive)
  let strongsNumber = null;
  for (const [mappedWord, strongs] of Object.entries(verseMappings)) {
    if (mappedWord.toLowerCase() === normalizedWord) {
      strongsNumber = strongs;
      break;
    }
  }

  if (!strongsNumber) {
    return null;
  }

  // Return the lexeme data
  return lexiconDatabase[strongsNumber] || null;
};

/**
 * Get lexeme information by Strong's number
 * Simulates: GET /bible/lexeme/{id}
 *
 * @param {string} strongsNumber - Strong's number (e.g., 'G25', 'H430')
 * @returns {Object|null} Lexeme data or null if not found
 */
export const getLexemeById = (strongsNumber) => {
  return lexiconDatabase[strongsNumber] || null;
};

/**
 * Get all occurrences of a lexeme
 * Simulates: GET /bible/lexeme/{id}/occurrences?limit=...
 *
 * @param {string} strongsNumber - Strong's number
 * @param {number} limit - Maximum number of references to return
 * @returns {Array} Array of verse references
 */
export const getLexemeOccurrences = (strongsNumber, limit = 10) => {
  const lexeme = lexiconDatabase[strongsNumber];
  if (!lexeme) {
    return [];
  }

  // Return the key references (in production, this would query a full concordance)
  return lexeme.keyReferences.slice(0, limit);
};

/**
 * Search for lexemes by lemma or gloss
 *
 * @param {string} searchTerm - Search term
 * @returns {Array} Array of matching lexemes
 */
export const searchLexemes = (searchTerm) => {
  const term = searchTerm.toLowerCase();
  const results = [];

  for (const lexeme of Object.values(lexiconDatabase)) {
    if (
      lexeme.lemma.toLowerCase().includes(term) ||
      lexeme.transliteration.toLowerCase().includes(term) ||
      lexeme.glosses.some(gloss => gloss.toLowerCase().includes(term)) ||
      lexeme.definition.toLowerCase().includes(term)
    ) {
      results.push(lexeme);
    }
  }

  return results;
};

/**
 * Check if a verse has lexeme data available
 *
 * @param {string} verseRef - Verse ID (e.g., 'JHN.3.16')
 * @returns {boolean} True if lexeme data is available
 */
export const hasLexemeData = (verseRef) => {
  return verseRef in wordMappings;
};

/**
 * Get all available words with lexeme data for a verse
 *
 * @param {string} verseRef - Verse ID (e.g., 'JHN.3.16')
 * @returns {Array} Array of words with available lexeme data
 */
export const getAvailableWords = (verseRef) => {
  const verseMappings = wordMappings[verseRef];
  if (!verseMappings) {
    return [];
  }
  return Object.keys(verseMappings);
};
