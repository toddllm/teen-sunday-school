import { Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Get all substitute assignments for the logged-in user
 */
export async function getMyAssignments(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const assignments = await prisma.substituteAssignment.findMany({
      where: {
        substituteId: userId,
        status: {
          in: ['SCHEDULED', 'ACCEPTED', 'IN_PROGRESS']
        }
      },
      include: {
        // Include group details
      },
      orderBy: {
        scheduledDate: 'asc'
      }
    });

    res.json({ assignments });
  } catch (error) {
    logger.error('Error fetching substitute assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
}

/**
 * Get quick-start package for a specific assignment
 * Includes: lesson, group info, students, materials, emergency contacts
 */
export async function getQuickStartPackage(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    const { assignmentId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get the assignment
    const assignment = await prisma.substituteAssignment.findUnique({
      where: { id: assignmentId }
    });

    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    // Verify this assignment belongs to the requesting user
    if (assignment.substituteId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Get group details with members
    const group = await prisma.group.findUnique({
      where: { id: assignment.groupId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Get lesson details if assigned
    let lesson = null;
    if (assignment.lessonId) {
      lesson = await prisma.lesson.findUnique({
        where: { id: assignment.lessonId }
      });
    } else {
      // Find the most recent lesson for this group
      const lessonGroup = await prisma.lessonGroup.findFirst({
        where: { groupId: assignment.groupId },
        include: {
          lesson: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      lesson = lessonGroup?.lesson || null;
    }

    // Get regular teacher info
    let regularTeacher = null;
    if (assignment.regularTeacherId) {
      regularTeacher = await prisma.user.findUnique({
        where: { id: assignment.regularTeacherId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      });
    }

    // Get default quick-start preset for organization
    const preset = await prisma.quickStartPreset.findFirst({
      where: {
        organizationId: assignment.organizationId,
        isDefault: true
      }
    });

    // Prepare the quick-start package
    const quickStartPackage = {
      assignment: {
        id: assignment.id,
        scheduledDate: assignment.scheduledDate,
        notes: assignment.notes,
        emergencyContacts: assignment.emergencyContacts,
        customMaterials: assignment.customMaterials,
        status: assignment.status
      },
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        ageMin: group.ageMin,
        ageMax: group.ageMax,
        grade: group.grade,
        memberCount: group.members.length,
        leaders: group.members
          .filter(m => m.role === 'leader')
          .map(m => ({
            id: m.user.id,
            name: `${m.user.firstName} ${m.user.lastName}`,
            email: m.user.email
          })),
        students: group.members
          .filter(m => m.role === 'member')
          .map(m => ({
            id: m.user.id,
            name: `${m.user.firstName} ${m.user.lastName}`
          }))
      },
      lesson: lesson ? {
        id: lesson.id,
        title: lesson.title,
        quarter: lesson.quarter,
        unit: lesson.unit,
        lessonNumber: lesson.lessonNumber,
        scripture: lesson.scripture,
        content: lesson.content,
        slides: lesson.slides,
        games: lesson.games
      } : null,
      regularTeacher: regularTeacher ? {
        name: `${regularTeacher.firstName} ${regularTeacher.lastName}`,
        email: regularTeacher.email
      } : null,
      preset: preset || {
        includeSlides: true,
        includeGames: true,
        includeDiscussion: true,
        includeScripture: true,
        includeGroupRoster: true,
        includeEmergencyInfo: true,
        autoLoadPresentation: true,
        simplifiedView: true,
        backupActivities: null,
        iceBreakers: null
      }
    };

    res.json({ package: quickStartPackage });
  } catch (error) {
    logger.error('Error fetching quick-start package:', error);
    res.status(500).json({ error: 'Failed to fetch quick-start package' });
  }
}

/**
 * Update assignment status (accept, start, complete)
 */
export async function updateAssignmentStatus(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    const { assignmentId } = req.params;
    const { status, notes } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Validate status
    const validStatuses = ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    // Get the assignment
    const assignment = await prisma.substituteAssignment.findUnique({
      where: { id: assignmentId }
    });

    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    // Verify ownership
    if (assignment.substituteId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Prepare update data
    const updateData: any = { status };

    if (status === 'ACCEPTED' && !assignment.acceptedAt) {
      updateData.acceptedAt = new Date();
    }

    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
      if (notes) {
        updateData.substituteNotes = notes;
      }
    }

    // Update assignment
    const updated = await prisma.substituteAssignment.update({
      where: { id: assignmentId },
      data: updateData
    });

    res.json({ assignment: updated });
  } catch (error) {
    logger.error('Error updating assignment status:', error);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
}

/**
 * Create a new substitute assignment (for admins/leaders)
 */
export async function createAssignment(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const organizationId = (req as any).user?.organizationId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Only ORG_ADMIN, TEACHER, or group leaders can create assignments
    if (userRole !== 'ORG_ADMIN' && userRole !== 'TEACHER') {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    const {
      substituteId,
      groupId,
      scheduledDate,
      lessonId,
      regularTeacherId,
      notes,
      emergencyContacts,
      customMaterials
    } = req.body;

    // Validate required fields
    if (!substituteId || !groupId || !scheduledDate) {
      res.status(400).json({ error: 'substituteId, groupId, and scheduledDate are required' });
      return;
    }

    // Verify substitute user exists
    const substitute = await prisma.user.findUnique({
      where: { id: substituteId }
    });

    if (!substitute) {
      res.status(404).json({ error: 'Substitute teacher not found' });
      return;
    }

    // Verify group exists and belongs to same organization
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    });

    if (!group || group.organizationId !== organizationId) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Create assignment
    const assignment = await prisma.substituteAssignment.create({
      data: {
        organizationId,
        substituteId,
        groupId,
        scheduledDate: new Date(scheduledDate),
        lessonId,
        regularTeacherId,
        notes,
        emergencyContacts,
        customMaterials,
        status: 'SCHEDULED'
      }
    });

    res.status(201).json({ assignment });
  } catch (error) {
    logger.error('Error creating substitute assignment:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
}

/**
 * Get today's assignments for quick access
 */
export async function getTodayAssignments(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const assignments = await prisma.substituteAssignment.findMany({
      where: {
        substituteId: userId,
        scheduledDate: {
          gte: today,
          lt: tomorrow
        },
        status: {
          in: ['SCHEDULED', 'ACCEPTED', 'IN_PROGRESS']
        }
      },
      orderBy: {
        scheduledDate: 'asc'
      }
    });

    res.json({ assignments });
  } catch (error) {
    logger.error('Error fetching today assignments:', error);
    res.status(500).json({ error: 'Failed to fetch today assignments' });
  }
}
