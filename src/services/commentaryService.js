// Commentary Service
// Manages commentary sources and entries for Bible passages

// Mock commentary sources with licensing information
export const commentarySources = [
  {
    id: 1,
    name: "Matthew Henry's Concise Commentary",
    description: "Classic commentary providing practical and devotional insights",
    license_info: "Public Domain",
    enabled: true
  },
  {
    id: 2,
    name: "Barnes' Notes on the Bible",
    description: "Detailed verse-by-verse exposition with historical context",
    license_info: "Public Domain",
    enabled: true
  },
  {
    id: 3,
    name: "Gill's Exposition of the Bible",
    description: "Comprehensive theological commentary from a Reformed perspective",
    license_info: "Public Domain",
    enabled: true
  },
  {
    id: 4,
    name: "Jamieson-Fausset-Brown Commentary",
    description: "Scholarly commentary combining critical and practical insights",
    license_info: "Public Domain",
    enabled: true
  },
  {
    id: 5,
    name: "The Pulpit Commentary",
    description: "Extensive homiletical and exegetical notes for preachers",
    license_info: "Public Domain - Selected Excerpts",
    enabled: true
  }
];

// Mock commentary entries for common passages
// In production, this would be fetched from an API
export const commentaryEntries = [
  // John 3:16
  {
    id: 1,
    source_id: 1,
    passage_ref: "JHN.3.16",
    excerpt: "God so loved the world - This is the foundation of all our hopes. The love of God is the spring of our salvation, and Jesus Christ is the great channel through which it flows to us.",
    full_url: "https://www.biblestudytools.com/commentaries/matthew-henry-concise/john/3.html"
  },
  {
    id: 2,
    source_id: 2,
    passage_ref: "JHN.3.16",
    excerpt: "For God so loved - It was not from any obligation, but from pure love. The world - Not just the Jews, but all humanity. Gave his only begotten Son - The most precious gift that could be bestowed.",
    full_url: "https://www.biblestudytools.com/commentaries/barnes-notes/john/3-16.html"
  },
  {
    id: 3,
    source_id: 3,
    passage_ref: "JHN.3.16",
    excerpt: "God's love is the source of redemption. This love is special and particular, extending to the elect whom He has chosen. The gift of Christ demonstrates the immeasurable nature of divine love.",
    full_url: "https://www.biblestudytools.com/commentaries/gills-exposition-of-the-bible/john-3-16.html"
  },
  {
    id: 4,
    source_id: 4,
    passage_ref: "JHN.3.16",
    excerpt: "The greatest verse in the Bible, containing in miniature the whole Gospel. God's love, man's sin, Christ's mission, and salvation's simplicity are all here combined.",
    full_url: "https://www.biblestudytools.com/commentaries/jamieson-fausset-brown/john/3.html"
  },

  // Romans 8:28
  {
    id: 5,
    source_id: 1,
    passage_ref: "ROM.8.28",
    excerpt: "All things work together for good - Not that all things are good, but God makes them work together for the ultimate good of those who love Him and are called according to His purpose.",
    full_url: "https://www.biblestudytools.com/commentaries/matthew-henry-concise/romans/8.html"
  },
  {
    id: 6,
    source_id: 2,
    passage_ref: "ROM.8.28",
    excerpt: "This is one of the most comforting declarations in the Bible. It affirms God's providence and sovereignty, assuring believers that even trials and afflictions serve a divine purpose.",
    full_url: "https://www.biblestudytools.com/commentaries/barnes-notes/romans/8-28.html"
  },
  {
    id: 7,
    source_id: 4,
    passage_ref: "ROM.8.28",
    excerpt: "The golden chain of salvation ensures that nothing can separate believers from God's love. This verse captures the certainty of divine providence working in all circumstances.",
    full_url: "https://www.biblestudytools.com/commentaries/jamieson-fausset-brown/romans/8.html"
  },

  // Philippians 4:13
  {
    id: 8,
    source_id: 1,
    passage_ref: "PHP.4.13",
    excerpt: "I can do all things through Christ - Not in our own strength, but through Christ who strengthens us. This applies to bearing both prosperity and adversity with equal grace.",
    full_url: "https://www.biblestudytools.com/commentaries/matthew-henry-concise/philippians/4.html"
  },
  {
    id: 9,
    source_id: 2,
    passage_ref: "PHP.4.13",
    excerpt: "Paul had learned contentment in all circumstances through divine strength. This is not a promise of worldly success, but of spiritual sufficiency in every situation.",
    full_url: "https://www.biblestudytools.com/commentaries/barnes-notes/philippians/4-13.html"
  },
  {
    id: 10,
    source_id: 3,
    passage_ref: "PHP.4.13",
    excerpt: "The strength comes from Christ dwelling within. It's not natural ability but supernatural enabling that allows believers to endure and overcome all circumstances.",
    full_url: "https://www.biblestudytools.com/commentaries/gills-exposition-of-the-bible/philippians-4-13.html"
  },

  // Psalm 23:1
  {
    id: 11,
    source_id: 1,
    passage_ref: "PSA.23.1",
    excerpt: "The Lord is my shepherd - This beautiful psalm expresses complete trust in God's care. As a shepherd provides for sheep, so God provides for His people in every need.",
    full_url: "https://www.biblestudytools.com/commentaries/matthew-henry-concise/psalms/23.html"
  },
  {
    id: 12,
    source_id: 2,
    passage_ref: "PSA.23.1",
    excerpt: "I shall not want - Having God as shepherd means lacking nothing essential. This is not a promise of luxury, but of sufficiency in all things needed for life and godliness.",
    full_url: "https://www.biblestudytools.com/commentaries/barnes-notes/psalms/23-1.html"
  },
  {
    id: 13,
    source_id: 5,
    passage_ref: "PSA.23.1",
    excerpt: "David, the shepherd-king, speaks from experience. This psalm is the Christian's comfort in life and death, expressing perfect confidence in divine provision and protection.",
    full_url: "https://www.biblestudytools.com/commentaries/pulpit-commentary/psalms/23.html"
  },

  // Genesis 1:1
  {
    id: 14,
    source_id: 1,
    passage_ref: "GEN.1.1",
    excerpt: "In the beginning God created - The foundation of all faith. God existed before creation, and He brought all things into being by His word and power.",
    full_url: "https://www.biblestudytools.com/commentaries/matthew-henry-concise/genesis/1.html"
  },
  {
    id: 15,
    source_id: 2,
    passage_ref: "GEN.1.1",
    excerpt: "This verse establishes God as Creator, refuting atheism and polytheism. It declares that matter is not eternal but had a beginning, and that beginning was God's creative act.",
    full_url: "https://www.biblestudytools.com/commentaries/barnes-notes/genesis/1-1.html"
  },
  {
    id: 16,
    source_id: 4,
    passage_ref: "GEN.1.1",
    excerpt: "The opening words of Scripture are majestic and profound. They affirm divine sovereignty, creative power, and the temporal beginning of the physical universe.",
    full_url: "https://www.biblestudytools.com/commentaries/jamieson-fausset-brown/genesis/1.html"
  },

  // Matthew 28:19-20 (Great Commission)
  {
    id: 17,
    source_id: 1,
    passage_ref: "MAT.28.19",
    excerpt: "Go therefore and make disciples - This is the church's great commission. Not merely to make converts, but to make disciples who follow and obey Christ in all things.",
    full_url: "https://www.biblestudytools.com/commentaries/matthew-henry-concise/matthew/28.html"
  },
  {
    id: 18,
    source_id: 2,
    passage_ref: "MAT.28.19",
    excerpt: "Baptizing them in the name of the Father, Son, and Holy Spirit - This affirms the Trinity and the means of entry into the Christian community through baptism and teaching.",
    full_url: "https://www.biblestudytools.com/commentaries/barnes-notes/matthew/28-19.html"
  },
  {
    id: 19,
    source_id: 5,
    passage_ref: "MAT.28.20",
    excerpt: "I am with you always - The promise of Christ's perpetual presence with His church. This divine companionship ensures the success of the Great Commission until the end of the age.",
    full_url: "https://www.biblestudytools.com/commentaries/pulpit-commentary/matthew/28.html"
  },

  // Ephesians 2:8-9
  {
    id: 20,
    source_id: 1,
    passage_ref: "EPH.2.8",
    excerpt: "By grace you have been saved through faith - Salvation is entirely God's gift, not earned by human effort. Faith is the hand that receives, not the work that merits.",
    full_url: "https://www.biblestudytools.com/commentaries/matthew-henry-concise/ephesians/2.html"
  },
  {
    id: 21,
    source_id: 2,
    passage_ref: "EPH.2.8",
    excerpt: "Not of works, lest anyone should boast - This excludes all human merit. Salvation rests entirely on divine grace, received through faith, leaving no room for pride.",
    full_url: "https://www.biblestudytools.com/commentaries/barnes-notes/ephesians/2-8.html"
  },
  {
    id: 22,
    source_id: 3,
    passage_ref: "EPH.2.9",
    excerpt: "The exclusion of works is absolute regarding salvation. Good works are the fruit of salvation, not the root. Grace alone, through faith alone, is the means of redemption.",
    full_url: "https://www.biblestudytools.com/commentaries/gills-exposition-of-the-bible/ephesians-2-9.html"
  },

  // Proverbs 3:5-6
  {
    id: 23,
    source_id: 1,
    passage_ref: "PRO.3.5",
    excerpt: "Trust in the Lord with all your heart - Complete reliance on God rather than human wisdom. Lean not on your own understanding means to distrust self-sufficiency.",
    full_url: "https://www.biblestudytools.com/commentaries/matthew-henry-concise/proverbs/3.html"
  },
  {
    id: 24,
    source_id: 2,
    passage_ref: "PRO.3.6",
    excerpt: "In all your ways acknowledge Him - Submit every decision to God's will and wisdom. He shall direct your paths promises divine guidance for those who seek it.",
    full_url: "https://www.biblestudytools.com/commentaries/barnes-notes/proverbs/3-6.html"
  },
  {
    id: 25,
    source_id: 4,
    passage_ref: "PRO.3.5",
    excerpt: "This wisdom literature calls for wholehearted faith over intellectual self-reliance. True wisdom begins with trust in God and submission to His direction.",
    full_url: "https://www.biblestudytools.com/commentaries/jamieson-fausset-brown/proverbs/3.html"
  }
];

