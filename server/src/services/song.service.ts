import { prisma } from '../config/database';
import { SongMetricType } from '@prisma/client';

/**
 * Song Service
 * Handles song references, playlists, and metrics
 */

interface SongFilters {
  passageRef?: string;
  theme?: string;
  organizationId?: string;
  isApproved?: boolean;
}

interface PlaylistFilters {
  userId?: string;
  organizationId?: string;
  lessonId?: string;
  isPublic?: boolean;
}

/**
 * Get songs filtered by passage reference or theme
 */
export async function getSongs(filters: SongFilters) {
  const { passageRef, theme, organizationId, isApproved = true } = filters;

  const where: any = {
    isApproved,
    OR: [
      { organizationId: null }, // Global songs
      { organizationId }, // Organization-specific songs
    ],
  };

  // Filter by passage reference
  if (passageRef) {
    where.relatedVerses = {
      path: '$',
      array_contains: passageRef,
    };
  }

  // Filter by theme tag
  if (theme) {
    where.themeTags = {
      has: theme,
    };
  }

  const songs = await prisma.songRef.findMany({
    where,
    orderBy: [
      { createdAt: 'desc' },
    ],
    select: {
      id: true,
      title: true,
      artist: true,
      linkUrl: true,
      themeTags: true,
      relatedVerses: true,
      gameSnippet: true,
      gameTheme: true,
      createdAt: true,
    },
  });

  return songs;
}

/**
 * Get a single song by ID
 */
export async function getSongById(songId: string, organizationId?: string) {
  const song = await prisma.songRef.findFirst({
    where: {
      id: songId,
      isApproved: true,
      OR: [
        { organizationId: null },
        { organizationId },
      ],
    },
  });

  return song;
}

/**
 * Create a new song (admin only)
 */
export async function createSong(data: {
  title: string;
  artist: string;
  linkUrl?: string;
  themeTags: string[];
  relatedVerses: string[];
  gameSnippet?: string;
  gameTheme?: string;
  organizationId?: string;
  curatedBy: string;
}) {
  const song = await prisma.songRef.create({
    data: {
      ...data,
      isApproved: true, // Songs created by admins are auto-approved
    },
  });

  return song;
}

/**
 * Update a song (admin only)
 */
export async function updateSong(
  songId: string,
  data: {
    title?: string;
    artist?: string;
    linkUrl?: string;
    themeTags?: string[];
    relatedVerses?: string[];
    gameSnippet?: string;
    gameTheme?: string;
    isApproved?: boolean;
  }
) {
  const song = await prisma.songRef.update({
    where: { id: songId },
    data,
  });

  return song;
}

/**
 * Delete a song (admin only)
 */
export async function deleteSong(songId: string) {
  await prisma.songRef.delete({
    where: { id: songId },
  });
}

/**
 * Track a song metric
 */
export async function trackSongMetric(data: {
  songId: string;
  metricType: SongMetricType;
  organizationId?: string;
  userId?: string;
  groupId?: string;
  passageRef?: string;
}) {
  const metric = await prisma.songMetric.create({
    data,
  });

  return metric;
}

/**
 * Get song metrics
 */
