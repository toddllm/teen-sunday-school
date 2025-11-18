/**
 * Bible Timeline Events Data
 * Approximate dates are based on scholarly consensus
 * All dates are approximate and marked as such in the UI
 */

export const bibleEvents = [
  // Creation and Early History
  {
    id: 'creation',
    title: 'Creation',
    approximateDateRange: 'Beginning of time',
    yearBCE: null, // Unknown
    description: 'God creates the heavens and the earth, humanity, and all living things in six days.',
    keyPassages: ['Genesis 1:1-2:3'],
    relatedPeople: ['God', 'Adam', 'Eve'],
    testament: 'OT',
    theme: 'Creation',
    era: 'Primeval History'
  },
  {
    id: 'fall',
    title: 'The Fall',
    approximateDateRange: 'Early history',
    yearBCE: null,
    description: 'Adam and Eve disobey God by eating from the forbidden tree, bringing sin into the world.',
    keyPassages: ['Genesis 3:1-24'],
    relatedPeople: ['Adam', 'Eve', 'Serpent'],
    testament: 'OT',
    theme: 'Sin and Redemption',
    era: 'Primeval History'
  },
  {
    id: 'flood',
    title: 'The Great Flood',
    approximateDateRange: 'Early history',
    yearBCE: null,
    description: 'God sends a flood to cleanse the earth of wickedness. Noah and his family are saved in the ark.',
    keyPassages: ['Genesis 6:1-9:17'],
    relatedPeople: ['Noah', 'Noah\'s family'],
    testament: 'OT',
    theme: 'Judgment and Salvation',
    era: 'Primeval History'
  },
  {
    id: 'tower-babel',
    title: 'Tower of Babel',
    approximateDateRange: 'Early history',
    yearBCE: null,
    description: 'Humanity attempts to build a tower to heaven. God confuses their languages and scatters them.',
    keyPassages: ['Genesis 11:1-9'],
    relatedPeople: ['People of Babel'],
    testament: 'OT',
    theme: 'Pride and Judgment',
    era: 'Primeval History'
  },

  // Patriarchs
  {
    id: 'abraham-call',
    title: 'Call of Abraham',
    approximateDateRange: 'c. 2000 BCE',
    yearBCE: 2000,
    description: 'God calls Abram to leave his homeland and promises to make him a great nation.',
    keyPassages: ['Genesis 12:1-9', 'Genesis 15:1-21'],
    relatedPeople: ['Abraham', 'Sarah'],
    testament: 'OT',
    theme: 'Covenant',
    era: 'Patriarchs'
  },
  {
    id: 'isaac-birth',
    title: 'Birth of Isaac',
    approximateDateRange: 'c. 1900 BCE',
    yearBCE: 1900,
    description: 'God fulfills His promise to Abraham and Sarah with the miraculous birth of Isaac.',
    keyPassages: ['Genesis 21:1-7'],
    relatedPeople: ['Abraham', 'Sarah', 'Isaac'],
    testament: 'OT',
    theme: 'Promise Fulfilled',
    era: 'Patriarchs'
  },
  {
    id: 'jacob-esau',
    title: 'Jacob and Esau',
    approximateDateRange: 'c. 1850 BCE',
    yearBCE: 1850,
    description: 'Isaac\'s twin sons are born. Jacob receives the birthright and blessing through deception.',
    keyPassages: ['Genesis 25:19-34', 'Genesis 27:1-40'],
    relatedPeople: ['Jacob', 'Esau', 'Isaac', 'Rebekah'],
    testament: 'OT',
    theme: 'Family Conflict',
    era: 'Patriarchs'
  },
  {
    id: 'joseph-egypt',
    title: 'Joseph Sold into Egypt',
    approximateDateRange: 'c. 1700 BCE',
    yearBCE: 1700,
    description: 'Joseph is sold into slavery by his brothers but rises to become second-in-command of Egypt.',
    keyPassages: ['Genesis 37:1-36', 'Genesis 41:1-57'],
    relatedPeople: ['Joseph', 'Jacob\'s sons', 'Pharaoh'],
    testament: 'OT',
    theme: 'Providence',
    era: 'Patriarchs'
  },

  // Exodus and Wilderness
  {
    id: 'exodus',
    title: 'The Exodus',
    approximateDateRange: 'c. 1446 BCE',
    yearBCE: 1446,
    description: 'God delivers Israel from slavery in Egypt through Moses, displaying His power through plagues.',
    keyPassages: ['Exodus 12:31-42', 'Exodus 14:1-31'],
    relatedPeople: ['Moses', 'Aaron', 'Pharaoh'],
    testament: 'OT',
    theme: 'Deliverance',
    era: 'Exodus and Wilderness'
  },
  {
    id: 'ten-commandments',
    title: 'Ten Commandments Given',
    approximateDateRange: 'c. 1445 BCE',
    yearBCE: 1445,
    description: 'God gives Moses the Ten Commandments and the Law at Mount Sinai.',
    keyPassages: ['Exodus 20:1-17', 'Exodus 24:12-18'],
    relatedPeople: ['Moses', 'Israelites'],
    testament: 'OT',
    theme: 'Law and Covenant',
    era: 'Exodus and Wilderness'
  },
  {
    id: 'golden-calf',
    title: 'The Golden Calf',
    approximateDateRange: 'c. 1445 BCE',
    yearBCE: 1445,
    description: 'While Moses is on Mount Sinai, the Israelites create and worship a golden calf.',
    keyPassages: ['Exodus 32:1-35'],
    relatedPeople: ['Aaron', 'Israelites', 'Moses'],
    testament: 'OT',
    theme: 'Idolatry',
    era: 'Exodus and Wilderness'
  },
  {
    id: 'wilderness-wandering',
    title: 'Wilderness Wandering',
    approximateDateRange: 'c. 1445-1406 BCE',
    yearBCE: 1425,
    description: 'Israel wanders in the wilderness for 40 years due to their unbelief.',
    keyPassages: ['Numbers 14:1-45'],
    relatedPeople: ['Moses', 'Israelites'],
    testament: 'OT',
    theme: 'Judgment and Testing',
    era: 'Exodus and Wilderness'
  },

  // Conquest and Judges
  {
    id: 'jericho',
    title: 'Fall of Jericho',
    approximateDateRange: 'c. 1406 BCE',
    yearBCE: 1406,
    description: 'Joshua leads Israel in conquering Jericho, the first city in the Promised Land.',
    keyPassages: ['Joshua 6:1-27'],
    relatedPeople: ['Joshua', 'Rahab'],
    testament: 'OT',
    theme: 'Conquest',
    era: 'Conquest and Judges'
  },
  {
    id: 'judges-period',
    title: 'Period of the Judges',
    approximateDateRange: 'c. 1375-1050 BCE',
    yearBCE: 1200,
    description: 'Israel is led by judges including Deborah, Gideon, and Samson in cycles of sin and deliverance.',
    keyPassages: ['Judges 2:16-19'],
    relatedPeople: ['Deborah', 'Gideon', 'Samson'],
    testament: 'OT',
    theme: 'Cycle of Sin',
    era: 'Conquest and Judges'
  },
  {
    id: 'ruth',
    title: 'Story of Ruth',
    approximateDateRange: 'c. 1100 BCE',
    yearBCE: 1100,
    description: 'Ruth, a Moabite widow, shows loyalty to Naomi and becomes part of David\'s lineage.',
    keyPassages: ['Ruth 1:1-4:22'],
    relatedPeople: ['Ruth', 'Naomi', 'Boaz'],
    testament: 'OT',
    theme: 'Loyalty and Redemption',
    era: 'Conquest and Judges'
  },

  // United Monarchy
  {
    id: 'samuel-anoints-saul',
    title: 'Saul Anointed King',
    approximateDateRange: 'c. 1050 BCE',
    yearBCE: 1050,
    description: 'Samuel anoints Saul as the first king of Israel at the people\'s request.',
    keyPassages: ['1 Samuel 10:1-27'],
    relatedPeople: ['Samuel', 'Saul'],
    testament: 'OT',
    theme: 'Monarchy Begins',
    era: 'United Monarchy'
  },
  {
    id: 'david-anointed',
    title: 'David Anointed',
    approximateDateRange: 'c. 1025 BCE',
    yearBCE: 1025,
    description: 'Samuel anoints young David as the future king while Saul still reigns.',
    keyPassages: ['1 Samuel 16:1-13'],
    relatedPeople: ['Samuel', 'David', 'Jesse'],
    testament: 'OT',
    theme: 'God\'s Choice',
    era: 'United Monarchy'
  },
  {
    id: 'david-goliath',
    title: 'David and Goliath',
    approximateDateRange: 'c. 1020 BCE',
    yearBCE: 1020,
    description: 'Young David defeats the giant Goliath with a sling and stone, trusting in God.',
    keyPassages: ['1 Samuel 17:1-58'],
    relatedPeople: ['David', 'Goliath', 'Saul'],
    testament: 'OT',
    theme: 'Faith and Victory',
    era: 'United Monarchy'
  },
  {
    id: 'david-king',
    title: 'David Becomes King',
    approximateDateRange: 'c. 1010 BCE',
    yearBCE: 1010,
    description: 'David becomes king of Judah and later all Israel, establishing Jerusalem as the capital.',
    keyPassages: ['2 Samuel 5:1-12'],
    relatedPeople: ['David'],
    testament: 'OT',
    theme: 'Kingdom Established',
    era: 'United Monarchy'
  },
  {
    id: 'davidic-covenant',
    title: 'Davidic Covenant',
    approximateDateRange: 'c. 1000 BCE',
    yearBCE: 1000,
    description: 'God promises David an eternal dynasty, pointing forward to the Messiah.',
    keyPassages: ['2 Samuel 7:1-17'],
    relatedPeople: ['David', 'Nathan'],
    testament: 'OT',
    theme: 'Messianic Promise',
    era: 'United Monarchy'
  },
  {
    id: 'solomon-temple',
    title: 'Solomon Builds Temple',
    approximateDateRange: 'c. 960 BCE',
    yearBCE: 960,
    description: 'King Solomon builds the magnificent temple in Jerusalem as God\'s dwelling place.',
    keyPassages: ['1 Kings 6:1-38', '1 Kings 8:1-66'],
    relatedPeople: ['Solomon'],
    testament: 'OT',
    theme: 'Temple and Worship',
    era: 'United Monarchy'
  },

  // Divided Kingdom
  {
    id: 'kingdom-divided',
    title: 'Kingdom Divides',
    approximateDateRange: 'c. 930 BCE',
    yearBCE: 930,
    description: 'After Solomon\'s death, the kingdom splits into Israel (North) and Judah (South).',
    keyPassages: ['1 Kings 12:1-24'],
    relatedPeople: ['Rehoboam', 'Jeroboam'],
    testament: 'OT',
    theme: 'Division',
    era: 'Divided Kingdom'
  },
  {
    id: 'elijah-carmel',
    title: 'Elijah on Mount Carmel',
    approximateDateRange: 'c. 860 BCE',
    yearBCE: 860,
    description: 'Elijah challenges the prophets of Baal, and God demonstrates His power with fire from heaven.',
    keyPassages: ['1 Kings 18:1-46'],
    relatedPeople: ['Elijah', 'Ahab', 'Jezebel'],
    testament: 'OT',
    theme: 'True God vs Idols',
    era: 'Divided Kingdom'
  },
  {
    id: 'elisha-miracles',
    title: 'Elisha\'s Ministry',
    approximateDateRange: 'c. 850 BCE',
    yearBCE: 850,
    description: 'Elisha succeeds Elijah and performs many miracles throughout Israel.',
    keyPassages: ['2 Kings 2:1-25', '2 Kings 4:1-44'],
    relatedPeople: ['Elisha', 'Elijah'],
    testament: 'OT',
    theme: 'Prophetic Ministry',
    era: 'Divided Kingdom'
  },
  {
    id: 'jonah-nineveh',
    title: 'Jonah and Nineveh',
    approximateDateRange: 'c. 760 BCE',
    yearBCE: 760,
    description: 'Jonah reluctantly preaches to Nineveh, and the city repents.',
    keyPassages: ['Jonah 1:1-4:11'],
    relatedPeople: ['Jonah'],
    testament: 'OT',
    theme: 'Repentance and Mercy',
    era: 'Divided Kingdom'
  },
  {
    id: 'israel-falls',
    title: 'Fall of Israel (Northern Kingdom)',
    approximateDateRange: 'c. 722 BCE',
    yearBCE: 722,
    description: 'The Assyrians conquer the Northern Kingdom and exile the ten tribes.',
    keyPassages: ['2 Kings 17:1-23'],
    relatedPeople: ['Hoshea'],
    testament: 'OT',
    theme: 'Judgment',
    era: 'Divided Kingdom'
  },
  {
    id: 'isaiah-ministry',
    title: 'Isaiah\'s Prophecies',
    approximateDateRange: 'c. 700 BCE',
    yearBCE: 700,
    description: 'Isaiah prophesies about the coming Messiah and the future restoration of Israel.',
    keyPassages: ['Isaiah 7:14', 'Isaiah 9:6-7', 'Isaiah 53:1-12'],
    relatedPeople: ['Isaiah'],
    testament: 'OT',
    theme: 'Messianic Prophecy',
    era: 'Divided Kingdom'
  },

  // Exile and Return
  {
    id: 'judah-falls',
    title: 'Fall of Judah',
    approximateDateRange: 'c. 586 BCE',
    yearBCE: 586,
    description: 'Babylon conquers Jerusalem, destroys the temple, and exiles the people of Judah.',
    keyPassages: ['2 Kings 25:1-21', 'Jeremiah 52:1-30'],
    relatedPeople: ['Nebuchadnezzar', 'Zedekiah'],
    testament: 'OT',
    theme: 'Exile',
    era: 'Exile and Return'
  },
  {
    id: 'daniel-lions',
    title: 'Daniel in Lions\' Den',
    approximateDateRange: 'c. 540 BCE',
    yearBCE: 540,
    description: 'Daniel is thrown into a lions\' den for praying to God but is miraculously protected.',
    keyPassages: ['Daniel 6:1-28'],
    relatedPeople: ['Daniel', 'Darius'],
    testament: 'OT',
    theme: 'Faithfulness',
    era: 'Exile and Return'
  },
  {
    id: 'return-from-exile',
    title: 'Return from Exile',
    approximateDateRange: 'c. 538 BCE',
    yearBCE: 538,
    description: 'King Cyrus of Persia allows the Jews to return to Jerusalem and rebuild the temple.',
    keyPassages: ['Ezra 1:1-11', 'Isaiah 44:28'],
    relatedPeople: ['Cyrus', 'Zerubbabel'],
    testament: 'OT',
    theme: 'Restoration',
    era: 'Exile and Return'
  },
  {
    id: 'temple-rebuilt',
    title: 'Temple Rebuilt',
    approximateDateRange: 'c. 516 BCE',
    yearBCE: 516,
    description: 'The Second Temple is completed despite opposition and discouragement.',
    keyPassages: ['Ezra 6:13-22'],
    relatedPeople: ['Zerubbabel', 'Joshua (high priest)', 'Haggai', 'Zechariah'],
    testament: 'OT',
    theme: 'Worship Restored',
    era: 'Exile and Return'
  },
  {
    id: 'nehemiah-walls',
    title: 'Nehemiah Rebuilds Walls',
    approximateDateRange: 'c. 445 BCE',
    yearBCE: 445,
    description: 'Nehemiah leads the effort to rebuild Jerusalem\'s walls despite fierce opposition.',
    keyPassages: ['Nehemiah 1:1-6:19'],
    relatedPeople: ['Nehemiah'],
    testament: 'OT',
    theme: 'Rebuilding',
    era: 'Exile and Return'
  },
  {
    id: 'esther',
    title: 'Esther Saves Her People',
    approximateDateRange: 'c. 470 BCE',
    yearBCE: 470,
    description: 'Queen Esther courageously intervenes to save the Jewish people from genocide.',
    keyPassages: ['Esther 4:1-9:32'],
    relatedPeople: ['Esther', 'Mordecai', 'Haman'],
    testament: 'OT',
    theme: 'Divine Providence',
    era: 'Exile and Return'
  },

  // Intertestamental Period
  {
    id: 'silent-years',
    title: 'Intertestamental Period',
    approximateDateRange: 'c. 400-5 BCE',
    yearBCE: 200,
    description: 'The "silent years" between Malachi and the birth of Christ, including Greek and Roman rule.',
    keyPassages: [],
    relatedPeople: [],
    testament: 'Between',
    theme: 'Waiting',
    era: 'Intertestamental'
  },

  // New Testament - Life of Christ
  {
    id: 'jesus-birth',
    title: 'Birth of Jesus',
    approximateDateRange: 'c. 5-4 BCE',
    yearBCE: -4, // Negative for BCE
    description: 'Jesus Christ is born in Bethlehem, fulfilling messianic prophecies.',
    keyPassages: ['Matthew 1:18-2:12', 'Luke 2:1-20'],
    relatedPeople: ['Jesus', 'Mary', 'Joseph'],
    testament: 'NT',
    theme: 'Incarnation',
    era: 'Life of Christ'
  },
  {
    id: 'jesus-baptism',
    title: 'Baptism of Jesus',
    approximateDateRange: 'c. 27 CE',
    yearBCE: 27,
    description: 'Jesus is baptized by John the Baptist, beginning His public ministry.',
    keyPassages: ['Matthew 3:13-17', 'Mark 1:9-11'],
    relatedPeople: ['Jesus', 'John the Baptist'],
    testament: 'NT',
    theme: 'Ministry Begins',
    era: 'Life of Christ'
  },
  {
    id: 'sermon-mount',
    title: 'Sermon on the Mount',
    approximateDateRange: 'c. 28 CE',
    yearBCE: 28,
    description: 'Jesus delivers the Sermon on the Mount, teaching about the kingdom of God.',
    keyPassages: ['Matthew 5:1-7:29'],
    relatedPeople: ['Jesus', 'Disciples'],
    testament: 'NT',
    theme: 'Kingdom Teaching',
    era: 'Life of Christ'
  },
  {
    id: 'feeding-5000',
    title: 'Feeding the 5000',
    approximateDateRange: 'c. 29 CE',
    yearBCE: 29,
    description: 'Jesus miraculously feeds over 5,000 people with five loaves and two fish.',
    keyPassages: ['Matthew 14:13-21', 'John 6:1-15'],
    relatedPeople: ['Jesus', 'Disciples'],
    testament: 'NT',
    theme: 'Miracles',
    era: 'Life of Christ'
  },
  {
    id: 'transfiguration',
    title: 'Transfiguration',
    approximateDateRange: 'c. 29 CE',
    yearBCE: 29,
    description: 'Jesus is transfigured before Peter, James, and John, revealing His divine glory.',
    keyPassages: ['Matthew 17:1-13', 'Mark 9:2-13'],
    relatedPeople: ['Jesus', 'Peter', 'James', 'John', 'Moses', 'Elijah'],
    testament: 'NT',
    theme: 'Divine Glory',
    era: 'Life of Christ'
  },
  {
    id: 'triumphal-entry',
    title: 'Triumphal Entry',
    approximateDateRange: 'c. 30 CE (Sunday)',
    yearBCE: 30,
    description: 'Jesus enters Jerusalem on a donkey, hailed as king by the crowds.',
    keyPassages: ['Matthew 21:1-11', 'John 12:12-19'],
    relatedPeople: ['Jesus', 'Disciples'],
    testament: 'NT',
    theme: 'Messiah Revealed',
    era: 'Life of Christ'
  },
  {
    id: 'last-supper',
    title: 'Last Supper',
    approximateDateRange: 'c. 30 CE (Thursday)',
    yearBCE: 30,
    description: 'Jesus shares the Passover meal with His disciples and institutes the Lord\'s Supper.',
    keyPassages: ['Matthew 26:17-30', 'John 13:1-17:26'],
    relatedPeople: ['Jesus', 'Twelve Apostles'],
    testament: 'NT',
    theme: 'New Covenant',
    era: 'Life of Christ'
  },
  {
    id: 'crucifixion',
    title: 'Crucifixion',
    approximateDateRange: 'c. 30 CE (Friday)',
    yearBCE: 30,
    description: 'Jesus is crucified on a cross, dying for the sins of humanity.',
    keyPassages: ['Matthew 27:32-56', 'John 19:16-37'],
    relatedPeople: ['Jesus', 'Mary', 'John', 'Pilate'],
    testament: 'NT',
    theme: 'Atonement',
    era: 'Life of Christ'
  },
  {
    id: 'resurrection',
    title: 'Resurrection',
    approximateDateRange: 'c. 30 CE (Sunday)',
    yearBCE: 30,
    description: 'Jesus rises from the dead, conquering sin and death.',
    keyPassages: ['Matthew 28:1-10', 'John 20:1-18'],
    relatedPeople: ['Jesus', 'Mary Magdalene', 'Angels'],
    testament: 'NT',
    theme: 'Victory',
    era: 'Life of Christ'
  },
  {
    id: 'ascension',
    title: 'Ascension',
    approximateDateRange: 'c. 30 CE',
    yearBCE: 30,
    description: 'Jesus ascends to heaven, promising to return and send the Holy Spirit.',
    keyPassages: ['Acts 1:1-11'],
    relatedPeople: ['Jesus', 'Apostles'],
    testament: 'NT',
    theme: 'Exaltation',
    era: 'Life of Christ'
  },

  // Early Church
  {
    id: 'pentecost',
    title: 'Day of Pentecost',
    approximateDateRange: 'c. 30 CE',
    yearBCE: 30,
    description: 'The Holy Spirit descends on the disciples, and the church is born.',
    keyPassages: ['Acts 2:1-47'],
    relatedPeople: ['Peter', 'Apostles'],
    testament: 'NT',
    theme: 'Church Birth',
    era: 'Early Church'
  },
  {
    id: 'stephen-martyred',
    title: 'Stephen Martyred',
    approximateDateRange: 'c. 34 CE',
    yearBCE: 34,
    description: 'Stephen becomes the first Christian martyr, dying for his faith.',
    keyPassages: ['Acts 7:1-60'],
    relatedPeople: ['Stephen', 'Saul/Paul'],
    testament: 'NT',
    theme: 'Martyrdom',
    era: 'Early Church'
  },
  {
    id: 'paul-conversion',
    title: 'Paul\'s Conversion',
    approximateDateRange: 'c. 35 CE',
    yearBCE: 35,
    description: 'Saul (Paul) encounters Jesus on the road to Damascus and becomes a follower.',
    keyPassages: ['Acts 9:1-19'],
    relatedPeople: ['Saul/Paul', 'Ananias'],
    testament: 'NT',
    theme: 'Conversion',
    era: 'Early Church'
  },
  {
    id: 'cornelius',
    title: 'Peter and Cornelius',
    approximateDateRange: 'c. 40 CE',
    yearBCE: 40,
    description: 'Peter preaches to the Gentile Cornelius, showing the gospel is for all people.',
    keyPassages: ['Acts 10:1-48'],
    relatedPeople: ['Peter', 'Cornelius'],
    testament: 'NT',
    theme: 'Gospel to Gentiles',
    era: 'Early Church'
  },
  {
    id: 'paul-first-journey',
    title: 'Paul\'s First Missionary Journey',
    approximateDateRange: 'c. 46-48 CE',
    yearBCE: 47,
    description: 'Paul and Barnabas embark on the first missionary journey, spreading the gospel.',
    keyPassages: ['Acts 13:1-14:28'],
    relatedPeople: ['Paul', 'Barnabas'],
    testament: 'NT',
    theme: 'Missions',
    era: 'Early Church'
  },
  {
    id: 'jerusalem-council',
    title: 'Jerusalem Council',
    approximateDateRange: 'c. 49 CE',
    yearBCE: 49,
    description: 'Church leaders meet to decide Gentiles don\'t need to follow Jewish law to be saved.',
    keyPassages: ['Acts 15:1-35'],
    relatedPeople: ['Peter', 'Paul', 'James'],
    testament: 'NT',
    theme: 'Church Unity',
    era: 'Early Church'
  },
  {
    id: 'paul-third-journey',
    title: 'Paul\'s Third Missionary Journey',
    approximateDateRange: 'c. 53-57 CE',
    yearBCE: 55,
    description: 'Paul strengthens churches and writes letters including Romans and Corinthians.',
    keyPassages: ['Acts 18:23-21:17'],
    relatedPeople: ['Paul'],
    testament: 'NT',
    theme: 'Church Growth',
    era: 'Early Church'
  },
  {
    id: 'paul-rome',
    title: 'Paul Imprisoned in Rome',
    approximateDateRange: 'c. 60-62 CE',
    yearBCE: 61,
    description: 'Paul is imprisoned in Rome but continues to preach and write letters.',
    keyPassages: ['Acts 28:11-31', 'Philippians 1:12-26'],
    relatedPeople: ['Paul'],
    testament: 'NT',
    theme: 'Perseverance',
    era: 'Early Church'
  },
  {
    id: 'temple-destroyed',
    title: 'Temple Destroyed',
    approximateDateRange: 'c. 70 CE',
    yearBCE: 70,
    description: 'The Romans destroy the Second Temple in Jerusalem, as Jesus prophesied.',
    keyPassages: ['Matthew 24:1-2', 'Luke 21:5-6'],
    relatedPeople: [],
    testament: 'NT',
    theme: 'Prophecy Fulfilled',
    era: 'Early Church'
  },
  {
    id: 'john-revelation',
    title: 'John Writes Revelation',
    approximateDateRange: 'c. 95 CE',
    yearBCE: 95,
    description: 'The apostle John receives visions of the end times and writes the book of Revelation.',
    keyPassages: ['Revelation 1:1-20'],
    relatedPeople: ['John'],
    testament: 'NT',
    theme: 'End Times',
    era: 'Early Church'
  }
];

// Helper function to get events by testament
export const getEventsByTestament = (testament) => {
  if (testament === 'All') return bibleEvents;
  return bibleEvents.filter(event => event.testament === testament);
};

// Helper function to get events by theme
export const getEventsByTheme = (theme) => {
  if (theme === 'All') return bibleEvents;
  return bibleEvents.filter(event => event.theme === theme);
};

// Helper function to get all unique themes
export const getAllThemes = () => {
  const themes = new Set(bibleEvents.map(event => event.theme));
  return ['All', ...Array.from(themes).sort()];
};

// Helper function to get all unique eras
export const getAllEras = () => {
  const eras = [];
  const seen = new Set();

  bibleEvents.forEach(event => {
    if (!seen.has(event.era)) {
      seen.add(event.era);
      eras.push(event.era);
    }
  });

  return eras;
};

// Helper function to get events by era
export const getEventsByEra = (era) => {
  return bibleEvents.filter(event => event.era === era);
};
