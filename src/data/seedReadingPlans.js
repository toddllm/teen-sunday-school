/**
 * Seed data for Reading Plans
 *
 * This file contains sample reading plans to populate the app.
 * In production, this data would come from a backend database.
 */

export const seedPlans = [
  {
    id: 'plan-gospel-7day',
    title: 'Gospel Foundations',
    description: 'Explore the core message of Jesus through the four Gospels. Perfect for teens new to Bible reading or looking to strengthen their understanding of who Jesus is.',
    duration_days: 7,
    tags: ['Gospel', 'Jesus', 'Faith', 'Beginner-Friendly'],
    is_featured: true,
    difficulty: 'Beginner',
    estimated_daily_minutes: 10,
    created_by_admin_id: 'admin-seed',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'plan-anxiety-7day',
    title: 'Finding Peace in Anxious Times',
    description: 'A week-long journey through Scripture passages that bring comfort, peace, and perspective when worry feels overwhelming.',
    duration_days: 7,
    tags: ['Anxiety', 'Peace', 'Mental Health', 'Comfort'],
    is_featured: true,
    difficulty: 'Beginner',
    estimated_daily_minutes: 8,
    created_by_admin_id: 'admin-seed',
    created_at: '2025-01-02T00:00:00.000Z',
    updated_at: '2025-01-02T00:00:00.000Z',
  },
  {
    id: 'plan-psalms-30day',
    title: 'Psalms for Every Season',
    description: 'Journey through 30 powerful Psalms that speak to joy, sorrow, praise, and struggle. Learn to pray and worship through poetry.',
    duration_days: 30,
    tags: ['Psalms', 'Worship', 'Prayer', 'Emotions'],
    is_featured: true,
    difficulty: 'Beginner',
    estimated_daily_minutes: 12,
    created_by_admin_id: 'admin-seed',
    created_at: '2025-01-03T00:00:00.000Z',
    updated_at: '2025-01-03T00:00:00.000Z',
  },
  {
    id: 'plan-leadership-30day',
    title: 'Biblical Leadership Principles',
    description: 'Discover what the Bible teaches about servant leadership, influence, and making a difference. Great for student leaders and those exploring their calling.',
    duration_days: 30,
    tags: ['Leadership', 'Service', 'Character', 'Calling'],
    is_featured: false,
    difficulty: 'Intermediate',
    estimated_daily_minutes: 15,
    created_by_admin_id: 'admin-seed',
    created_at: '2025-01-04T00:00:00.000Z',
    updated_at: '2025-01-04T00:00:00.000Z',
  },
  {
    id: 'plan-proverbs-wisdom',
    title: 'Wisdom for Everyday Life',
    description: 'Read through the book of Proverbs to gain practical wisdom for relationships, money, words, and decision-making.',
    duration_days: 31,
    tags: ['Wisdom', 'Proverbs', 'Daily Living', 'Character'],
    is_featured: false,
    difficulty: 'Beginner',
    estimated_daily_minutes: 10,
    created_by_admin_id: 'admin-seed',
    created_at: '2025-01-05T00:00:00.000Z',
    updated_at: '2025-01-05T00:00:00.000Z',
  },
  {
    id: 'plan-faith-stories',
    title: 'Heroes of Faith',
    description: 'Meet the bold, flawed, faithful people God used throughout history. Their stories will inspire your own faith journey.',
    duration_days: 14,
    tags: ['Faith', 'Old Testament', 'Heroes', 'Courage'],
    is_featured: false,
    difficulty: 'Intermediate',
    estimated_daily_minutes: 12,
    created_by_admin_id: 'admin-seed',
    created_at: '2025-01-06T00:00:00.000Z',
    updated_at: '2025-01-06T00:00:00.000Z',
  },
  {
    id: 'plan-identity-christ',
    title: 'Who You Are in Christ',
    description: 'Discover your true identity through what the Bible says about who you are as a beloved child of God.',
    duration_days: 21,
    tags: ['Identity', 'Self-Worth', 'Faith', 'Gospel'],
    is_featured: true,
    difficulty: 'Beginner',
    estimated_daily_minutes: 10,
    created_by_admin_id: 'admin-seed',
    created_at: '2025-01-07T00:00:00.000Z',
    updated_at: '2025-01-07T00:00:00.000Z',
  },
  {
    id: 'plan-new-testament-90',
    title: 'New Testament in 90 Days',
    description: 'Read the entire New Testament in three months. A manageable pace with life-changing results.',
    duration_days: 90,
    tags: ['New Testament', 'Bible Reading', 'Jesus', 'Church'],
    is_featured: false,
    difficulty: 'Intermediate',
    estimated_daily_minutes: 20,
    created_by_admin_id: 'admin-seed',
    created_at: '2025-01-08T00:00:00.000Z',
    updated_at: '2025-01-08T00:00:00.000Z',
  },
];

