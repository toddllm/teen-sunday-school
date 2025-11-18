import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed the database with chronological Bible timeline events
 */
export async function seedTimeline() {
  console.log('Seeding Bible timeline...');

  const timelineData = [
    {
      order: 1,
      title: 'Creation',
      dateRange: 'Beginning of Time',
      description: 'God creates the heavens, the earth, and humanity. Adam and Eve live in the Garden of Eden.',
      category: 'Creation',
      segments: [
        {
          order: 1,
          passages: ['Genesis 1-2', 'Psalm 8', 'Psalm 19'],
          notes: 'The story of creation and the formation of the world and humanity.',
        },
      ],
    },
    {
      order: 2,
      title: 'The Fall',
      dateRange: 'c. 4000 BC',
      description: 'Sin enters the world through Adam and Eve. Humanity falls from grace.',
      category: 'Creation',
      segments: [
        {
          order: 1,
          passages: ['Genesis 3'],
          notes: 'The first sin and its consequences for humanity.',
        },
      ],
    },
    {
      order: 3,
      title: 'Cain and Abel',
      dateRange: 'c. 3900 BC',
      description: 'The first murder occurs when Cain kills his brother Abel.',
      category: 'Patriarchs',
      segments: [
        {
          order: 1,
          passages: ['Genesis 4'],
          notes: 'The consequences of sin continue to spread through humanity.',
        },
      ],
    },
    {
      order: 4,
      title: 'Noah and the Flood',
      dateRange: 'c. 2500 BC',
      description: 'God judges the earth with a great flood but saves Noah and his family.',
      category: 'Patriarchs',
      segments: [
        {
          order: 1,
          passages: ['Genesis 6-9'],
          notes: 'God\'s judgment and mercy are displayed through the flood and covenant with Noah.',
        },
      ],
    },
    {
      order: 5,
      title: 'Tower of Babel',
      dateRange: 'c. 2200 BC',
      description: 'Humanity attempts to build a tower to heaven. God confuses their language.',
      category: 'Patriarchs',
      segments: [
        {
          order: 1,
          passages: ['Genesis 11:1-9'],
          notes: 'Human pride and God\'s response through the dispersion of peoples.',
        },
      ],
    },
    {
      order: 6,
      title: 'Call of Abraham',
      dateRange: 'c. 2000 BC',
      description: 'God calls Abraham and promises to make him a great nation.',
      category: 'Patriarchs',
      segments: [
        {
          order: 1,
          passages: ['Genesis 12-15', 'Genesis 17-18'],
          notes: 'God\'s covenant with Abraham and the promise of descendants.',
        },
      ],
    },
    {
      order: 7,
      title: 'Isaac and Jacob',
      dateRange: 'c. 1900-1800 BC',
      description: 'The story of Abraham\'s descendants through Isaac and Jacob.',
      category: 'Patriarchs',
      segments: [
        {
          order: 1,
          passages: ['Genesis 21-28'],
          notes: 'Isaac is born and Jacob receives the birthright.',
        },
        {
          order: 2,
          passages: ['Genesis 29-35'],
          notes: 'Jacob\'s family grows and the twelve tribes are established.',
        },
      ],
    },
    {
      order: 8,
      title: 'Joseph in Egypt',
      dateRange: 'c. 1700 BC',
      description: 'Joseph is sold into slavery but rises to become second-in-command in Egypt.',
      category: 'Patriarchs',
      segments: [
        {
          order: 1,
          passages: ['Genesis 37-41'],
          notes: 'Joseph\'s trials and rise to power in Egypt.',
        },
        {
          order: 2,
          passages: ['Genesis 42-50'],
          notes: 'Joseph reunites with his family and saves them from famine.',
        },
      ],
    },
    {
      order: 9,
      title: 'Slavery in Egypt',
      dateRange: 'c. 1600-1446 BC',
      description: 'The Israelites are enslaved in Egypt for 400 years.',
      category: 'Exodus',
      segments: [
        {
          order: 1,
          passages: ['Exodus 1-2'],
          notes: 'Israel\'s oppression in Egypt and the birth of Moses.',
        },
      ],
    },
    {
      order: 10,
      title: 'Moses and the Exodus',
      dateRange: 'c. 1446 BC',
      description: 'God delivers Israel from Egypt through Moses and the ten plagues.',
      category: 'Exodus',
      segments: [
        {
          order: 1,
          passages: ['Exodus 3-11'],
          notes: 'God calls Moses and sends plagues on Egypt.',
        },
        {
          order: 2,
          passages: ['Exodus 12-15'],
          notes: 'The Passover and crossing of the Red Sea.',
        },
      ],
    },
    {
      order: 11,
      title: 'The Law at Mount Sinai',
      dateRange: 'c. 1445 BC',
      description: 'God gives Moses the Ten Commandments and the Law.',
      category: 'Exodus',
      segments: [
        {
          order: 1,
          passages: ['Exodus 19-24'],
          notes: 'God establishes His covenant with Israel through the Law.',
        },
      ],
    },
    {
      order: 12,
      title: 'Wilderness Wandering',
      dateRange: 'c. 1445-1406 BC',
      description: 'Israel wanders in the wilderness for 40 years due to unbelief.',
      category: 'Exodus',
      segments: [
        {
          order: 1,
          passages: ['Numbers 13-14'],
          notes: 'The spies report and Israel\'s rebellion.',
        },
      ],
    },
    {
      order: 13,
      title: 'Conquest of Canaan',
      dateRange: 'c. 1406-1390 BC',
      description: 'Joshua leads Israel to conquer the Promised Land.',
      category: 'Conquest',
      segments: [
        {
          order: 1,
          passages: ['Joshua 1-6'],
          notes: 'Crossing the Jordan and the fall of Jericho.',
        },
        {
          order: 2,
          passages: ['Joshua 23-24'],
          notes: 'Joshua\'s farewell and covenant renewal.',
        },
      ],
    },
    {
      order: 14,
      title: 'Period of Judges',
      dateRange: 'c. 1390-1050 BC',
      description: 'Israel is ruled by judges during a cycle of sin and deliverance.',
      category: 'Judges',
      segments: [
        {
          order: 1,
          passages: ['Judges 2-3'],
          notes: 'The cycle of sin, oppression, and deliverance.',
        },
        {
          order: 2,
          passages: ['Judges 6-7'],
          notes: 'Gideon defeats the Midianites.',
        },
        {
          order: 3,
          passages: ['Judges 13-16'],
          notes: 'Samson and the Philistines.',
        },
      ],
    },
    {
      order: 15,
      title: 'Ruth and Boaz',
      dateRange: 'c. 1100 BC',
      description: 'The story of Ruth\'s faithfulness and God\'s provision.',
      category: 'Judges',
      segments: [
        {
          order: 1,
          passages: ['Ruth 1-4'],
          notes: 'A beautiful picture of redemption and loyalty.',
        },
      ],
    },
    {
      order: 16,
      title: 'Samuel and Saul',
      dateRange: 'c. 1050-1010 BC',
      description: 'Israel demands a king. Saul is anointed but fails as king.',
      category: 'United Kingdom',
      segments: [
        {
          order: 1,
          passages: ['1 Samuel 8-15'],
          notes: 'Israel gets a king and Saul\'s disobedience.',
        },
      ],
    },
    {
      order: 17,
      title: 'David Becomes King',
      dateRange: 'c. 1010-970 BC',
      description: 'David is anointed king and establishes Jerusalem as the capital.',
      category: 'United Kingdom',
      segments: [
        {
          order: 1,
          passages: ['1 Samuel 16-17'],
          notes: 'David is anointed and defeats Goliath.',
        },
        {
          order: 2,
          passages: ['2 Samuel 5-7'],
          notes: 'David becomes king and God makes a covenant with him.',
        },
        {
          order: 3,
          passages: ['Psalm 23', 'Psalm 51'],
          notes: 'David\'s psalms of trust and repentance.',
        },
      ],
    },
    {
      order: 18,
      title: 'Solomon and the Temple',
      dateRange: 'c. 970-930 BC',
      description: 'Solomon builds the Temple and Israel reaches its golden age.',
      category: 'United Kingdom',
      segments: [
        {
          order: 1,
          passages: ['1 Kings 3-8'],
          notes: 'Solomon\'s wisdom and the building of the Temple.',
        },
        {
          order: 2,
          passages: ['Proverbs 1-4'],
          notes: 'Solomon\'s wisdom literature.',
        },
      ],
    },
    {
      order: 19,
      title: 'Divided Kingdom',
      dateRange: 'c. 930-722 BC',
      description: 'Israel splits into northern (Israel) and southern (Judah) kingdoms.',
      category: 'Divided Kingdom',
      segments: [
        {
          order: 1,
          passages: ['1 Kings 12-13'],
          notes: 'The kingdom divides under Rehoboam and Jeroboam.',
        },
        {
          order: 2,
          passages: ['1 Kings 17-19'],
          notes: 'Elijah and the prophets of Baal.',
        },
      ],
    },
    {
      order: 20,
      title: 'Fall of Northern Kingdom',
      dateRange: '722 BC',
      description: 'Assyria conquers the northern kingdom of Israel.',
      category: 'Exile',
      segments: [
        {
          order: 1,
          passages: ['2 Kings 17'],
          notes: 'Israel falls to Assyria due to unfaithfulness.',
        },
      ],
    },
    {
      order: 21,
      title: 'Prophets to Judah',
      dateRange: 'c. 740-586 BC',
      description: 'Prophets warn Judah of coming judgment.',
      category: 'Prophets',
      segments: [
        {
          order: 1,
          passages: ['Isaiah 1', 'Isaiah 6', 'Isaiah 53'],
          notes: 'Isaiah\'s call and prophecies of the Messiah.',
        },
        {
          order: 2,
          passages: ['Jeremiah 1', 'Jeremiah 31'],
          notes: 'Jeremiah\'s call and the promise of a new covenant.',
        },
      ],
    },
    {
      order: 22,
      title: 'Fall of Jerusalem',
      dateRange: '586 BC',
      description: 'Babylon destroys Jerusalem and the Temple. Judah goes into exile.',
      category: 'Exile',
      segments: [
        {
          order: 1,
          passages: ['2 Kings 25', 'Lamentations 1'],
          notes: 'The destruction of Jerusalem and the mourning that follows.',
        },
      ],
    },
    {
      order: 23,
      title: 'Daniel in Babylon',
      dateRange: 'c. 605-536 BC',
      description: 'Daniel and his friends remain faithful during exile.',
      category: 'Exile',
      segments: [
        {
          order: 1,
          passages: ['Daniel 1-3'],
          notes: 'Daniel\'s faithfulness and the fiery furnace.',
        },
        {
          order: 2,
          passages: ['Daniel 6'],
          notes: 'Daniel in the lion\'s den.',
        },
      ],
    },
    {
      order: 24,
      title: 'Return from Exile',
      dateRange: 'c. 538 BC',
      description: 'Cyrus of Persia allows the Jews to return to Jerusalem.',
      category: 'Return',
      segments: [
        {
          order: 1,
          passages: ['Ezra 1-3'],
          notes: 'The first group returns and rebuilds the altar.',
        },
      ],
    },
    {
      order: 25,
      title: 'Nehemiah Rebuilds the Walls',
      dateRange: 'c. 445 BC',
      description: 'Nehemiah leads the effort to rebuild Jerusalem\'s walls.',
      category: 'Return',
      segments: [
        {
          order: 1,
          passages: ['Nehemiah 1-2', 'Nehemiah 8'],
          notes: 'Nehemiah\'s prayer and the rebuilding project.',
        },
      ],
    },
    {
      order: 26,
      title: 'Between the Testaments',
      dateRange: '400-4 BC',
      description: 'Four hundred years of silence before the coming of Jesus.',
      category: 'Intertestamental',
      segments: [],
    },
    {
      order: 27,
      title: 'Birth of Jesus',
      dateRange: 'c. 4 BC',
      description: 'Jesus Christ is born in Bethlehem.',
      category: 'Jesus',
      segments: [
        {
          order: 1,
          passages: ['Luke 1-2', 'Matthew 1-2'],
          notes: 'The birth of the Messiah.',
        },
      ],
    },
    {
      order: 28,
      title: 'Ministry of Jesus',
      dateRange: 'c. 27-30 AD',
      description: 'Jesus teaches, heals, and proclaims the Kingdom of God.',
      category: 'Jesus',
      segments: [
        {
          order: 1,
          passages: ['Matthew 5-7'],
          notes: 'The Sermon on the Mount.',
        },
        {
          order: 2,
          passages: ['John 3', 'John 4'],
          notes: 'Jesus teaches about being born again.',
        },
        {
          order: 3,
          passages: ['Mark 4-5'],
          notes: 'Jesus\' parables and miracles.',
        },
      ],
    },
    {
      order: 29,
      title: 'Death and Resurrection',
      dateRange: 'c. 30 AD',
      description: 'Jesus is crucified and rises from the dead.',
      category: 'Jesus',
      segments: [
        {
          order: 1,
          passages: ['Matthew 26-28'],
          notes: 'The Last Supper, crucifixion, and resurrection.',
        },
        {
          order: 2,
          passages: ['John 19-20'],
          notes: 'John\'s account of Jesus\' death and resurrection.',
        },
      ],
    },
    {
      order: 30,
      title: 'Pentecost and Early Church',
      dateRange: 'c. 30 AD',
      description: 'The Holy Spirit comes and the church is born.',
      category: 'Early Church',
      segments: [
        {
          order: 1,
          passages: ['Acts 1-2'],
          notes: 'Jesus ascends and the Spirit comes at Pentecost.',
        },
        {
          order: 2,
          passages: ['Acts 3-5'],
          notes: 'The early church grows and faces persecution.',
        },
      ],
    },
    {
      order: 31,
      title: 'Paul\'s Conversion and Missions',
      dateRange: 'c. 33-60 AD',
      description: 'Paul is converted and spreads the Gospel throughout the Roman Empire.',
      category: 'Early Church',
      segments: [
        {
          order: 1,
          passages: ['Acts 9'],
          notes: 'Paul\'s dramatic conversion on the road to Damascus.',
        },
        {
          order: 2,
          passages: ['Acts 13-14'],
          notes: 'Paul\'s first missionary journey.',
        },
        {
          order: 3,
          passages: ['Acts 16-17'],
          notes: 'Paul\'s second missionary journey.',
        },
      ],
    },
    {
      order: 32,
      title: 'Paul\'s Letters',
      dateRange: 'c. 48-65 AD',
      description: 'Paul writes letters to churches and individuals.',
      category: 'Early Church',
      segments: [
        {
          order: 1,
          passages: ['Romans 3-8'],
          notes: 'The Gospel explained: justification and life in the Spirit.',
        },
        {
          order: 2,
          passages: ['1 Corinthians 13', '1 Corinthians 15'],
          notes: 'Love and the resurrection.',
        },
        {
          order: 3,
          passages: ['Ephesians 1-2'],
          notes: 'Our identity in Christ.',
        },
      ],
    },
    {
      order: 33,
      title: 'Revelation and the Future',
      dateRange: 'c. 95 AD',
      description: 'John writes Revelation, showing Christ\'s victory and return.',
      category: 'Early Church',
      segments: [
        {
          order: 1,
          passages: ['Revelation 1', 'Revelation 21-22'],
          notes: 'The vision of Christ and the new heaven and earth.',
        },
      ],
    },
  ];

  for (const eventData of timelineData) {
    const { segments, ...eventInfo } = eventData;

    const event = await prisma.timelineEvent.upsert({
      where: {
        id: `timeline-${eventInfo.order}`,
      },
      update: eventInfo,
      create: {
        id: `timeline-${eventInfo.order}`,
        ...eventInfo,
      },
    });

    for (const segmentData of segments) {
      await prisma.timelineReadingSegment.upsert({
        where: {
          id: `segment-${eventInfo.order}-${segmentData.order}`,
        },
        update: {
          ...segmentData,
          eventId: event.id,
        },
        create: {
          id: `segment-${eventInfo.order}-${segmentData.order}`,
          ...segmentData,
          eventId: event.id,
        },
      });
    }
  }

  console.log(`✓ Created ${timelineData.length} timeline events`);
}

// Run seed if called directly
if (require.main === module) {
  seedTimeline()
    .catch((e) => {
      console.error('Error seeding timeline:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
