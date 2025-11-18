import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rewards = [
  // Avatars - Every 5 levels
  {
    type: 'AVATAR',
    name: 'Beginner Badge',
    description: 'Your first avatar - a simple badge representing new beginnings',
    unlockLevel: 1,
    data: {
      icon: '🌱',
      color: '#4CAF50'
    }
  },
  {
    type: 'AVATAR',
    name: 'Growing Disciple',
    description: 'Level 5 avatar - showing consistent growth',
    unlockLevel: 5,
    data: {
      icon: '🌿',
      color: '#66BB6A'
    }
  },
  {
    type: 'AVATAR',
    name: 'Faithful Servant',
    description: 'Level 10 avatar - faithful in little things',
    unlockLevel: 10,
    data: {
      icon: '⭐',
      color: '#FFD700'
    }
  },
  {
    type: 'AVATAR',
    name: 'Devoted Follower',
    description: 'Level 15 avatar - demonstrating true devotion',
    unlockLevel: 15,
    data: {
      icon: '💎',
      color: '#9C27B0'
    }
  },
  {
    type: 'AVATAR',
    name: 'Spiritual Warrior',
    description: 'Level 20 avatar - strong in faith',
    unlockLevel: 20,
    data: {
      icon: '🛡️',
      color: '#2196F3'
    }
  },
  {
    type: 'AVATAR',
    name: 'Kingdom Builder',
    description: 'Level 25 avatar - building God\'s kingdom',
    unlockLevel: 25,
    data: {
      icon: '🏰',
      color: '#F44336'
    }
  },
  {
    type: 'AVATAR',
    name: 'Light Bearer',
    description: 'Level 30 avatar - shining light in darkness',
    unlockLevel: 30,
    data: {
      icon: '🕯️',
      color: '#FFA726'
    }
  },
  {
    type: 'AVATAR',
    name: 'Wise Teacher',
    description: 'Level 35 avatar - wisdom from experience',
    unlockLevel: 35,
    data: {
      icon: '📚',
      color: '#795548'
    }
  },
  {
    type: 'AVATAR',
    name: 'Heavenly Crown',
    description: 'Level 40 avatar - worthy of honor',
    unlockLevel: 40,
    data: {
      icon: '👑',
      color: '#FFD700'
    }
  },
  {
    type: 'AVATAR',
    name: 'Eternal Flame',
    description: 'Level 50 avatar - burning with passion',
    unlockLevel: 50,
    data: {
      icon: '🔥',
      color: '#FF5722'
    }
  },

  // Themes - Every 10 levels
  {
    type: 'THEME',
    name: 'Ocean Blue',
    description: 'Calm and peaceful ocean theme',
    unlockLevel: 10,
    data: {
      primary: '#2196F3',
      secondary: '#03A9F4',
      accent: '#00BCD4',
      background: '#E1F5FE'
    }
  },
  {
    type: 'THEME',
    name: 'Forest Green',
    description: 'Natural and refreshing forest theme',
    unlockLevel: 20,
    data: {
      primary: '#4CAF50',
      secondary: '#66BB6A',
      accent: '#8BC34A',
      background: '#E8F5E9'
    }
  },
  {
    type: 'THEME',
    name: 'Royal Purple',
    description: 'Regal and majestic purple theme',
    unlockLevel: 30,
    data: {
      primary: '#9C27B0',
      secondary: '#AB47BC',
      accent: '#BA68C8',
      background: '#F3E5F5'
    }
  },
  {
    type: 'THEME',
    name: 'Sunset Orange',
    description: 'Warm and energetic sunset theme',
    unlockLevel: 40,
    data: {
      primary: '#FF9800',
      secondary: '#FFB74D',
      accent: '#FFA726',
      background: '#FFF3E0'
    }
  },
  {
    type: 'THEME',
    name: 'Golden Glory',
    description: 'Radiant and triumphant golden theme',
    unlockLevel: 50,
    data: {
      primary: '#FFD700',
      secondary: '#FFC107',
      accent: '#FFEB3B',
      background: '#FFFDE7'
    }
  },

  // Special Badges - Milestones
  {
    type: 'BADGE',
    name: 'First Steps',
    description: 'Awarded for reaching level 1',
    unlockLevel: 1,
    data: {
      icon: '🎯',
      category: 'milestone'
    }
  },
  {
    type: 'BADGE',
    name: 'Rising Star',
    description: 'Awarded for reaching level 10',
    unlockLevel: 10,
    data: {
      icon: '🌟',
      category: 'milestone'
    }
  },
  {
    type: 'BADGE',
    name: 'Dedicated Disciple',
    description: 'Awarded for reaching level 20',
    unlockLevel: 20,
    data: {
      icon: '✨',
      category: 'milestone'
    }
  },
  {
    type: 'BADGE',
    name: 'Faithful Achiever',
    description: 'Awarded for reaching level 30',
    unlockLevel: 30,
    data: {
      icon: '🏆',
      category: 'milestone'
    }
  },
  {
    type: 'BADGE',
    name: 'Master of Faith',
    description: 'Awarded for reaching level 50',
    unlockLevel: 50,
    data: {
      icon: '🎖️',
      category: 'milestone'
    }
  },

  // Special Titles
  {
    type: 'TITLE',
    name: 'Newcomer',
    description: 'Starting your journey',
    unlockLevel: 1,
    data: {
      prefix: '',
      suffix: 'the Newcomer'
    }
  },
  {
    type: 'TITLE',
    name: 'Apprentice',
    description: 'Learning the ways',
    unlockLevel: 5,
    data: {
      prefix: '',
      suffix: 'the Apprentice'
    }
  },
  {
    type: 'TITLE',
    name: 'Disciple',
    description: 'Following faithfully',
    unlockLevel: 10,
    data: {
      prefix: '',
      suffix: 'the Disciple'
    }
  },
  {
    type: 'TITLE',
    name: 'Warrior',
    description: 'Fighting the good fight',
    unlockLevel: 20,
    data: {
      prefix: '',
      suffix: 'the Warrior'
    }
  },
  {
    type: 'TITLE',
    name: 'Champion',
    description: 'Champion of faith',
    unlockLevel: 30,
    data: {
      prefix: '',
      suffix: 'the Champion'
    }
  },
  {
    type: 'TITLE',
    name: 'Legend',
    description: 'Legendary dedication',
    unlockLevel: 50,
    data: {
      prefix: '',
      suffix: 'the Legend'
    }
  }
];

async function main() {
  console.log('Seeding rewards...');

  for (const reward of rewards) {
    await prisma.reward.upsert({
      where: {
        // Use a composite key or create unique constraint
        // For now, we'll use a combination of type and unlockLevel
        id: `${reward.type.toLowerCase()}-${reward.unlockLevel}`,
      },
      update: reward,
      create: {
        id: `${reward.type.toLowerCase()}-${reward.unlockLevel}`,
        ...reward,
      },
    });
  }

  console.log(`✓ Seeded ${rewards.length} rewards`);
}

main()
  .catch((e) => {
    console.error('Error seeding rewards:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