export const seedPlanDays = [
  // Gospel Foundations (7 days)
  { plan_id: 'plan-gospel-7day', day_index: 1, passage_refs: ['John 1:1-18'], notes: 'Jesus is the Word who became flesh. Reflect on how amazing it is that God came to live among us.' },
  { plan_id: 'plan-gospel-7day', day_index: 2, passage_refs: ['Mark 1:14-20'], notes: 'Jesus calls ordinary people to follow Him. What is He calling you to?' },
  { plan_id: 'plan-gospel-7day', day_index: 3, passage_refs: ['Luke 15:11-32'], notes: 'The story of the prodigal son reveals God\'s heart for the lost. Are you running to Him or away?' },
  { plan_id: 'plan-gospel-7day', day_index: 4, passage_refs: ['Matthew 5:1-16'], notes: 'The Beatitudes show us what God blesses. How do these values contrast with the world?' },
  { plan_id: 'plan-gospel-7day', day_index: 5, passage_refs: ['John 3:16-21'], notes: 'The most famous verse in the Bible. Meditate on the depth of God\'s love.' },
  { plan_id: 'plan-gospel-7day', day_index: 6, passage_refs: ['Mark 15:33-47'], notes: 'Jesus dies for our sins. Spend time in gratitude for what He endured.' },
  { plan_id: 'plan-gospel-7day', day_index: 7, passage_refs: ['Luke 24:1-12'], notes: 'The resurrection changes everything. Because Jesus lives, we have hope!' },

  // Finding Peace in Anxious Times (7 days)
  { plan_id: 'plan-anxiety-7day', day_index: 1, passage_refs: ['Philippians 4:6-7'], notes: 'Don\'t be anxious - pray instead. God\'s peace will guard your heart and mind.' },
  { plan_id: 'plan-anxiety-7day', day_index: 2, passage_refs: ['Matthew 6:25-34'], notes: 'God cares for the birds and flowers - He will care for you too. Don\'t worry about tomorrow.' },
  { plan_id: 'plan-anxiety-7day', day_index: 3, passage_refs: ['Psalm 23'], notes: 'The Lord is your shepherd. You have everything you need.' },
  { plan_id: 'plan-anxiety-7day', day_index: 4, passage_refs: ['Isaiah 41:10'], notes: 'Do not fear - God is with you. He will strengthen and help you.' },
  { plan_id: 'plan-anxiety-7day', day_index: 5, passage_refs: ['1 Peter 5:7'], notes: 'Cast all your anxiety on Him because He cares for you. What burdens can you give to God today?' },
  { plan_id: 'plan-anxiety-7day', day_index: 6, passage_refs: ['Psalm 46:1-11'], notes: 'God is our refuge and strength. Be still and know that He is God.' },
  { plan_id: 'plan-anxiety-7day', day_index: 7, passage_refs: ['John 14:27'], notes: 'Jesus gives a peace the world cannot give. Receive His peace today.' },

  // Psalms for Every Season (30 days) - Sample first 5 days
  { plan_id: 'plan-psalms-30day', day_index: 1, passage_refs: ['Psalm 1'], notes: 'What does it mean to delight in God\'s Word? How can you be like a tree planted by streams?' },
  { plan_id: 'plan-psalms-30day', day_index: 2, passage_refs: ['Psalm 8'], notes: 'When you look at the stars, remember how God cares for humanity - for you!' },
  { plan_id: 'plan-psalms-30day', day_index: 3, passage_refs: ['Psalm 19'], notes: 'Creation declares God\'s glory. What in nature reminds you of God\'s greatness?' },
  { plan_id: 'plan-psalms-30day', day_index: 4, passage_refs: ['Psalm 27'], notes: 'The Lord is my light and salvation - whom shall I fear?' },
  { plan_id: 'plan-psalms-30day', day_index: 5, passage_refs: ['Psalm 32'], notes: 'The joy of forgiveness! Confess your sins and experience God\'s mercy.' },
  { plan_id: 'plan-psalms-30day', day_index: 6, passage_refs: ['Psalm 34'], notes: 'Taste and see that the Lord is good. He hears the brokenhearted.' },
  { plan_id: 'plan-psalms-30day', day_index: 7, passage_refs: ['Psalm 37:1-11'], notes: 'Don\'t fret about evildoers. Delight in the Lord instead.' },
  { plan_id: 'plan-psalms-30day', day_index: 8, passage_refs: ['Psalm 42'], notes: 'When your soul is downcast, put your hope in God. He will send help.' },
  { plan_id: 'plan-psalms-30day', day_index: 9, passage_refs: ['Psalm 51'], notes: 'David\'s prayer of repentance. God wants a broken and contrite heart.' },
  { plan_id: 'plan-psalms-30day', day_index: 10, passage_refs: ['Psalm 63'], notes: 'Earnestly seeking God. When was the last time you truly thirsted for Him?' },
  { plan_id: 'plan-psalms-30day', day_index: 11, passage_refs: ['Psalm 73'], notes: 'When life seems unfair, remember that nearness to God is your greatest good.' },
  { plan_id: 'plan-psalms-30day', day_index: 12, passage_refs: ['Psalm 84'], notes: 'Better is one day in God\'s courts than a thousand elsewhere.' },
  { plan_id: 'plan-psalms-30day', day_index: 13, passage_refs: ['Psalm 90'], notes: 'Teach us to number our days. How can you make your time count?' },
  { plan_id: 'plan-psalms-30day', day_index: 14, passage_refs: ['Psalm 91'], notes: 'Dwell in the shelter of the Most High. God is your refuge.' },
  { plan_id: 'plan-psalms-30day', day_index: 15, passage_refs: ['Psalm 96'], notes: 'Sing a new song to the Lord! How can you worship Him today?' },
  { plan_id: 'plan-psalms-30day', day_index: 16, passage_refs: ['Psalm 100'], notes: 'Shout for joy! Enter His gates with thanksgiving.' },
  { plan_id: 'plan-psalms-30day', day_index: 17, passage_refs: ['Psalm 103'], notes: 'Bless the Lord and remember all His benefits to you.' },
  { plan_id: 'plan-psalms-30day', day_index: 18, passage_refs: ['Psalm 107:1-22'], notes: 'Give thanks for God\'s unfailing love and wonderful deeds.' },
  { plan_id: 'plan-psalms-30day', day_index: 19, passage_refs: ['Psalm 119:1-32'], notes: 'God\'s Word is a lamp to your feet. How can you treasure it more?' },
  { plan_id: 'plan-psalms-30day', day_index: 20, passage_refs: ['Psalm 121'], notes: 'The Lord watches over you. He never sleeps!' },
  { plan_id: 'plan-psalms-30day', day_index: 21, passage_refs: ['Psalm 130'], notes: 'Out of the depths I cry to You. God hears and forgives.' },
  { plan_id: 'plan-psalms-30day', day_index: 22, passage_refs: ['Psalm 133'], notes: 'How good it is when God\'s people live in unity!' },
  { plan_id: 'plan-psalms-30day', day_index: 23, passage_refs: ['Psalm 136'], notes: 'His love endures forever - repeated 26 times! Let that truth sink in.' },
  { plan_id: 'plan-psalms-30day', day_index: 24, passage_refs: ['Psalm 139'], notes: 'God knows you completely and loves you fully. You are fearfully and wonderfully made.' },
  { plan_id: 'plan-psalms-30day', day_index: 25, passage_refs: ['Psalm 143'], notes: 'Show me the way I should go. Seek God\'s guidance today.' },
  { plan_id: 'plan-psalms-30day', day_index: 26, passage_refs: ['Psalm 145'], notes: 'The Lord is gracious and compassionate, slow to anger and rich in love.' },
  { plan_id: 'plan-psalms-30day', day_index: 27, passage_refs: ['Psalm 146'], notes: 'Put your trust in the Lord, not in human leaders.' },
  { plan_id: 'plan-psalms-30day', day_index: 28, passage_refs: ['Psalm 147'], notes: 'God heals the brokenhearted and binds up their wounds.' },
  { plan_id: 'plan-psalms-30day', day_index: 29, passage_refs: ['Psalm 148'], notes: 'All creation praises the Lord! Join the cosmic choir today.' },
  { plan_id: 'plan-psalms-30day', day_index: 30, passage_refs: ['Psalm 150'], notes: 'Praise the Lord! End this journey with exuberant worship.' },

  // Identity in Christ (21 days) - Sample first 7 days
  { plan_id: 'plan-identity-christ', day_index: 1, passage_refs: ['2 Corinthians 5:17'], notes: 'You are a new creation in Christ. The old has gone, the new has come!' },
  { plan_id: 'plan-identity-christ', day_index: 2, passage_refs: ['Romans 8:1-2'], notes: 'There is no condemnation for those in Christ Jesus. You are free!' },
  { plan_id: 'plan-identity-christ', day_index: 3, passage_refs: ['Ephesians 1:3-8'], notes: 'You are chosen, adopted, and redeemed. Let these truths shape your identity.' },
  { plan_id: 'plan-identity-christ', day_index: 4, passage_refs: ['1 John 3:1-3'], notes: 'You are a child of God - loved lavishly by your Father.' },
  { plan_id: 'plan-identity-christ', day_index: 5, passage_refs: ['John 15:15'], notes: 'Jesus calls you friend. How does that change how you relate to Him?' },
  { plan_id: 'plan-identity-christ', day_index: 6, passage_refs: ['Galatians 2:20'], notes: 'Christ lives in you. Your life is now hidden in Him.' },
  { plan_id: 'plan-identity-christ', day_index: 7, passage_refs: ['Philippians 3:20'], notes: 'Your citizenship is in heaven. You belong to God\'s kingdom.' },
  { plan_id: 'plan-identity-christ', day_index: 8, passage_refs: ['1 Peter 2:9'], notes: 'You are chosen, royal, holy, and special. You belong to God.' },
  { plan_id: 'plan-identity-christ', day_index: 9, passage_refs: ['Romans 8:37'], notes: 'You are more than a conqueror through Christ.' },
  { plan_id: 'plan-identity-christ', day_index: 10, passage_refs: ['Ephesians 2:10'], notes: 'You are God\'s masterpiece, created for good works.' },
  { plan_id: 'plan-identity-christ', day_index: 11, passage_refs: ['Colossians 3:12'], notes: 'You are chosen and dearly loved. Live like it!' },
  { plan_id: 'plan-identity-christ', day_index: 12, passage_refs: ['1 Corinthians 6:19-20'], notes: 'Your body is a temple of the Holy Spirit. You are bought with a price.' },
  { plan_id: 'plan-identity-christ', day_index: 13, passage_refs: ['Romans 8:15-17'], notes: 'You are an heir of God and co-heir with Christ!' },
  { plan_id: 'plan-identity-christ', day_index: 14, passage_refs: ['Ephesians 2:4-7'], notes: 'God\'s rich mercy and great love have made you alive in Christ.' },
  { plan_id: 'plan-identity-christ', day_index: 15, passage_refs: ['2 Corinthians 3:18'], notes: 'You are being transformed into Christ\'s image with ever-increasing glory.' },
  { plan_id: 'plan-identity-christ', day_index: 16, passage_refs: ['John 1:12'], notes: 'You have the right to be called a child of God.' },
  { plan_id: 'plan-identity-christ', day_index: 17, passage_refs: ['1 Corinthians 3:16'], notes: 'You are God\'s temple - the Spirit dwells in you.' },
  { plan_id: 'plan-identity-christ', day_index: 18, passage_refs: ['Colossians 1:13-14'], notes: 'You have been rescued and redeemed by Jesus.' },
  { plan_id: 'plan-identity-christ', day_index: 19, passage_refs: ['Romans 5:8-9'], notes: 'You are justified by Christ\'s blood. God loves you that much!' },
  { plan_id: 'plan-identity-christ', day_index: 20, passage_refs: ['Ephesians 3:17-19'], notes: 'You are rooted and established in love beyond knowledge.' },
  { plan_id: 'plan-identity-christ', day_index: 21, passage_refs: ['Romans 8:31-39'], notes: 'Nothing can separate you from God\'s love. You are secure!' },

  // Leadership Principles (30 days) - Sample first 5 days
  { plan_id: 'plan-leadership-30day', day_index: 1, passage_refs: ['Mark 10:42-45'], notes: 'True leadership is servant leadership. How can you serve others today?' },
  { plan_id: 'plan-leadership-30day', day_index: 2, passage_refs: ['1 Timothy 4:12'], notes: 'Don\'t let anyone look down on your youth. Set an example in every way.' },
  { plan_id: 'plan-leadership-30day', day_index: 3, passage_refs: ['Proverbs 11:14'], notes: 'Good leaders seek wise counsel. Who are your mentors?' },
  { plan_id: 'plan-leadership-30day', day_index: 4, passage_refs: ['Joshua 1:6-9'], notes: 'Be strong and courageous. God is with you wherever you go.' },
  { plan_id: 'plan-leadership-30day', day_index: 5, passage_refs: ['Nehemiah 1'], notes: 'Nehemiah\'s leadership began with prayer. How is your prayer life?' },

  // Add more days for other plans as needed...
];

/**
 * Initialize the database with seed data
 */
export const initializeSeedData = () => {
  const PLANS_KEY = 'sunday-school-reading-plans';
  const PLAN_DAYS_KEY = 'sunday-school-plan-days';

  // Check if already initialized
  const existing = localStorage.getItem(PLANS_KEY);
  if (existing && JSON.parse(existing).length > 0) {
    console.log('Seed data already exists. Skipping initialization.');
    return;
  }

  // Save plans
  localStorage.setItem(PLANS_KEY, JSON.stringify(seedPlans));
  console.log(`Initialized ${seedPlans.length} reading plans`);

  // Save plan days
  localStorage.setItem(PLAN_DAYS_KEY, JSON.stringify(seedPlanDays));
  console.log(`Initialized ${seedPlanDays.length} plan days`);

  // Initialize empty user plans and day statuses
  localStorage.setItem('sunday-school-user-plans', JSON.stringify([]));
  localStorage.setItem('sunday-school-user-plan-days', JSON.stringify([]));
};