/**
 * Fetches commentary entries for a given passage reference
 * @param {string} passageRef - Verse reference in format "JHN.3.16"
 * @param {Array<number>} enabledSourceIds - Array of enabled source IDs to filter by
 * @returns {Array} Array of commentary entries matching the passage
 */
export const getCommentaryForPassage = (passageRef, enabledSourceIds = null) => {
  let entries = commentaryEntries.filter(entry => entry.passage_ref === passageRef);

  // Filter by enabled sources if specified
  if (enabledSourceIds && enabledSourceIds.length > 0) {
    entries = entries.filter(entry => enabledSourceIds.includes(entry.source_id));
  }

  // Join with source information
  return entries.map(entry => {
    const source = commentarySources.find(s => s.id === entry.source_id);
    return {
      ...entry,
      source_name: source?.name,
      source_license: source?.license_info
    };
  });
};

/**
 * Gets all available commentary sources
 * @returns {Array} Array of all commentary sources
 */
export const getAllCommentarySources = () => {
  return commentarySources;
};

/**
 * Gets enabled commentary sources from localStorage
 * @returns {Array<number>} Array of enabled source IDs
 */
export const getEnabledSourceIds = () => {
  const stored = localStorage.getItem('commentaryEnabledSources');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing enabled sources:', e);
    }
  }
  // Default: all sources enabled
  return commentarySources.map(s => s.id);
};

