import { PrismaClient, Avatar } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Avatar Service
 *
 * Provides functions for managing and retrieving avatars.
 */

/**
 * Get all active avatars, sorted by category and sortOrder
 */
export async function getActiveAvatars(): Promise<Avatar[]> {
  try {
    const avatars = await prisma.avatar.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' },
      ],
    });

    return avatars;
  } catch (error) {
    console.error('Error fetching active avatars:', error);
    throw new Error('Failed to fetch avatars');
  }
}

/**
 * Get all avatars grouped by category
 */
export async function getAvatarsByCategory(): Promise<Record<string, Avatar[]>> {
  try {
    const avatars = await getActiveAvatars();

    // Group by category
    const grouped = avatars.reduce((acc, avatar) => {
      if (!acc[avatar.category]) {
        acc[avatar.category] = [];
      }
      acc[avatar.category].push(avatar);
      return acc;
    }, {} as Record<string, Avatar[]>);

    return grouped;
  } catch (error) {
    console.error('Error fetching avatars by category:', error);
    throw new Error('Failed to fetch avatars by category');
  }
}

/**
 * Get a single avatar by ID
 */
export async function getAvatarById(avatarId: string): Promise<Avatar | null> {
  try {
    const avatar = await prisma.avatar.findUnique({
      where: {
        id: avatarId,
      },
    });

    return avatar;
  } catch (error) {
    console.error('Error fetching avatar by ID:', error);
    throw new Error('Failed to fetch avatar');
  }
}

/**
 * Get a single avatar by name
 */
export async function getAvatarByName(name: string): Promise<Avatar | null> {
  try {
    const avatar = await prisma.avatar.findUnique({
      where: {
        name,
      },
    });

    return avatar;
  } catch (error) {
    console.error('Error fetching avatar by name:', error);
    throw new Error('Failed to fetch avatar');
  }
}

/**
 * Validate that an avatar exists and is active
 */
export async function validateAvatarId(avatarId: string): Promise<boolean> {
  try {
    const avatar = await prisma.avatar.findFirst({
      where: {
        id: avatarId,
        isActive: true,
      },
    });

    return avatar !== null;
  } catch (error) {
    console.error('Error validating avatar ID:', error);
    return false;
  }
}

/**
 * Get avatar usage statistics
 * Returns the count of users using each avatar
 */
export async function getAvatarUsageStats(): Promise<Array<{
  avatarId: string;
  avatarName: string;
  avatarDisplayName: string;
  userCount: number;
}>> {
  try {
    const avatarsWithUsers = await prisma.avatar.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        users: {
          _count: 'desc',
        },
      },
    });

    return avatarsWithUsers.map(avatar => ({
      avatarId: avatar.id,
      avatarName: avatar.name,
      avatarDisplayName: avatar.displayName,
      userCount: avatar._count.users,
    }));
  } catch (error) {
    console.error('Error fetching avatar usage stats:', error);
    throw new Error('Failed to fetch avatar usage statistics');
  }
}

/**
 * Get most popular avatars (top N by usage)
 */
export async function getMostPopularAvatars(limit: number = 5): Promise<Array<{
  avatar: Avatar;
  userCount: number;
}>> {
  try {
    const avatarsWithUsers = await prisma.avatar.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        users: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return avatarsWithUsers.map(avatar => ({
      avatar: {
        id: avatar.id,
        name: avatar.name,
        displayName: avatar.displayName,
        imageUrl: avatar.imageUrl,
        category: avatar.category,
        isActive: avatar.isActive,
        sortOrder: avatar.sortOrder,
        createdAt: avatar.createdAt,
      },
      userCount: avatar._count.users,
    }));
  } catch (error) {
    console.error('Error fetching most popular avatars:', error);
    throw new Error('Failed to fetch popular avatars');
  }
}

/**
 * Get categories list
 */
export async function getAvatarCategories(): Promise<string[]> {
  try {
    const avatars = await prisma.avatar.findMany({
      where: {
        isActive: true,
      },
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    return avatars.map(a => a.category).sort();
  } catch (error) {
    console.error('Error fetching avatar categories:', error);
    throw new Error('Failed to fetch avatar categories');
  }
}

/**
 * Get avatars by specific category
 */
export async function getAvatarsBySpecificCategory(category: string): Promise<Avatar[]> {
  try {
    const avatars = await prisma.avatar.findMany({
      where: {
        isActive: true,
        category,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return avatars;
  } catch (error) {
    console.error('Error fetching avatars by category:', error);
    throw new Error('Failed to fetch avatars for category');
  }
}

/**
 * Create a new avatar (admin function)
 */
export async function createAvatar(data: {
  name: string;
  displayName: string;
  imageUrl: string;
  category: string;
  sortOrder?: number;
}): Promise<Avatar> {
  try {
    const avatar = await prisma.avatar.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        imageUrl: data.imageUrl,
        category: data.category,
        sortOrder: data.sortOrder ?? 0,
        isActive: true,
      },
    });

    return avatar;
  } catch (error) {
    console.error('Error creating avatar:', error);
    throw new Error('Failed to create avatar');
  }
}

/**
 * Update avatar (admin function)
 */
export async function updateAvatar(
  avatarId: string,
  data: Partial<{
    displayName: string;
    imageUrl: string;
    category: string;
    isActive: boolean;
    sortOrder: number;
  }>
): Promise<Avatar> {
  try {
    const avatar = await prisma.avatar.update({
      where: {
        id: avatarId,
      },
      data,
    });

    return avatar;
  } catch (error) {
    console.error('Error updating avatar:', error);
    throw new Error('Failed to update avatar');
  }
}

/**
 * Delete avatar (admin function - soft delete by setting isActive to false)
 */
export async function deleteAvatar(avatarId: string): Promise<Avatar> {
  try {
    const avatar = await prisma.avatar.update({
      where: {
        id: avatarId,
      },
      data: {
        isActive: false,
      },
    });

    return avatar;
  } catch (error) {
    console.error('Error deleting avatar:', error);
    throw new Error('Failed to delete avatar');
  }
}
