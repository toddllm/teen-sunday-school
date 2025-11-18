import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const avatarSeedData = [
  // Animals Category
  {
    name: 'cool-cat',
    displayName: 'Cool Cat',
    imageUrl: '/avatars/cool-cat.svg',
    category: 'animals',
    sortOrder: 1,
  },
  {
    name: 'happy-dog',
    displayName: 'Happy Dog',
    imageUrl: '/avatars/happy-dog.svg',
    category: 'animals',
    sortOrder: 2,
  },
  {
    name: 'wise-owl',
    displayName: 'Wise Owl',
    imageUrl: '/avatars/wise-owl.svg',
    category: 'animals',
    sortOrder: 3,
  },
  {
    name: 'friendly-fox',
    displayName: 'Friendly Fox',
    imageUrl: '/avatars/friendly-fox.svg',
    category: 'animals',
    sortOrder: 4,
  },
  {
    name: 'brave-lion',
    displayName: 'Brave Lion',
    imageUrl: '/avatars/brave-lion.svg',
    category: 'animals',
    sortOrder: 5,
  },
  {
    name: 'playful-dolphin',
    displayName: 'Playful Dolphin',
    imageUrl: '/avatars/playful-dolphin.svg',
    category: 'animals',
    sortOrder: 6,
  },
  {
    name: 'gentle-bear',
    displayName: 'Gentle Bear',
    imageUrl: '/avatars/gentle-bear.svg',
    category: 'animals',
    sortOrder: 7,
  },
  {
    name: 'swift-eagle',
    displayName: 'Swift Eagle',
    imageUrl: '/avatars/swift-eagle.svg',
    category: 'animals',
    sortOrder: 8,
  },

  // Nature Category
  {
    name: 'sunny-flower',
    displayName: 'Sunny Flower',
    imageUrl: '/avatars/sunny-flower.svg',
    category: 'nature',
    sortOrder: 9,
  },
  {
    name: 'mountain-peak',
    displayName: 'Mountain Peak',
    imageUrl: '/avatars/mountain-peak.svg',
    category: 'nature',
    sortOrder: 10,
  },
  {
    name: 'ocean-wave',
    displayName: 'Ocean Wave',
    imageUrl: '/avatars/ocean-wave.svg',
    category: 'nature',
    sortOrder: 11,
  },
  {
    name: 'forest-tree',
    displayName: 'Forest Tree',
    imageUrl: '/avatars/forest-tree.svg',
    category: 'nature',
    sortOrder: 12,
  },
  {
    name: 'autumn-leaf',
    displayName: 'Autumn Leaf',
    imageUrl: '/avatars/autumn-leaf.svg',
    category: 'nature',
    sortOrder: 13,
  },

  // Abstract/Symbols Category
  {
    name: 'star-burst',
    displayName: 'Star Burst',
    imageUrl: '/avatars/star-burst.svg',
    category: 'abstract',
    sortOrder: 14,
  },
  {
    name: 'rainbow-arc',
    displayName: 'Rainbow Arc',
    imageUrl: '/avatars/rainbow-arc.svg',
    category: 'abstract',
    sortOrder: 15,
  },
  {
    name: 'lightning-bolt',
    displayName: 'Lightning Bolt',
    imageUrl: '/avatars/lightning-bolt.svg',
    category: 'abstract',
    sortOrder: 16,
  },
  {
    name: 'peace-dove',
    displayName: 'Peace Dove',
    imageUrl: '/avatars/peace-dove.svg',
    category: 'symbols',
    sortOrder: 17,
  },
  {
    name: 'shining-cross',
    displayName: 'Shining Cross',
    imageUrl: '/avatars/shining-cross.svg',
    category: 'symbols',
    sortOrder: 18,
  },
  {
    name: 'guiding-light',
    displayName: 'Guiding Light',
    imageUrl: '/avatars/guiding-light.svg',
    category: 'symbols',
    sortOrder: 19,
  },
  {
    name: 'open-book',
    displayName: 'Open Book',
    imageUrl: '/avatars/open-book.svg',
    category: 'symbols',
    sortOrder: 20,
  },
];

export async function seedAvatars() {
  console.log('🌱 Seeding avatars...');

  try {
    // Check if avatars already exist
    const existingCount = await prisma.avatar.count();

    if (existingCount > 0) {
      console.log(`ℹ️  Found ${existingCount} existing avatars. Skipping seed.`);
      return;
    }

    // Create avatars
    const created = await prisma.avatar.createMany({
      data: avatarSeedData,
      skipDuplicates: true,
    });

    console.log(`✅ Successfully seeded ${created.count} avatars`);

    // Display seeded avatars
    const avatars = await prisma.avatar.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    console.log('\n📋 Seeded avatars:');
    avatars.forEach((avatar) => {
      console.log(`   - ${avatar.displayName} (${avatar.category})`);
    });

  } catch (error) {
    console.error('❌ Error seeding avatars:', error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedAvatars()
    .then(() => {
      console.log('\n✨ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Seeding failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
