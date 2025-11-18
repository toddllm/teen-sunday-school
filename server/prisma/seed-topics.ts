import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleTopics = [
  {
    name: 'Anxiety and Worry',
    description: 'Find peace and comfort in God\'s promises when facing anxiety and worry.',
    category: 'Faith & Doubt',
    tags: ['anxiety', 'worry', 'peace', 'trust', 'fear'],
    popularityRank: 10,
    isGlobal: true,
    verses: [
      { verseRef: 'Philippians 4:6-7', note: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.' },
      { verseRef: 'Matthew 6:25-34', note: 'Jesus teaches us not to worry about our lives.' },
      { verseRef: '1 Peter 5:7', note: 'Cast all your anxiety on him because he cares for you.' },
      { verseRef: 'Psalm 23:4', note: 'Even though I walk through the darkest valley, I will fear no evil.' },
    ],
  },
  {
    name: 'Identity in Christ',
    description: 'Discover who you are in Christ and the value God places on you.',
    category: 'Identity',
    tags: ['identity', 'self-worth', 'purpose', 'value'],
    popularityRank: 9,
    isGlobal: true,
    verses: [
      { verseRef: '2 Corinthians 5:17', note: 'You are a new creation in Christ.' },
      { verseRef: 'Ephesians 2:10', note: 'You are God\'s handiwork, created in Christ Jesus to do good works.' },
      { verseRef: 'Psalm 139:13-14', note: 'You are fearfully and wonderfully made.' },
      { verseRef: '1 John 3:1', note: 'See what great love the Father has lavished on us, that we should be called children of God!' },
    ],
  },
  {
    name: 'Friendship',
    description: 'Biblical wisdom on building and maintaining healthy friendships.',
    category: 'Relationships',
    tags: ['friendship', 'relationships', 'loyalty', 'trust'],
    popularityRank: 8,
    isGlobal: true,
    verses: [
      { verseRef: 'Proverbs 17:17', note: 'A friend loves at all times, and a brother is born for a time of adversity.' },
      { verseRef: 'John 15:13-15', note: 'Greater love has no one than this: to lay down one\'s life for one\'s friends.' },
      { verseRef: 'Proverbs 27:17', note: 'As iron sharpens iron, so one person sharpens another.' },
      { verseRef: 'Ecclesiastes 4:9-10', note: 'Two are better than one, because they have a good return for their labor.' },
    ],
  },
  {
    name: 'Hope',
    description: 'Find hope and encouragement in God\'s promises for the future.',
    category: 'Faith & Doubt',
    tags: ['hope', 'encouragement', 'promise', 'future'],
    popularityRank: 9,
    isGlobal: true,
    verses: [
      { verseRef: 'Jeremiah 29:11', note: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.' },
      { verseRef: 'Romans 15:13', note: 'May the God of hope fill you with all joy and peace as you trust in him.' },
      { verseRef: 'Hebrews 11:1', note: 'Now faith is confidence in what we hope for and assurance about what we do not see.' },
      { verseRef: 'Lamentations 3:22-23', note: 'Because of the Lord\'s great love we are not consumed, for his compassions never fail.' },
    ],
  },
  {
    name: 'Social Media & Technology',
    description: 'Biblical principles for navigating social media and technology wisely.',
    category: 'Modern Life',
    tags: ['social media', 'technology', 'wisdom', 'influence'],
    popularityRank: 7,
    isGlobal: true,
    verses: [
      { verseRef: 'Philippians 4:8', note: 'Whatever is true, whatever is noble, whatever is right, whatever is pure, whatever is lovely, whatever is admirable—if anything is excellent or praiseworthy—think about such things.' },
      { verseRef: 'Proverbs 4:23', note: 'Above all else, guard your heart, for everything you do flows from it.' },
      { verseRef: '1 Corinthians 10:31', note: 'So whether you eat or drink or whatever you do, do it all for the glory of God.' },
      { verseRef: 'Colossians 3:2', note: 'Set your minds on things above, not on earthly things.' },
    ],
  },
  {
    name: 'Forgiveness',
    description: 'Learn about God\'s forgiveness and how to forgive others.',
    category: 'Relationships',
    tags: ['forgiveness', 'grace', 'mercy', 'reconciliation'],
    popularityRank: 8,
    isGlobal: true,
    verses: [
      { verseRef: 'Matthew 6:14-15', note: 'For if you forgive other people when they sin against you, your heavenly Father will also forgive you.' },
      { verseRef: 'Ephesians 4:32', note: 'Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you.' },
      { verseRef: 'Colossians 3:13', note: 'Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you.' },
      { verseRef: '1 John 1:9', note: 'If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.' },
    ],
  },
  {
    name: 'Purpose and Calling',
    description: 'Discover God\'s purpose for your life and calling.',
    category: 'Identity',
    tags: ['purpose', 'calling', 'direction', 'guidance'],
    popularityRank: 9,
    isGlobal: true,
    verses: [
      { verseRef: 'Jeremiah 29:11', note: 'God has plans for your life - plans to give you hope and a future.' },
      { verseRef: 'Ephesians 2:10', note: 'We are God\'s handiwork, created in Christ Jesus to do good works.' },
      { verseRef: 'Proverbs 3:5-6', note: 'Trust in the Lord and he will direct your paths.' },
      { verseRef: 'Romans 12:2', note: 'Be transformed by the renewing of your mind. Then you will be able to test and approve what God\'s will is.' },
    ],
  },
  {
    name: 'Dating and Relationships',
    description: 'Biblical guidance for navigating dating and romantic relationships.',
    category: 'Relationships',
    tags: ['dating', 'romance', 'purity', 'relationships'],
    popularityRank: 7,
    isGlobal: true,
    verses: [
      { verseRef: '1 Corinthians 13:4-7', note: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud.' },
      { verseRef: '2 Corinthians 6:14', note: 'Do not be yoked together with unbelievers.' },
      { verseRef: '1 Thessalonians 4:3-5', note: 'It is God\'s will that you should be sanctified: that you should avoid sexual immorality.' },
      { verseRef: 'Proverbs 4:23', note: 'Above all else, guard your heart, for everything you do flows from it.' },
    ],
  },
  {
    name: 'Prayer',
    description: 'Learn how to pray effectively and develop a strong prayer life.',
    category: 'Faith & Doubt',
    tags: ['prayer', 'communication', 'God', 'devotion'],
    popularityRank: 10,
    isGlobal: true,
    verses: [
      { verseRef: 'Matthew 6:9-13', note: 'The Lord\'s Prayer - Jesus teaches us how to pray.' },
      { verseRef: '1 Thessalonians 5:17', note: 'Pray continually.' },
      { verseRef: 'Philippians 4:6', note: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.' },
      { verseRef: 'James 5:16', note: 'The prayer of a righteous person is powerful and effective.' },
    ],
  },
  {
    name: 'Peer Pressure',
    description: 'Stand firm in your faith when facing peer pressure.',
    category: 'Modern Life',
    tags: ['peer pressure', 'courage', 'standing firm', 'influence'],
    popularityRank: 6,
    isGlobal: true,
    verses: [
      { verseRef: 'Romans 12:2', note: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind.' },
      { verseRef: '1 Corinthians 15:33', note: 'Do not be misled: "Bad company corrupts good character."' },
      { verseRef: 'Joshua 1:9', note: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.' },
      { verseRef: 'Daniel 1:8', note: 'Daniel resolved not to defile himself - standing firm in his convictions.' },
    ],
  },
];

async function main() {
  console.log('🌱 Starting topic seed...');

  for (const topicData of sampleTopics) {
    const { verses, ...topic } = topicData;

    try {
      const createdTopic = await prisma.topic.create({
        data: {
          ...topic,
          verses: {
            create: verses.map((verse, index) => ({
              verseRef: verse.verseRef,
              note: verse.note,
              sortOrder: index,
            })),
          },
        },
        include: {
          verses: true,
        },
      });

      console.log(`✅ Created topic: ${createdTopic.name} (${createdTopic.verses.length} verses)`);
    } catch (error) {
      console.error(`❌ Error creating topic ${topic.name}:`, error);
    }
  }

  console.log('✨ Topic seed completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
