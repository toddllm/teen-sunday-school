import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Sample Comparative Themes Seed Data
 *
 * This file contains sample OT vs NT theme comparisons for demonstration.
 * Run with: npx ts-node server/prisma/seeds/comparative-themes.seed.ts
 */

const sampleThemes = [
  {
    themeName: 'Covenant',
    category: 'covenant',
    description: 'Explore how God\'s covenant relationship with His people evolves from the Old Testament law to the New Covenant in Christ.',
    otPassages: [
      {
        ref: 'Genesis 12:1-3',
        text: 'The Lord had said to Abram, "Go from your country, your people and your father\'s household to the land I will show you. I will make you into a great nation, and I will bless you..."',
        notes: 'The Abrahamic Covenant - God\'s promise to Abraham that would become foundational to Israel\'s identity.',
      },
      {
        ref: 'Exodus 19:5-6',
        text: 'Now if you obey me fully and keep my covenant, then out of all nations you will be my treasured possession. Although the whole earth is mine, you will be for me a kingdom of priests and a holy nation.',
        notes: 'The Sinai Covenant - Conditional covenant based on obedience to the Law.',
      },
      {
        ref: 'Jeremiah 31:31-34',
        text: 'The days are coming when I will make a new covenant with the people of Israel... I will put my law in their minds and write it on their hearts.',
        notes: 'Promise of the New Covenant - A future covenant written on hearts, not tablets.',
      },
    ],
    ntPassages: [
      {
        ref: 'Luke 22:20',
        text: 'This cup is the new covenant in my blood, which is poured out for you.',
        notes: 'Jesus institutes the New Covenant at the Last Supper.',
      },
      {
        ref: 'Hebrews 8:6-13',
        text: 'But in fact the ministry Jesus has received is as superior to theirs as the covenant of which he is mediator is superior to the old one...',
        notes: 'Explanation of how the New Covenant surpasses the Old Covenant.',
      },
      {
        ref: '2 Corinthians 3:3-6',
        text: 'You show that you are a letter from Christ... written not with ink but with the Spirit of the living God, not on tablets of stone but on tablets of human hearts.',
        notes: 'The New Covenant is written on hearts by the Holy Spirit.',
      },
    ],
    themeNotes: {
      summary: 'The theme of covenant shows God\'s faithful commitment to His people throughout history. In the OT, covenants were often conditional and required obedience to the Law. The NT reveals the New Covenant in Christ\'s blood - a better covenant based on grace, mediated by Jesus, and written on our hearts by the Holy Spirit.',
      connections: [
        'Both testaments show God\'s initiative in establishing covenant relationships',
        'The OT covenants point forward to and prepare for the New Covenant in Christ',
        'Where the Old Covenant was external (written on stone), the New Covenant is internal (written on hearts)',
        'The New Covenant fulfills the promise in Jeremiah 31 of a covenant that would transform hearts',
      ],
      keyInsights: [
        'God has always desired a covenant relationship with His people',
        'Jesus is the mediator of a better covenant (Hebrews)',
        'The Holy Spirit enables us to live out the New Covenant',
        'Grace, not law-keeping, is the foundation of the New Covenant',
      ],
    },
    isPublic: true,
  },
  {
    themeName: 'Sacrifice',
    category: 'sacrifice',
    description: 'Discover how the OT sacrificial system foreshadows and finds fulfillment in Christ\'s ultimate sacrifice.',
    otPassages: [
      {
        ref: 'Leviticus 17:11',
        text: 'For the life of a creature is in the blood, and I have given it to you to make atonement for yourselves on the altar; it is the blood that makes atonement for one\'s life.',
        notes: 'The principle that blood is required for atonement.',
      },
      {
        ref: 'Isaiah 53:5-7',
        text: 'But he was pierced for our transgressions... he was led like a lamb to the slaughter...',
        notes: 'Prophetic description of the suffering servant who would be sacrificed.',
      },
      {
        ref: 'Exodus 12:21-23',
        text: 'Take a bunch of hyssop, dip it into the blood in the basin and put some of the blood on the top and on both sides of the doorframe.',
        notes: 'The Passover lamb - a substitutionary sacrifice that saved Israel.',
      },
    ],
    ntPassages: [
      {
        ref: 'John 1:29',
        text: 'Look, the Lamb of God, who takes away the sin of the world!',
        notes: 'John the Baptist identifies Jesus as the ultimate Passover lamb.',
      },
      {
        ref: 'Hebrews 10:10-14',
        text: 'We have been made holy through the sacrifice of the body of Jesus Christ once for all... For by one sacrifice he has made perfect forever those who are being made holy.',
        notes: 'Christ\'s sacrifice was once-for-all, unlike repeated OT sacrifices.',
      },
      {
        ref: '1 Peter 1:18-19',
        text: 'For you know that it was not with perishable things such as silver or gold that you were redeemed... but with the precious blood of Christ, a lamb without blemish or defect.',
        notes: 'Christ as the perfect, unblemished sacrifice.',
      },
    ],
    themeNotes: {
      summary: 'The OT sacrificial system taught Israel about sin\'s seriousness and the need for atonement through blood. These sacrifices were repeated continually because they could never fully remove sin. In the NT, Jesus is revealed as the perfect sacrifice - the Lamb of God who takes away sin once and for all.',
      connections: [
        'Both testaments affirm that "without the shedding of blood there is no forgiveness" (Hebrews 9:22)',
        'The Passover lamb in Exodus prefigures Christ, our Passover lamb (1 Corinthians 5:7)',
        'Isaiah 53\'s suffering servant finds fulfillment in Jesus\' crucifixion',
        'The Day of Atonement ritual points to Christ\'s work as our High Priest',
      ],
      keyInsights: [
        'OT sacrifices were shadows pointing to the reality of Christ (Hebrews 10:1)',
        'Christ\'s sacrifice was voluntary, willing, and complete',
        'No more sacrifices are needed - Christ\'s work is finished',
        'The cross demonstrates both God\'s justice (sin must be punished) and His love (He provides the sacrifice)',
      ],
    },
    isPublic: true,
  },
  {
    themeName: 'Grace',
    category: 'grace',
    description: 'See how God\'s grace is displayed throughout Scripture, from the OT stories to the NT gospel.',
    otPassages: [
      {
        ref: 'Exodus 34:6-7',
        text: 'The Lord, the Lord, the compassionate and gracious God, slow to anger, abounding in love and faithfulness...',
        notes: 'God reveals His character as gracious and merciful.',
      },
      {
        ref: 'Nehemiah 9:17',
        text: 'But you are a forgiving God, gracious and compassionate, slow to anger and abounding in love.',
        notes: 'Israel\'s confession acknowledges God\'s grace despite their rebellion.',
      },
      {
        ref: 'Psalm 103:8-12',
        text: 'The Lord is compassionate and gracious... he does not treat us as our sins deserve or repay us according to our iniquities.',
        notes: 'David celebrates God\'s grace in not giving us what we deserve.',
      },
    ],
    ntPassages: [
      {
        ref: 'Ephesians 2:8-9',
        text: 'For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God—not by works, so that no one can boast.',
        notes: 'Salvation is purely by grace, not by works.',
      },
      {
        ref: 'Romans 5:20-21',
        text: 'But where sin increased, grace increased all the more, so that, just as sin reigned in death, so also grace might reign through righteousness to bring eternal life through Jesus Christ our Lord.',
        notes: 'Grace super-abounds over sin.',
      },
      {
        ref: 'Titus 2:11-12',
        text: 'For the grace of God has appeared that offers salvation to all people. It teaches us to say "No" to ungodliness...',
        notes: 'Grace not only saves but also transforms our lives.',
      },
    ],
    themeNotes: {
      summary: 'Grace is woven throughout the entire Bible. In the OT, we see God\'s grace in His patience with Israel, His forgiveness, and His faithfulness despite their unfaithfulness. The NT reveals grace fully in Jesus Christ - salvation is a free gift, not earned by works.',
      connections: [
        'God\'s character is consistently described as gracious in both testaments',
        'OT stories demonstrate grace (Noah, Abraham, David) but the fullness comes in Christ',
        'The Law revealed sin; grace provides the solution through Jesus',
        'Grace motivates obedience rather than being earned by obedience',
      ],
      keyInsights: [
        'Grace is God\'s unmerited favor - we can never earn it',
        'The OT prepares us to understand our need for grace',
        'Jesus is the ultimate expression of God\'s grace',
        'Grace transforms us from the inside out',
      ],
    },
    isPublic: true,
  },
  {
    themeName: 'Kingdom of God',
    category: 'kingdom',
    description: 'Trace the development of God\'s kingdom from Israel in the OT to the spiritual kingdom inaugurated by Jesus.',
    otPassages: [
      {
        ref: 'Daniel 2:44',
        text: 'In the time of those kings, the God of heaven will set up a kingdom that will never be destroyed, nor will it be left to another people.',
        notes: 'Prophecy of an eternal, indestructible kingdom.',
      },
      {
        ref: 'Psalm 145:11-13',
        text: 'They tell of the glory of your kingdom and speak of your might... Your kingdom is an everlasting kingdom, and your dominion endures through all generations.',
        notes: 'God\'s kingdom is eternal and glorious.',
      },
      {
        ref: '2 Samuel 7:12-16',
        text: 'I will raise up your offspring to succeed you... I will establish his kingdom... Your house and your kingdom will endure forever before me.',
        notes: 'The Davidic Covenant promises an eternal kingdom.',
      },
    ],
    ntPassages: [
      {
        ref: 'Mark 1:14-15',
        text: 'The time has come," he said. "The kingdom of God has come near. Repent and believe the good news!"',
        notes: 'Jesus announces the arrival of God\'s kingdom.',
      },
      {
        ref: 'Luke 17:20-21',
        text: 'The kingdom of God is in your midst.',
        notes: 'The kingdom is present in Jesus\' ministry, not just future.',
      },
      {
        ref: 'Colossians 1:13-14',
        text: 'For he has rescued us from the dominion of darkness and brought us into the kingdom of the Son he loves, in whom we have redemption, the forgiveness of sins.',
        notes: 'Believers have been transferred into Christ\'s kingdom now.',
      },
    ],
    themeNotes: {
      summary: 'The OT anticipated a coming kingdom where God would reign through His anointed king. Jesus announces that this kingdom has arrived in His ministry, though not in the political/military way many expected. The kingdom is both "already" (present in Christ\'s work) and "not yet" (awaiting full consummation).',
      connections: [
        'The Davidic kingdom points forward to Christ\'s eternal kingdom',
        'Daniel\'s prophecies of God\'s kingdom find fulfillment in Jesus',
        'The kingdom ethics of the Sermon on the Mount reflect OT values (justice, mercy, humility)',
        'Jesus as "Son of David" fulfills the covenant promise to David',
      ],
      keyInsights: [
        'The kingdom of God is wherever God\'s will is done',
        'Jesus inaugurated the kingdom but it\'s not yet fully realized',
        'The kingdom grows like a mustard seed - starting small but becoming great',
        'We enter the kingdom through faith in Christ, not nationality or works',
      ],
    },
    isPublic: true,
  },
];

async function seedComparativeThemes() {
  try {
    console.log('🌱 Seeding comparative themes...');

    // Get the first organization (or create a default one for public themes)
    let organization = await prisma.organization.findFirst();

    if (!organization) {
      console.log('⚠️  No organization found. Creating a default organization...');
      organization = await prisma.organization.create({
        data: {
          name: 'Demo Church',
          slug: 'demo-church',
          timezone: 'America/New_York',
        },
      });
      console.log('✓ Created default organization');
    }

    // Create themes
    for (const theme of sampleThemes) {
      const created = await prisma.comparativeTheme.create({
        data: {
          organizationId: organization.id,
          themeName: theme.themeName,
          category: theme.category,
          description: theme.description,
          otPassages: theme.otPassages,
          ntPassages: theme.ntPassages,
          themeNotes: theme.themeNotes,
          isPublic: theme.isPublic,
        },
      });
      console.log(`✓ Created theme: ${created.themeName}`);
    }

    console.log('');
    console.log('🎉 Seeding completed successfully!');
    console.log(`📊 Created ${sampleThemes.length} comparative themes`);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedComparativeThemes()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