/**
 * Saves enabled commentary sources to localStorage
 * @param {Array<number>} sourceIds - Array of enabled source IDs
 */
export const saveEnabledSourceIds = (sourceIds) => {
  localStorage.setItem('commentaryEnabledSources', JSON.stringify(sourceIds));
};

/**
 * Converts a human-readable reference to API format
 * @param {string} reference - Reference like "John 3:16"
 * @returns {string} Reference in format "JHN.3.16"
 */
export const referenceToId = (reference) => {
  const bookMap = {
    'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM', 'Deuteronomy': 'DEU',
    'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT', '1 Samuel': '1SA', '2 Samuel': '2SA',
    '1 Kings': '1KI', '2 Kings': '2KI', '1 Chronicles': '1CH', '2 Chronicles': '2CH',
    'Ezra': 'EZR', 'Nehemiah': 'NEH', 'Esther': 'EST', 'Job': 'JOB', 'Psalms': 'PSA', 'Psalm': 'PSA',
    'Proverbs': 'PRO', 'Ecclesiastes': 'ECC', 'Song of Solomon': 'SNG', 'Isaiah': 'ISA',
    'Jeremiah': 'JER', 'Lamentations': 'LAM', 'Ezekiel': 'EZK', 'Daniel': 'DAN',
    'Hosea': 'HOS', 'Joel': 'JOL', 'Amos': 'AMO', 'Obadiah': 'OBA', 'Jonah': 'JON',
    'Micah': 'MIC', 'Nahum': 'NAM', 'Habakkuk': 'HAB', 'Zephaniah': 'ZEP', 'Haggai': 'HAG',
    'Zechariah': 'ZEC', 'Malachi': 'MAL',
    'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN', 'Acts': 'ACT',
    'Romans': 'ROM', '1 Corinthians': '1CO', '2 Corinthians': '2CO', 'Galatians': 'GAL',
    'Ephesians': 'EPH', 'Philippians': 'PHP', 'Colossians': 'COL', '1 Thessalonians': '1TH',
    '2 Thessalonians': '2TH', '1 Timothy': '1TI', '2 Timothy': '2TI', 'Titus': 'TIT',
    'Philemon': 'PHM', 'Hebrews': 'HEB', 'James': 'JAS', '1 Peter': '1PE', '2 Peter': '2PE',
    '1 John': '1JN', '2 John': '2JN', '3 John': '3JN', 'Jude': 'JUD', 'Revelation': 'REV'
  };

  // Parse reference like "John 3:16" or "Psalm 23:1"
  const match = reference.match(/^(\d?\s?[A-Za-z]+)\s+(\d+):(\d+)$/);
  if (match) {
    const [, book, chapter, verse] = match;
    const bookCode = bookMap[book.trim()];
    if (bookCode) {
      return `${bookCode}.${chapter}.${verse}`;
    }
  }

  return reference; // Return as-is if parsing fails
};
