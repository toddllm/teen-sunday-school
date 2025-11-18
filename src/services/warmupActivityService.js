import { WARMUP_ACTIVITY_TYPES } from '../contexts/WarmupContext';

// Default warmup activities library
const WARMUP_ACTIVITIES = {
  [WARMUP_ACTIVITY_TYPES.BIBLE_TRIVIA]: [
    {
      question: "How many books are in the New Testament?",
      options: ["24", "27", "30", "33"],
      correctAnswer: 1,
      explanation: "The New Testament contains 27 books."
    },
    {
      question: "Who baptized Jesus?",
      options: ["Peter", "James", "John the Baptist", "Andrew"],
      correctAnswer: 2,
      explanation: "John the Baptist baptized Jesus in the Jordan River."
    },
    {
      question: "What was Jesus' first miracle?",
      options: ["Walking on water", "Healing the blind", "Turning water into wine", "Feeding 5000"],
      correctAnswer: 2,
      explanation: "Jesus turned water into wine at a wedding in Cana (John 2)."
    },
    {
      question: "How many disciples did Jesus have?",
      options: ["10", "12", "14", "7"],
      correctAnswer: 1,
      explanation: "Jesus had 12 disciples."
    },
    {
      question: "Who betrayed Jesus?",
      options: ["Peter", "Judas", "Thomas", "Matthew"],
      correctAnswer: 1,
      explanation: "Judas Iscariot betrayed Jesus for 30 pieces of silver."
    },
    {
      question: "On which day did God rest?",
      options: ["6th day", "7th day", "1st day", "8th day"],
      correctAnswer: 1,
      explanation: "God rested on the seventh day after creating the world."
    },
    {
      question: "Who built the ark?",
      options: ["Moses", "Abraham", "Noah", "David"],
      correctAnswer: 2,
      explanation: "Noah built the ark as God commanded."
    },
    {
      question: "What is the shortest verse in the Bible?",
      options: ["God is love", "Jesus wept", "Pray always", "Be still"],
      correctAnswer: 1,
      explanation: "John 11:35 - 'Jesus wept' is the shortest verse."
    }
  ],

  [WARMUP_ACTIVITY_TYPES.VERSE_REVIEW]: [
    {
      verse: "John 3:16",
      partialText: "For God so loved the world that he gave his ___ and ___ Son...",
      answer: ["one", "only"],
      fullVerse: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life."
    },
    {
      verse: "Philippians 4:13",
      partialText: "I can do all this through ___ who gives me ___.",
      answer: ["Christ", "strength"],
      fullVerse: "I can do all this through Christ who gives me strength."
    },
    {
      verse: "Psalm 23:1",
      partialText: "The ___ is my shepherd, I lack ___.",
      answer: ["Lord", "nothing"],
      fullVerse: "The Lord is my shepherd, I lack nothing."
    },
    {
      verse: "Proverbs 3:5-6",
      partialText: "Trust in the Lord with all your ___ and lean not on your own ___.",
      answer: ["heart", "understanding"],
      fullVerse: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight."
    }
  ],

  [WARMUP_ACTIVITY_TYPES.WORD_OF_DAY]: [
    {
      word: "Grace",
      definition: "Unmerited favor and love from God",
      bibleContext: "For it is by grace you have been saved, through faith (Ephesians 2:8)",
      discussion: "What does it mean that we can't earn God's grace?"
    },
    {
      word: "Redemption",
      definition: "Being bought back or rescued from sin",
      bibleContext: "In him we have redemption through his blood (Ephesians 1:7)",
      discussion: "How does Jesus redeem us?"
    },
    {
      word: "Covenant",
      definition: "A sacred agreement or promise between God and people",
      bibleContext: "This cup is the new covenant in my blood (Luke 22:20)",
      discussion: "What covenants has God made with humanity?"
    },
    {
      word: "Righteousness",
      definition: "Being in right relationship with God; living according to God's standards",
      bibleContext: "Seek first his kingdom and his righteousness (Matthew 6:33)",
      discussion: "How do we pursue righteousness in our daily lives?"
    }
  ],

  [WARMUP_ACTIVITY_TYPES.DISCUSSION_STARTER]: [
    {
      prompt: "If you could ask Jesus one question, what would it be?",
      followUp: "Why is that question important to you?"
    },
    {
      prompt: "What's one thing you're grateful for this week?",
      followUp: "How has God been present in that experience?"
    },
    {
      prompt: "If you could witness any Bible story firsthand, which would you choose?",
      followUp: "What do you think you'd learn from being there?"
    },
    {
      prompt: "What's one way you've seen God work in someone's life recently?",
      followUp: "How did that encourage your own faith?"
    },
    {
      prompt: "What's the biggest challenge teens face in living out their faith today?",
      followUp: "How can we support each other through these challenges?"
    },
    {
      prompt: "If you could describe God in three words, what would they be?",
      followUp: "Which Bible story best illustrates those characteristics?"
    }
  ],

  [WARMUP_ACTIVITY_TYPES.MEMORY_VERSE]: [
    {
      reference: "Philippians 4:13",
      verse: "I can do all this through Christ who gives me strength.",
      method: "repeat",
      instruction: "Let's say this together three times, getting louder each time!"
    },
    {
      reference: "Jeremiah 29:11",
      verse: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
      method: "fill-blank",
      instruction: "Can you fill in the blanks as we go through this verse?"
    },
    {
      reference: "Proverbs 3:5",
      verse: "Trust in the Lord with all your heart and lean not on your own understanding.",
      method: "motion",
      instruction: "Let's add hand motions to help remember this verse!"
    }
  ],

  [WARMUP_ACTIVITY_TYPES.REFLECTION]: [
    {
      question: "How did you see God at work in your life this past week?",
      quietTime: 60, // seconds
      sharePrompt: "Would anyone like to share their reflection?"
    },
    {
      question: "What's one thing you learned from last week's lesson that you applied this week?",
      quietTime: 45,
      sharePrompt: "Let's hear a few examples!"
    },
    {
      question: "Is there something you're struggling with that we can pray about together?",
      quietTime: 30,
      sharePrompt: "Remember, we're here to support each other."
    }
  ],

  [WARMUP_ACTIVITY_TYPES.QUICK_GAME]: [
    {
      name: "Bible Alphabet",
      instructions: "Go around the circle naming Bible characters, places, or things in alphabetical order (A-Z).",
      timeLimit: 300 // 5 minutes
    },
    {
      name: "Two Truths and a Lie (Bible Edition)",
      instructions: "Each person shares three facts about a Bible story - two true, one false. Others guess the lie!",
      timeLimit: 300
    },
    {
      name: "Bible Charades",
      instructions: "Act out a Bible story, character, or verse without speaking. Others guess what it is!",
      timeLimit: 300
    },
    {
      name: "Verse Race",
      instructions: "Split into teams. First team to find the given Bible verse in their Bibles wins!",
      timeLimit: 180
    }
  ]
};

