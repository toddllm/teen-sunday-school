import { Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Create a new lesson debrief
 */
export async function createDebrief(req: Request, res: Response): Promise<void> {
  try {
    const { lessonId } = req.params;
    const { notes, sessionDate, groupId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!notes || notes.trim().length === 0) {
      res.status(400).json({ error: 'Notes are required' });
      return;
    }

    // Verify lesson exists and user has access to it
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { organizationId: true },
    });

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    // Verify user belongs to the same organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user || user.organizationId !== lesson.organizationId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Create the debrief
    const debrief = await prisma.lessonDebrief.create({
      data: {
        lessonId,
        authorId: userId,
        notes: notes.trim(),
        sessionDate: sessionDate ? new Date(sessionDate) : null,
        groupId: groupId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    logger.info(`Debrief created for lesson ${lessonId} by user ${userId}`);
    res.status(201).json({ debrief });
  } catch (error) {
    logger.error('Error creating debrief:', error);
    res.status(500).json({ error: 'Failed to create debrief' });
  }
}

/**
 * Get all debriefs for a lesson
 */
export async function getDebriefs(req: Request, res: Response): Promise<void> {
  try {
    const { lessonId } = req.params;
    const { authorId, groupId, startDate, endDate } = req.query;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify lesson exists and user has access to it
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { organizationId: true },
    });

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    // Verify user belongs to the same organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user || user.organizationId !== lesson.organizationId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Build filter criteria
    const where: any = { lessonId };

    if (authorId) {
      where.authorId = authorId as string;
    }

    if (groupId) {
      where.groupId = groupId as string;
    }

    if (startDate || endDate) {
      where.sessionDate = {};
      if (startDate) {
        where.sessionDate.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.sessionDate.lte = new Date(endDate as string);
      }
    }

    // Fetch debriefs
    const debriefs = await prisma.lessonDebrief.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [
        { sessionDate: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    res.json({ debriefs });
  } catch (error) {
    logger.error('Error fetching debriefs:', error);
    res.status(500).json({ error: 'Failed to fetch debriefs' });
  }
}

/**
 * Get a single debrief by ID
 */
export async function getDebrief(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const debrief = await prisma.lessonDebrief.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
            organizationId: true,
          },
        },
      },
    });

    if (!debrief) {
      res.status(404).json({ error: 'Debrief not found' });
      return;
    }

    // Verify user has access to this debrief
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user || user.organizationId !== debrief.lesson.organizationId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ debrief });
  } catch (error) {
    logger.error('Error fetching debrief:', error);
    res.status(500).json({ error: 'Failed to fetch debrief' });
  }
}

/**
 * Update a debrief
 */
export async function updateDebrief(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { notes, sessionDate, groupId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Fetch existing debrief
    const existingDebrief = await prisma.lessonDebrief.findUnique({
      where: { id },
      include: {
        lesson: {
          select: { organizationId: true },
        },
      },
    });

    if (!existingDebrief) {
      res.status(404).json({ error: 'Debrief not found' });
      return;
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        organizationId: true,
        role: true,
        groupMemberships: {
          where: {
            groupId: existingDebrief.groupId || undefined,
          },
          select: { role: true },
        },
      },
    });

    if (!user || user.organizationId !== existingDebrief.lesson.organizationId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Check permissions: author can edit, or leaders can edit
    const isAuthor = existingDebrief.authorId === userId;
    const isLeader = user.groupMemberships.some(m => m.role === 'leader');
    const isTeacher = user.role === 'TEACHER' || user.role === 'ORG_ADMIN' || user.role === 'SUPER_ADMIN';

    if (!isAuthor && !isLeader && !isTeacher) {
      res.status(403).json({ error: 'Only the author, group leaders, or teachers can edit debriefs' });
      return;
    }

    // Update the debrief
    const updateData: any = {};
    if (notes !== undefined) {
      if (!notes || notes.trim().length === 0) {
        res.status(400).json({ error: 'Notes cannot be empty' });
        return;
      }
      updateData.notes = notes.trim();
    }
    if (sessionDate !== undefined) {
      updateData.sessionDate = sessionDate ? new Date(sessionDate) : null;
    }
    if (groupId !== undefined) {
      updateData.groupId = groupId || null;
    }

    const updatedDebrief = await prisma.lessonDebrief.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    logger.info(`Debrief ${id} updated by user ${userId}`);
    res.json({ debrief: updatedDebrief });
  } catch (error) {
    logger.error('Error updating debrief:', error);
    res.status(500).json({ error: 'Failed to update debrief' });
  }
}

/**
 * Delete a debrief
 */
export async function deleteDebrief(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Fetch existing debrief
    const existingDebrief = await prisma.lessonDebrief.findUnique({
      where: { id },
      include: {
        lesson: {
          select: { organizationId: true },
        },
      },
    });

    if (!existingDebrief) {
      res.status(404).json({ error: 'Debrief not found' });
      return;
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        organizationId: true,
        role: true,
        groupMemberships: {
          where: {
            groupId: existingDebrief.groupId || undefined,
          },
          select: { role: true },
        },
      },
    });

    if (!user || user.organizationId !== existingDebrief.lesson.organizationId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Check permissions: author can delete, or leaders can delete
    const isAuthor = existingDebrief.authorId === userId;
    const isLeader = user.groupMemberships.some(m => m.role === 'leader');
    const isTeacher = user.role === 'TEACHER' || user.role === 'ORG_ADMIN' || user.role === 'SUPER_ADMIN';

    if (!isAuthor && !isLeader && !isTeacher) {
      res.status(403).json({ error: 'Only the author, group leaders, or teachers can delete debriefs' });
      return;
    }

    // Delete the debrief
    await prisma.lessonDebrief.delete({
      where: { id },
    });

    logger.info(`Debrief ${id} deleted by user ${userId}`);
    res.json({ message: 'Debrief deleted successfully' });
  } catch (error) {
    logger.error('Error deleting debrief:', error);
    res.status(500).json({ error: 'Failed to delete debrief' });
  }
}