export async function getSongMetrics(
  organizationId: string,
  filters?: {
    songId?: string;
    metricType?: SongMetricType;
    startDate?: Date;
    endDate?: Date;
  }
) {
  const where: any = {
    organizationId,
  };

  if (filters?.songId) {
    where.songId = filters.songId;
  }

  if (filters?.metricType) {
    where.metricType = filters.metricType;
  }

  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.createdAt.lte = filters.endDate;
    }
  }

  const metrics = await prisma.songMetric.findMany({
    where,
    include: {
      song: {
        select: {
          title: true,
          artist: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return metrics;
}

/**
 * Get song statistics summary
 */
export async function getSongStats(organizationId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const metrics = await prisma.songMetric.findMany({
    where: {
      organizationId,
      createdAt: {
        gte: startDate,
      },
    },
    include: {
      song: {
        select: {
          id: true,
          title: true,
          artist: true,
        },
      },
    },
  });

  // Aggregate stats
  const stats = {
    totalViews: 0,
    totalLinkClicks: 0,
    totalGamePlays: 0,
    totalPlaylistAdds: 0,
    topSongs: [] as Array<{
      songId: string;
      title: string;
      artist: string;
      views: number;
      clicks: number;
    }>,
  };

  const songMap = new Map<string, {
    songId: string;
    title: string;
    artist: string;
    views: number;
    clicks: number;
  }>();

  metrics.forEach((metric) => {
    // Count totals
    switch (metric.metricType) {
      case 'VIEW':
        stats.totalViews++;
        break;
      case 'LINK_CLICK':
        stats.totalLinkClicks++;
        break;
      case 'GAME_PLAY':
        stats.totalGamePlays++;
        break;
      case 'PLAYLIST_ADD':
        stats.totalPlaylistAdds++;
        break;
    }

    // Track per-song stats
    if (!songMap.has(metric.songId)) {
      songMap.set(metric.songId, {
        songId: metric.songId,
        title: metric.song.title,
        artist: metric.song.artist,
        views: 0,
        clicks: 0,
      });
    }

    const songStats = songMap.get(metric.songId)!;
    if (metric.metricType === 'VIEW') {
      songStats.views++;
    } else if (metric.metricType === 'LINK_CLICK') {
      songStats.clicks++;
    }
  });

  // Get top 10 songs by views
  stats.topSongs = Array.from(songMap.values())
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  return stats;
}

// ============================================================================
// PLAYLIST FUNCTIONS
// ============================================================================

/**
 * Get playlists with optional filters
 */
export async function getPlaylists(filters: PlaylistFilters) {
  const where: any = {};

  if (filters.userId) {
    where.userId = filters.userId;
  }

  if (filters.organizationId) {
    where.organizationId = filters.organizationId;
  }

  if (filters.lessonId) {
    where.lessonId = filters.lessonId;
  }

  if (filters.isPublic !== undefined) {
    where.isPublic = filters.isPublic;
  }

  const playlists = await prisma.songPlaylist.findMany({
    where,
    include: {
      items: {
        include: {
          song: {
            select: {
              id: true,
              title: true,
              artist: true,
              linkUrl: true,
              themeTags: true,
            },
          },
        },
        orderBy: {
          orderIndex: 'asc',
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return playlists;
}

/**
 * Get a single playlist by ID
 */
export async function getPlaylistById(playlistId: string) {
  const playlist = await prisma.songPlaylist.findUnique({
    where: { id: playlistId },
    include: {
      items: {
        include: {
          song: true,
        },
        orderBy: {
          orderIndex: 'asc',
        },
      },
    },
  });

  return playlist;
}

/**
 * Create a new playlist
 */
export async function createPlaylist(data: {
  name: string;
  description?: string;
  organizationId: string;
  userId: string;
  lessonId?: string;
  isPublic?: boolean;
}) {
  const playlist = await prisma.songPlaylist.create({
    data,
    include: {
      items: true,
    },
  });

  return playlist;
}

/**
 * Update a playlist
 */
export async function updatePlaylist(
  playlistId: string,
  data: {
    name?: string;
    description?: string;
    lessonId?: string;
    isPublic?: boolean;
  }
) {
  const playlist = await prisma.songPlaylist.update({
    where: { id: playlistId },
    data,
    include: {
      items: {
        include: {
          song: true,
        },
        orderBy: {
          orderIndex: 'asc',
        },
      },
    },
  });

  return playlist;
}

/**
 * Delete a playlist
 */
export async function deletePlaylist(playlistId: string) {
  await prisma.songPlaylist.delete({
    where: { id: playlistId },
  });
}

/**
 * Add a song to a playlist
 */
export async function addSongToPlaylist(data: {
  playlistId: string;
  songId: string;
  notes?: string;
}) {
  // Get the current max order index
  const maxItem = await prisma.songPlaylistItem.findFirst({
    where: { playlistId: data.playlistId },
    orderBy: { orderIndex: 'desc' },
  });

  const orderIndex = maxItem ? maxItem.orderIndex + 1 : 0;

  const item = await prisma.songPlaylistItem.create({
    data: {
      ...data,
      orderIndex,
    },
    include: {
      song: true,
    },
  });

  // Track metric
  await trackSongMetric({
    songId: data.songId,
    metricType: 'PLAYLIST_ADD',
  });

  return item;
}

/**
 * Remove a song from a playlist
 */
export async function removeSongFromPlaylist(playlistId: string, songId: string) {
  await prisma.songPlaylistItem.delete({
    where: {
      playlistId_songId: {
        playlistId,
        songId,
      },
    },
  });
}

/**
 * Reorder songs in a playlist
 */
export async function reorderPlaylist(
  playlistId: string,
  songIds: string[]
) {
  // Update order index for each song
  await Promise.all(
    songIds.map((songId, index) =>
      prisma.songPlaylistItem.updateMany({
        where: {
          playlistId,
          songId,
        },
        data: {
          orderIndex: index,
        },
      })
    )
  );

  return getPlaylistById(playlistId);
}