// Generate a random activity of a specific type
export const generateActivity = (activityType) => {
  const activities = WARMUP_ACTIVITIES[activityType];
  if (!activities || activities.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * activities.length);
  return {
    id: `${activityType}-${Date.now()}-${randomIndex}`,
    type: activityType,
    ...activities[randomIndex]
  };
};

// Generate an auto-playlist based on duration and enabled activity types
export const generateAutoPlaylist = (duration, enabledActivityTypes) => {
  const targetActivityCount = Math.ceil(duration / 2); // ~2 minutes per activity
  const activities = [];

  // Ensure variety by cycling through activity types
  const shuffledTypes = [...enabledActivityTypes].sort(() => Math.random() - 0.5);

  for (let i = 0; i < targetActivityCount; i++) {
    const activityType = shuffledTypes[i % shuffledTypes.length];
    const activity = generateActivity(activityType);

    if (activity) {
      activities.push(activity);
    }
  }

  return activities;
};

// Generate a playlist from a lesson
export const generatePlaylistFromLesson = (lesson) => {
  const activities = [];

  // Add verse review from lesson scripture
  if (lesson.scripture) {
    activities.push({
      id: `verse-review-${Date.now()}`,
      type: WARMUP_ACTIVITY_TYPES.VERSE_REVIEW,
      verse: lesson.scripture,
      partialText: "Let's review today's main verse...",
      fullVerse: `Review ${lesson.scripture} before we begin the lesson.`
    });
  }

  // Add discussion starter related to lesson theme
  if (lesson.theme) {
    activities.push({
      id: `discussion-${Date.now()}`,
      type: WARMUP_ACTIVITY_TYPES.DISCUSSION_STARTER,
      prompt: `What do you already know about "${lesson.theme}"?`,
      followUp: "What questions do you have about this topic?"
    });
  }

  // Add a couple random activities
  const randomTypes = [
    WARMUP_ACTIVITY_TYPES.BIBLE_TRIVIA,
    WARMUP_ACTIVITY_TYPES.QUICK_GAME,
    WARMUP_ACTIVITY_TYPES.WORD_OF_DAY
  ];

  randomTypes.forEach(type => {
    const activity = generateActivity(type);
    if (activity) {
      activities.push(activity);
    }
  });

  return activities;
};

// Get activity type icon
export const getActivityTypeIcon = (activityType) => {
  const icons = {
    [WARMUP_ACTIVITY_TYPES.BIBLE_TRIVIA]: '❓',
    [WARMUP_ACTIVITY_TYPES.VERSE_REVIEW]: '📖',
    [WARMUP_ACTIVITY_TYPES.WORD_OF_DAY]: '📝',
    [WARMUP_ACTIVITY_TYPES.DISCUSSION_STARTER]: '💬',
    [WARMUP_ACTIVITY_TYPES.MEMORY_VERSE]: '🧠',
    [WARMUP_ACTIVITY_TYPES.QUICK_GAME]: '🎮',
    [WARMUP_ACTIVITY_TYPES.REFLECTION]: '🤔'
  };

  return icons[activityType] || '📋';
};

// Get activity type label
export const getActivityTypeLabel = (activityType) => {
  const labels = {
    [WARMUP_ACTIVITY_TYPES.BIBLE_TRIVIA]: 'Bible Trivia',
    [WARMUP_ACTIVITY_TYPES.VERSE_REVIEW]: 'Verse Review',
    [WARMUP_ACTIVITY_TYPES.WORD_OF_DAY]: 'Word of the Day',
    [WARMUP_ACTIVITY_TYPES.DISCUSSION_STARTER]: 'Discussion Starter',
    [WARMUP_ACTIVITY_TYPES.MEMORY_VERSE]: 'Memory Verse',
    [WARMUP_ACTIVITY_TYPES.QUICK_GAME]: 'Quick Game',
    [WARMUP_ACTIVITY_TYPES.REFLECTION]: 'Reflection'
  };

  return labels[activityType] || activityType;
};

// Validate activity structure
export const validateActivity = (activity) => {
  if (!activity || !activity.type) {
    return false;
  }

  // Check if activity type is valid
  if (!Object.values(WARMUP_ACTIVITY_TYPES).includes(activity.type)) {
    return false;
  }

  return true;
};

const warmupActivityService = {
  generateActivity,
  generateAutoPlaylist,
  generatePlaylistFromLesson,
  getActivityTypeIcon,
  getActivityTypeLabel,
  validateActivity,
  WARMUP_ACTIVITIES
};

export default warmupActivityService;
