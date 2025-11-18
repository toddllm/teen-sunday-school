const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ReadingPlan = require('../models/ReadingPlan');
const DailyVerse = require('../models/DailyVerse');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const samplePlans = [
  {
    name: 'Gospel of John - 21 Days',
    description: 'Journey through the Gospel of John and discover who Jesus is',
    duration: 21,
    category: 'gospels',
    difficulty: 'beginner',
    days: [
      {
        dayNumber: 1,
        title: 'The Word Became Flesh',
        readings: [{ reference: 'John 1:1-18', book: 'John', chapter: 1, verses: '1-18' }],
        reflection: 'Consider how Jesus is described as the Word who was with God and was God.',
        questions: ['What does it mean that Jesus is the Word?', 'How does this chapter describe Jesus\' relationship with God?']
      },
      {
        dayNumber: 2,
        title: 'John the Baptist Testifies',
        readings: [{ reference: 'John 1:19-34', book: 'John', chapter: 1, verses: '19-34' }],
        reflection: 'John the Baptist points people to Jesus as the Lamb of God.',
        questions: ['Why did John the Baptist say he came?', 'What does "Lamb of God" mean?']
      },
      {
        dayNumber: 3,
        title: 'Jesus Calls His First Disciples',
        readings: [{ reference: 'John 1:35-51', book: 'John', chapter: 1, verses: '35-51' }],
        reflection: 'See how Jesus calls ordinary people to follow Him.',
        questions: ['How did the disciples respond to Jesus\' call?', 'What can we learn about following Jesus?']
      }
      // Additional days would be added in a full implementation
    ],
    isPublic: true
  },
  {
    name: 'Psalms of Praise - 14 Days',
    description: 'Explore the songs of worship and praise in the Psalms',
    duration: 14,
    category: 'wisdom',
    difficulty: 'beginner',
    days: [
      {
        dayNumber: 1,
        title: 'The Lord is My Shepherd',
        readings: [{ reference: 'Psalm 23', book: 'Psalms', chapter: 23, verses: '1-6' }],
        reflection: 'Reflect on God as your shepherd and provider.',
        questions: ['What does it mean that the Lord is your shepherd?', 'How does this psalm comfort you?']
      },
      {
        dayNumber: 2,
        title: 'Create in Me a Clean Heart',
        readings: [{ reference: 'Psalm 51', book: 'Psalms', chapter: 51, verses: '1-17' }],
        reflection: 'David\'s prayer of repentance and restoration.',
        questions: ['What is David asking God to do?', 'How can we apply this to our lives?']
      }
    ],
    isPublic: true
  },
  {
    name: 'Life of Jesus - 30 Days',
    description: 'Walk through the major events in Jesus\' life and ministry',
    duration: 30,
    category: 'gospels',
    difficulty: 'intermediate',
    days: [
      {
        dayNumber: 1,
        title: 'The Birth of Jesus',
        readings: [
          { reference: 'Luke 2:1-20', book: 'Luke', chapter: 2, verses: '1-20' },
          { reference: 'Matthew 2:1-12', book: 'Matthew', chapter: 2, verses: '1-12' }
        ],
        reflection: 'The humble beginning of our Savior\'s earthly life.',
        questions: ['Why was Jesus born in a manger?', 'What was significant about the shepherds and wise men?']
      }
    ],
    isPublic: true
  },
  {
    name: 'Proverbs Wisdom - 31 Days',
    description: 'Gain practical wisdom for daily living from Proverbs',
    duration: 31,
    category: 'wisdom',
    difficulty: 'beginner',
    days: Array.from({ length: 31 }, (_, i) => ({
      dayNumber: i + 1,
      title: `Wisdom for Day ${i + 1}`,
      readings: [{ reference: `Proverbs ${i + 1}`, book: 'Proverbs', chapter: i + 1, verses: '1-33' }],
      reflection: 'Apply God\'s wisdom to your daily life.',
      questions: ['What stands out to you in today\'s reading?', 'How can you apply this wisdom today?']
    })),
    isPublic: true
  }
];

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await ReadingPlan.deleteMany({});
    console.log('Cleared existing reading plans');

    // Insert sample plans
    const plans = await ReadingPlan.insertMany(samplePlans);
    console.log(`Inserted ${plans.length} reading plans`);

    // Create today's verse
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await DailyVerse.findOneAndUpdate(
      { date: today },
      {
        date: today,
        reference: 'Jeremiah 29:11',
        text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
        reflection: 'God has a purpose and plan for your life. Trust in His timing and guidance.',
        theme: 'Hope and Purpose'
      },
      { upsert: true, new: true }
    );
    console.log('Created today\'s verse');

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedData();
