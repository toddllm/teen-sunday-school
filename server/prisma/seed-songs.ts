import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed script for initial songs
 * These are non-copyrighted hymns and public domain songs
 */

const INITIAL_SONGS = [
  {
    title: 'Amazing Grace',
    artist: 'John Newton',
    linkUrl: 'https://www.youtube.com/results?search_query=amazing+grace',
    themeTags: ['grace', 'redemption', 'salvation', 'worship'],
    relatedVerses: ['EPH.2.8', 'ROM.3.24', 'TIT.2.11', '1PE.5.10'],
    gameSnippet: 'Amazing grace, how sweet the sound',
    gameTheme: 'grace',
  },
  {
    title: 'How Great Thou Art',
    artist: 'Carl Boberg',
    linkUrl: 'https://www.youtube.com/results?search_query=how+great+thou+art',
    themeTags: ['worship', 'praise', 'creation', 'majesty'],
    relatedVerses: ['PSA.8.1', 'PSA.104.1', 'ROM.1.20', 'REV.4.11'],
    gameSnippet: 'O Lord my God, how great Thou art',
    gameTheme: 'worship',
  },
  {
    title: 'Come Thou Fount',
    artist: 'Robert Robinson',
    linkUrl: 'https://www.youtube.com/results?search_query=come+thou+fount',
    themeTags: ['grace', 'thankfulness', 'devotion', 'commitment'],
    relatedVerses: ['1SA.7.12', 'EPH.1.7', 'HEB.13.15', 'PSA.50.14'],
    gameSnippet: 'Come Thou fount of every blessing',
    gameTheme: 'thankfulness',
  },
  {
    title: 'It Is Well With My Soul',
    artist: 'Horatio Spafford',
    linkUrl: 'https://www.youtube.com/results?search_query=it+is+well+with+my+soul',
    themeTags: ['peace', 'faith', 'trust', 'comfort'],
    relatedVerses: ['JHN.14.27', 'ROM.8.28', 'PHP.4.7', 'ISA.26.3'],
    gameSnippet: 'It is well with my soul',
    gameTheme: 'peace',
  },
  {
    title: 'Be Thou My Vision',
    artist: 'Irish Hymn',
    linkUrl: 'https://www.youtube.com/results?search_query=be+thou+my+vision',
    themeTags: ['devotion', 'guidance', 'priorities', 'worship'],
    relatedVerses: ['PSA.27.1', 'PSA.119.105', 'MAT.6.33', 'COL.3.2'],
    gameSnippet: 'Be Thou my vision, O Lord',
    gameTheme: 'devotion',
  },
  {
    title: 'Great Is Thy Faithfulness',
    artist: 'Thomas Chisholm',
    linkUrl: 'https://www.youtube.com/results?search_query=great+is+thy+faithfulness',
    themeTags: ['faithfulness', 'trust', 'provision', 'worship'],
    relatedVerses: ['LAM.3.22', 'LAM.3.23', 'DEU.7.9', 'PSA.36.5'],
    gameSnippet: 'Great is Thy faithfulness, O God',
    gameTheme: 'faithfulness',
  },
  {
    title: 'Holy, Holy, Holy',
    artist: 'Reginald Heber',
    linkUrl: 'https://www.youtube.com/results?search_query=holy+holy+holy+hymn',
    themeTags: ['holiness', 'worship', 'trinity', 'reverence'],
    relatedVerses: ['ISA.6.3', 'REV.4.8', 'LEV.19.2', '1PE.1.16'],
    gameSnippet: 'Holy, holy, holy, Lord God Almighty',
    gameTheme: 'holiness',
  },
  {
    title: 'The Old Rugged Cross',
    artist: 'George Bennard',
    linkUrl: 'https://www.youtube.com/results?search_query=old+rugged+cross',
    themeTags: ['cross', 'sacrifice', 'salvation', 'redemption'],
    relatedVerses: ['1CO.1.18', 'GAL.6.14', 'PHP.2.8', 'HEB.12.2'],
    gameSnippet: 'On a hill far away',
    gameTheme: 'sacrifice',
  },
  {
    title: 'Jesus Loves Me',
    artist: 'Anna Warner',
    linkUrl: 'https://www.youtube.com/results?search_query=jesus+loves+me',
    themeTags: ['love', 'children', 'simple faith', 'assurance'],
    relatedVerses: ['JHN.3.16', '1JN.4.19', 'ROM.5.8', 'EPH.2.4'],
    gameSnippet: 'Jesus loves me, this I know',
    gameTheme: 'love',
  },
  {
    title: 'A Mighty Fortress',
    artist: 'Martin Luther',
    linkUrl: 'https://www.youtube.com/results?search_query=a+mighty+fortress+is+our+god',
    themeTags: ['strength', 'protection', 'spiritual warfare', 'trust'],
    relatedVerses: ['PSA.46.1', 'PSA.18.2', 'EPH.6.12', 'ROM.8.31'],
    gameSnippet: 'A mighty fortress is our God',
    gameTheme: 'strength',
  },
  {
    title: 'Blessed Assurance',
    artist: 'Fanny Crosby',
    linkUrl: 'https://www.youtube.com/results?search_query=blessed+assurance',
    themeTags: ['assurance', 'joy', 'testimony', 'salvation'],
    relatedVerses: ['HEB.10.22', '1JN.5.13', 'ROM.8.16', '2TI.1.12'],
    gameSnippet: 'Blessed assurance, Jesus is mine',
    gameTheme: 'assurance',
  },
  {
    title: 'Rock of Ages',
    artist: 'Augustus Toplady',
    linkUrl: 'https://www.youtube.com/results?search_query=rock+of+ages',
    themeTags: ['refuge', 'salvation', 'cleansing', 'grace'],
    relatedVerses: ['PSA.18.2', 'PSA.62.7', 'ISA.26.4', '1CO.10.4'],
    gameSnippet: 'Rock of ages, cleft for me',
    gameTheme: 'refuge',
  },
  {
    title: 'Crown Him With Many Crowns',
    artist: 'Matthew Bridges',
    linkUrl: 'https://www.youtube.com/results?search_query=crown+him+with+many+crowns',
    themeTags: ['kingship', 'victory', 'worship', 'praise'],
    relatedVerses: ['REV.19.12', 'PHP.2.9', 'HEB.2.9', 'REV.5.12'],
    gameSnippet: 'Crown Him with many crowns',
    gameTheme: 'kingship',
  },
  {
    title: 'I Need Thee Every Hour',
    artist: 'Annie Hawks',
    linkUrl: 'https://www.youtube.com/results?search_query=i+need+thee+every+hour',
    themeTags: ['dependence', 'prayer', 'need', 'communion'],
    relatedVerses: ['JHN.15.5', 'PSA.73.25', 'PHP.4.19', 'MAT.6.11'],
    gameSnippet: 'I need Thee every hour',
    gameTheme: 'dependence',
  },
  {
    title: 'What A Friend We Have In Jesus',
    artist: 'Joseph Scriven',
    linkUrl: 'https://www.youtube.com/results?search_query=what+a+friend+we+have+in+jesus',
    themeTags: ['friendship', 'prayer', 'comfort', 'peace'],
    relatedVerses: ['JHN.15.15', 'HEB.4.16', 'PHP.4.6', '1PE.5.7'],
    gameSnippet: 'What a friend we have in Jesus',
    gameTheme: 'friendship',
  },
];

async function seedSongs() {
  console.log('Starting song seed...');

  try {
    // Create songs as global (organizationId = null)
    for (const songData of INITIAL_SONGS) {
      const existing = await prisma.songRef.findFirst({
        where: {
          title: songData.title,
          artist: songData.artist,
        },
      });

      if (!existing) {
        await prisma.songRef.create({
          data: {
            ...songData,
            organizationId: null, // Global song
            isApproved: true,
            curatedBy: null, // System seed
          },
        });
        console.log(`✓ Created song: ${songData.title}`);
      } else {
        console.log(`- Skipped (already exists): ${songData.title}`);
      }
    }

    console.log('\nSong seed completed successfully!');
    console.log(`Total songs: ${INITIAL_SONGS.length}`);
  } catch (error) {
    console.error('Error seeding songs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedSongs()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedSongs;
