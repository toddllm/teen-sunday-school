import { Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Get all groups for the current user's organization
 * GET /api/groups
 */
export async function getGroups(req: Request, res: Response): Promise<void> {
  try {
    const organizationId = req.user!.organizationId;

    const groups = await prisma.group.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      include: {
        _count: {
          select: {
            members: true,
            challenges: true,
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.status(200).json(groups);
  } catch (error: any) {
    logger.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
}

/**
 * Get a single group by ID
 * GET /api/groups/:groupId
 */
export async function getGroupById(req: Request, res: Response): Promise<void> {
  try {
    const { groupId } = req.params;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        },
        _count: {
          select: {
            challenges: true,
            lessons: true,
          }
        }
      }
    });

    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    res.status(200).json(group);
  } catch (error: any) {
    logger.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
}

/**
 * Get groups the current user is a member of
 * GET /api/groups/my-groups
 */
export async function getMyGroups(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;

    const memberships = await prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            _count: {
              select: {
                members: true,
                challenges: true,
              }
            }
          }
        }
      }
    });

    const groups = memberships.map(m => ({
      ...m.group,
      myRole: m.role,
    }));

    res.status(200).json(groups);
  } catch (error: any) {
    logger.error('Error fetching user groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
}
