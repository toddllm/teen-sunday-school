import { Request, Response } from 'express';
import { AttendanceService } from '../services/attendance.service';
import { SessionService } from '../services/session.service';
import logger from '../config/logger';
import { AttendanceStatus } from '@prisma/client';

/**
 * Check-in to a session (self check-in)
 */
export async function checkIn(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params; // session ID
    const userId = (req as any).user.userId;

    const attendance = await AttendanceService.checkIn({
      sessionId: id,
      userId,
    });

    res.status(201).json(attendance);
  } catch (error: any) {
    logger.error('Error during check-in:', error);

    if (error.message === 'Check-in is not currently open for this session') {
      res.status(400).json({ error: error.message });
    } else if (error.message === 'User is not a member of this group') {
      res.status(403).json({ error: error.message });
    } else if (error.message === 'Session not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to check in' });
    }
  }
}

/**
 * Mark attendance manually (leader functionality)
 */
export async function markAttendance(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params; // session ID
    const { userId, status, notes } = req.body;
    const checkedInBy = (req as any).user.userId;

    // Validate required fields
    if (!userId || !status) {
      res.status(400).json({ error: 'userId and status are required' });
      return;
    }

    // Validate status
    const validStatuses: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid attendance status' });
      return;
    }

    // Verify session exists and user has access
    const session = await SessionService.getSessionById(id);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const userOrgId = (req as any).user.organizationId;
    if (session.organizationId !== userOrgId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const attendance = await AttendanceService.markAttendance({
      sessionId: id,
      userId,
      status,
      checkedInBy,
      notes,
    });

    res.json(attendance);
  } catch (error: any) {
    logger.error('Error marking attendance:', error);

    if (error.message === 'User is not a member of this group') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to mark attendance' });
    }
  }
}

/**
 * Get attendance for a specific session
 */
export async function getSessionAttendance(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Verify session exists and user has access
    const session = await SessionService.getSessionById(id);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const userOrgId = (req as any).user.organizationId;
    if (session.organizationId !== userOrgId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const attendance = await AttendanceService.getSessionAttendance(id);
    res.json(attendance);
  } catch (error) {
    logger.error('Error fetching session attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
}

/**
 * Get attendance report for a session
 */
export async function getAttendanceReport(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Verify session exists and user has access
    const session = await SessionService.getSessionById(id);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const userOrgId = (req as any).user.organizationId;
    if (session.organizationId !== userOrgId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const report = await AttendanceService.getAttendanceReport(id);
    res.json(report);
  } catch (error) {
    logger.error('Error generating attendance report:', error);
    res.status(500).json({ error: 'Failed to generate attendance report' });
  }
}

/**
 * Get attendance for a specific user
 */
export async function getUserAttendance(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const { startDate, endDate, groupId } = req.query;

    // Users can only view their own attendance unless they're a leader/admin
    const requestingUserId = (req as any).user.userId;
    const userRole = (req as any).user.role;

    if (
      userId !== requestingUserId &&
      userRole !== 'TEACHER' &&
      userRole !== 'ORG_ADMIN' &&
      userRole !== 'SUPER_ADMIN'
    ) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const attendance = await AttendanceService.getUserAttendance(userId, {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      groupId: groupId as string,
    });

    res.json(attendance);
  } catch (error) {
    logger.error('Error fetching user attendance:', error);
    res.status(500).json({ error: 'Failed to fetch user attendance' });
  }
}

/**
 * Get group attendance summary
 */
export async function getGroupAttendanceSummary(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { groupId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'startDate and endDate are required' });
      return;
    }

    // Verify user has access to this organization
    // (group membership will be checked by the service)
    const summary = await AttendanceService.getGroupAttendanceSummary(
      groupId,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json(summary);
  } catch (error) {
    logger.error('Error generating group attendance summary:', error);
    res.status(500).json({ error: 'Failed to generate attendance summary' });
  }
}

/**
 * Delete an attendance record
 */
export async function deleteAttendance(req: Request, res: Response): Promise<void> {
  try {
    const { attendanceId } = req.params;

    // Note: Should verify user has permission to delete attendance
    // This would typically be restricted to leaders/admins

    await AttendanceService.deleteAttendance(attendanceId);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting attendance:', error);
    res.status(500).json({ error: 'Failed to delete attendance' });
  }
}
