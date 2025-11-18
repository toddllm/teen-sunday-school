import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Seed script to populate the database with Bible reference game questions
 * Run with: npx ts-node src/scripts/seed-reference-questions.ts
 */

const sampleQuestions = [
  // John - Easy
  {
    verseReference: 'John 3:16',
    displayText: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    correctAnswer: 'John 3:16',
    distractorRefs: ['John 3:17', 'Romans 3:16', '1 John 3:16'],
    book: 'John',
    difficulty: 'easy',
  },
  {
    verseReference: 'John 14:6',
    displayText: 'I am the way and the truth and the life. No one comes to the Father except through me.',
    correctAnswer: 'John 14:6',
    distractorRefs: ['John 15:6', 'John 4:6', 'John 10:10'],
    book: 'John',
    difficulty: 'easy',
  },
  {
    verseReference: 'John 1:1',
    displayText: 'In the beginning was the Word, and the Word was with God, and the Word was God.',
    correctAnswer: 'John 1:1',
    distractorRefs: ['Genesis 1:1', 'John 1:14', 'Revelation 1:1'],
    book: 'John',
    difficulty: 'medium',
  },

  // Psalms - Easy/Medium
  {
    verseReference: 'Psalm 23:1',
    displayText: 'The LORD is my shepherd, I lack nothing.',
    correctAnswer: 'Psalm 23:1',
    distractorRefs: ['Psalm 24:1', 'Psalm 27:1', 'Psalm 100:1'],
    book: 'Psalms',
    difficulty: 'easy',
  },
  {
    verseReference: 'Psalm 46:1',
    displayText: 'God is our refuge and strength, an ever-present help in trouble.',
    correctAnswer: 'Psalm 46:1',
    distractorRefs: ['Psalm 46:10', 'Psalm 91:1', 'Psalm 27:1'],
    book: 'Psalms',
    difficulty: 'medium',
  },
  {
    verseReference: 'Psalm 119:105',
    displayText: 'Your word is a lamp for my feet, a light on my path.',
    correctAnswer: 'Psalm 119:105',
    distractorRefs: ['Psalm 119:11', 'Psalm 19:7', 'Proverbs 6:23'],
    book: 'Psalms',
    difficulty: 'medium',
  },

  // Proverbs - Medium
  {
    verseReference: 'Proverbs 3:5-6',
    displayText: 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
    correctAnswer: 'Proverbs 3:5-6',
    distractorRefs: ['Proverbs 3:7-8', 'Proverbs 4:5-6', 'Psalm 37:5'],
    book: 'Proverbs',
    difficulty: 'medium',
  },
  {
    verseReference: 'Proverbs 22:6',
    displayText: 'Start children off on the way they should go, and even when they are old they will not turn from it.',
    correctAnswer: 'Proverbs 22:6',
    distractorRefs: ['Proverbs 22:15', 'Proverbs 29:15', 'Deuteronomy 6:6'],
    book: 'Proverbs',
    difficulty: 'medium',
  },

  // Romans - Easy/Medium
  {
    verseReference: 'Romans 8:28',
    displayText: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
    correctAnswer: 'Romans 8:28',
    distractorRefs: ['Romans 8:38', 'Romans 12:2', 'Philippians 4:13'],
    book: 'Romans',
    difficulty: 'easy',
  },
  {
    verseReference: 'Romans 12:2',
    displayText: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind.',
    correctAnswer: 'Romans 12:2',
    distractorRefs: ['Romans 12:1', 'Romans 8:2', '2 Corinthians 5:17'],
    book: 'Romans',
    difficulty: 'medium',
  },
  {
    verseReference: 'Romans 3:23',
    displayText: 'For all have sinned and fall short of the glory of God.',
    correctAnswer: 'Romans 3:23',
    distractorRefs: ['Romans 6:23', 'Romans 5:8', '1 John 1:8'],
    book: 'Romans',
    difficulty: 'easy',
  },

  // Philippians - Easy/Medium
  {
    verseReference: 'Philippians 4:13',
    displayText: 'I can do all this through him who gives me strength.',
    correctAnswer: 'Philippians 4:13',
    distractorRefs: ['Philippians 4:6', '2 Corinthians 12:9', 'Isaiah 40:31'],
    book: 'Philippians',
    difficulty: 'easy',
  },
  {
    verseReference: 'Philippians 4:6-7',
    displayText: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.',
    correctAnswer: 'Philippians 4:6-7',
    distractorRefs: ['Philippians 4:4-5', '1 Peter 5:7', 'Matthew 6:25'],
    book: 'Philippians',
    difficulty: 'medium',
  },

  // Ephesians - Medium
  {
    verseReference: 'Ephesians 2:8-9',
    displayText: 'For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God—not by works.',
    correctAnswer: 'Ephesians 2:8-9',
    distractorRefs: ['Ephesians 2:10', 'Titus 3:5', 'Romans 3:24'],
    book: 'Ephesians',
    difficulty: 'medium',
  },
  {
    verseReference: 'Ephesians 6:10',
    displayText: 'Finally, be strong in the Lord and in his mighty power.',
    correctAnswer: 'Ephesians 6:10',
    distractorRefs: ['Ephesians 6:11', 'Ephesians 3:16', 'Joshua 1:9'],
    book: 'Ephesians',
    difficulty: 'medium',
  },

  // Matthew - Medium
  {
    verseReference: 'Matthew 5:16',
    displayText: 'Let your light shine before others, that they may see your good deeds and glorify your Father in heaven.',
    correctAnswer: 'Matthew 5:16',
    distractorRefs: ['Matthew 5:14', 'Matthew 6:1', 'John 8:12'],
    book: 'Matthew',
    difficulty: 'medium',
  },
  {
    verseReference: 'Matthew 6:33',
    displayText: 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.',
    correctAnswer: 'Matthew 6:33',
    distractorRefs: ['Matthew 6:34', 'Matthew 7:7', 'Luke 12:31'],
    book: 'Matthew',
    difficulty: 'medium',
  },

  // Genesis - Medium/Hard
  {
    verseReference: 'Genesis 1:1',
    displayText: 'In the beginning God created the heavens and the earth.',
    correctAnswer: 'Genesis 1:1',
    distractorRefs: ['Genesis 1:2', 'John 1:1', 'Hebrews 11:3'],
    book: 'Genesis',
    difficulty: 'easy',
  },
  {
    verseReference: 'Genesis 1:27',
    displayText: 'So God created mankind in his own image, in the image of God he created them; male and female he created them.',
    correctAnswer: 'Genesis 1:27',
    distractorRefs: ['Genesis 2:7', 'Genesis 1:26', 'Genesis 5:1'],
    book: 'Genesis',
    difficulty: 'hard',
  },

  // 1 Corinthians - Medium
  {
    verseReference: '1 Corinthians 13:4-5',
    displayText: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud.',
    correctAnswer: '1 Corinthians 13:4-5',
    distractorRefs: ['1 Corinthians 13:1-2', '1 Corinthians 16:14', '1 John 4:8'],
    book: '1 Corinthians',
    difficulty: 'medium',
  },
  {
    verseReference: '1 Corinthians 10:13',
    displayText: 'No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear.',
    correctAnswer: '1 Corinthians 10:13',
    distractorRefs: ['1 Corinthians 10:12', 'James 1:12', 'Hebrews 4:15'],
    book: '1 Corinthians',
    difficulty: 'hard',
  },

  // Isaiah - Medium/Hard
  {
    verseReference: 'Isaiah 40:31',
    displayText: 'But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary.',
    correctAnswer: 'Isaiah 40:31',
    distractorRefs: ['Isaiah 40:28', 'Isaiah 41:10', 'Psalm 103:5'],
    book: 'Isaiah',
    difficulty: 'medium',
  },
  {
    verseReference: 'Isaiah 53:5',
    displayText: 'But he was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him.',
    correctAnswer: 'Isaiah 53:5',
    distractorRefs: ['Isaiah 53:6', '1 Peter 2:24', 'Romans 5:8'],
    book: 'Isaiah',
    difficulty: 'hard',
  },

  // James - Medium
  {
    verseReference: 'James 1:2-3',
    displayText: 'Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.',
    correctAnswer: 'James 1:2-3',
    distractorRefs: ['James 1:12', '1 Peter 1:6-7', 'Romans 5:3'],
    book: 'James',
    difficulty: 'medium',
  },
  {
    verseReference: 'James 4:7',
    displayText: 'Submit yourselves, then, to God. Resist the devil, and he will flee from you.',
    correctAnswer: 'James 4:7',
    distractorRefs: ['James 4:8', '1 Peter 5:8', 'Ephesians 6:11'],
    book: 'James',
    difficulty: 'medium',
  },

  // Jeremiah - Hard
  {
    verseReference: 'Jeremiah 29:11',
    displayText: 'For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future.',
    correctAnswer: 'Jeremiah 29:11',
    distractorRefs: ['Jeremiah 29:13', 'Jeremiah 33:3', 'Proverbs 3:5-6'],
    book: 'Jeremiah',
    difficulty: 'medium',
  },

  // Hebrews - Hard
  {
    verseReference: 'Hebrews 11:1',
    displayText: 'Now faith is confidence in what we hope for and assurance about what we do not see.',
    correctAnswer: 'Hebrews 11:1',
    distractorRefs: ['Hebrews 11:6', '2 Corinthians 5:7', 'Romans 10:17'],
    book: 'Hebrews',
    difficulty: 'hard',
  },
  {
    verseReference: 'Hebrews 12:1-2',
    displayText: 'Therefore, since we are surrounded by such a great cloud of witnesses, let us throw off everything that hinders and the sin that so easily entangles. And let us run with perseverance the race marked out for us.',
    correctAnswer: 'Hebrews 12:1-2',
    distractorRefs: ['Hebrews 12:11', '1 Corinthians 9:24', 'Philippians 3:14'],
    book: 'Hebrews',
    difficulty: 'hard',
  },

  // 2 Timothy - Medium
  {
    verseReference: '2 Timothy 3:16-17',
    displayText: 'All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness.',
    correctAnswer: '2 Timothy 3:16-17',
    distractorRefs: ['2 Timothy 2:15', '2 Peter 1:21', 'Psalm 119:105'],
    book: '2 Timothy',
    difficulty: 'medium',
  },

  // Galatians - Medium
  {
    verseReference: 'Galatians 5:22-23',
    displayText: 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.',
    correctAnswer: 'Galatians 5:22-23',
    distractorRefs: ['Galatians 5:16', 'Ephesians 5:9', 'Colossians 3:12'],
    book: 'Galatians',
    difficulty: 'medium',
  },
];

async function seedQuestions() {
  try {
    logger.info('Starting to seed Bible reference questions...');

    // Clear existing questions (optional - comment out if you want to keep existing)
    await prisma.guessReferenceQuestion.deleteMany({});
    logger.info('Cleared existing questions');

    // Insert new questions
    let count = 0;
    for (const question of sampleQuestions) {
      await prisma.guessReferenceQuestion.create({
        data: question,
      });
      count++;
    }

    logger.info(`✓ Successfully seeded ${count} Bible reference questions`);

    // Display summary
    const byDifficulty = await prisma.guessReferenceQuestion.groupBy({
      by: ['difficulty'],
      _count: true,
    });

    const byBook = await prisma.guessReferenceQuestion.groupBy({
      by: ['book'],
      _count: true,
    });

    logger.info('\nBreakdown by difficulty:');
    byDifficulty.forEach((item) => {
      logger.info(`  ${item.difficulty}: ${item._count} questions`);
    });

    logger.info('\nBreakdown by book:');
    byBook.forEach((item) => {
      logger.info(`  ${item.book}: ${item._count} questions`);
    });

    await prisma.$disconnect();
  } catch (error) {
    logger.error('Error seeding questions:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run the seed function
seedQuestions();
