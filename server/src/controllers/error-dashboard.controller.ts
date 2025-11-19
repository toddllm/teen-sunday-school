import { Request, Response } from 'express';
import { PrismaClient, IncidentStatus } from '@prisma/client';
import { logger } from '../config/logger';
import { getErrorStats, getErrorTrends } from '../services/error-tracking.service';

const prisma = new PrismaClient();

/**
 * Get error statistics
 */
export async function getErrorStatistics(req: Request, res: Response) {
  try {
    const organizationId = (req.user as any)?.organizationId;
    const hours = parseInt(req.query.hours as string) || 24;

    const stats = await getErrorStats(organizationId, hours);

    res.json(stats);
  } catch (error) {
    logger.error('Failed to get error statistics:', error);
    res.status(500).json({ error: 'Failed to retrieve error statistics' });
  }
}

/**
 * List errors with pagination and filters
 */
export async function listErrors(req: Request, res: Response) {
  try {
    const organizationId = (req.user as any)?.organizationId;
    const {
      page = '1',
      limit = '20',
      severity,
      status,
      errorType,
      service,
      search,
      startDate,
      endDate,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter conditions
    const where: any = {
      ...(organizationId && { organizationId }),
    };

    if (severity) where.severity = severity;
    if (status) where.status = status;
    if (errorType) where.errorType = errorType;
    if (service) where.service = service;

    if (search) {
      where.OR = [
        { errorMessage: { contains: search as string, mode: 'insensitive' } },
        { errorCode: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const [errors, total] = await Promise.all([
      prisma.errorLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          incident: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      }),
      prisma.errorLog.count({ where }),
    ]);

    res.json({
      data: errors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Failed to list errors:', error);
    res.status(500).json({ error: 'Failed to retrieve errors' });
  }
}

/**
 * Get error details by ID
 */
export async function getErrorById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const organizationId = (req.user as any)?.organizationId;

    const error = await prisma.errorLog.findFirst({
      where: {
        id,
        ...(organizationId && { organizationId }),
      },
      include: {
        incident: true,
      },
    });

    if (!error) {
      return res.status(404).json({ error: 'Error not found' });
    }

    res.json(error);
  } catch (error) {
    logger.error('Failed to get error details:', error);
    res.status(500).json({ error: 'Failed to retrieve error details' });
  }
}

/**
 * Mark error as resolved
 */
export async function resolveError(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { resolution } = req.body;
    const organizationId = (req.user as any)?.organizationId;
    const userId = (req.user as any)?.id;

    const error = await prisma.errorLog.findFirst({
      where: {
        id,
        ...(organizationId && { organizationId }),
      },
    });

    if (!error) {
      return res.status(404).json({ error: 'Error not found' });
    }

    const updatedError = await prisma.errorLog.update({
      where: { id },
      data: {
        status: IncidentStatus.RESOLVED,
        resolvedAt: new Date(),
        resolution,
        assignedTo: userId,
      },
    });

    res.json(updatedError);
  } catch (error) {
    logger.error('Failed to resolve error:', error);
    res.status(500).json({ error: 'Failed to resolve error' });
  }
}

/**
 * Get error trends
 */
export async function getErrorTrendsData(req: Request, res: Response) {
  try {
    const organizationId = (req.user as any)?.organizationId;
    const days = parseInt(req.query.days as string) || 7;

    const trends = await getErrorTrends(organizationId, days);

    res.json(trends);
  } catch (error) {
    logger.error('Failed to get error trends:', error);
    res.status(500).json({ error: 'Failed to retrieve error trends' });
  }
}

/**
 * List incidents with pagination and filters
 */
export async function listIncidents(req: Request, res: Response) {
  try {
    const organizationId = (req.user as any)?.organizationId;
    const {
      page = '1',
      limit = '20',
      severity,
      status,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      ...(organizationId && { organizationId }),
    };

    if (severity) where.severity = severity;
    if (status) where.status = status;

    const [incidents, total] = await Promise.all([
      prisma.errorIncident.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          _count: {
            select: { errorLogs: true },
          },
        },
      }),
      prisma.errorIncident.count({ where }),
    ]);

    res.json({
      data: incidents,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Failed to list incidents:', error);
    res.status(500).json({ error: 'Failed to retrieve incidents' });
  }
}

/**
 * Create a new incident
 */
export async function createIncident(req: Request, res: Response) {
  try {
    const organizationId = (req.user as any)?.organizationId;
    const userId = (req.user as any)?.id;
    const {
      title,
      description,
      severity,
      errorLogIds,
    } = req.body;

    const incident = await prisma.errorIncident.create({
      data: {
        title,
        description,
        severity,
        organizationId,
        reportedBy: userId,
        ...(errorLogIds && errorLogIds.length > 0 && {
          errorLogs: {
            connect: errorLogIds.map((id: string) => ({ id })),
          },
        }),
      },
      include: {
        errorLogs: true,
      },
    });

    res.status(201).json(incident);
  } catch (error) {
    logger.error('Failed to create incident:', error);
    res.status(500).json({ error: 'Failed to create incident' });
  }
}

/**
 * Get incident details by ID
 */
export async function getIncidentById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const organizationId = (req.user as any)?.organizationId;

    const incident = await prisma.errorIncident.findFirst({
      where: {
        id,
        ...(organizationId && { organizationId }),
      },
      include: {
        errorLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.json(incident);
  } catch (error) {
    logger.error('Failed to get incident details:', error);
    res.status(500).json({ error: 'Failed to retrieve incident details' });
  }
}

/**
 * Update incident
 */
export async function updateIncident(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const organizationId = (req.user as any)?.organizationId;
    const {
      title,
      description,
      status,
      severity,
      rootCause,
      solution,
      preventionSteps,
    } = req.body;

    const incident = await prisma.errorIncident.findFirst({
      where: {
        id,
        ...(organizationId && { organizationId }),
      },
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (severity !== undefined) updateData.severity = severity;
    if (rootCause !== undefined) updateData.rootCause = rootCause;
    if (solution !== undefined) updateData.solution = solution;
    if (preventionSteps !== undefined) updateData.preventionSteps = preventionSteps;

    if (status !== undefined) {
      updateData.status = status;
      if (status === IncidentStatus.ACKNOWLEDGED && !incident.acknowledgedAt) {
        updateData.acknowledgedAt = new Date();
      }
      if (status === IncidentStatus.RESOLVED && !incident.resolvedAt) {
        updateData.resolvedAt = new Date();
      }
      if (status === IncidentStatus.CLOSED && !incident.closedAt) {
        updateData.closedAt = new Date();
      }
    }

    const updatedIncident = await prisma.errorIncident.update({
      where: { id },
      data: updateData,
    });

    res.json(updatedIncident);
  } catch (error) {
    logger.error('Failed to update incident:', error);
    res.status(500).json({ error: 'Failed to update incident' });
  }
}

/**
 * Assign incident to user
 */
export async function assignIncident(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;
    const organizationId = (req.user as any)?.organizationId;

    const incident = await prisma.errorIncident.findFirst({
      where: {
        id,
        ...(organizationId && { organizationId }),
      },
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const updatedIncident = await prisma.errorIncident.update({
      where: { id },
      data: {
        assignedTo,
        status: IncidentStatus.ACKNOWLEDGED,
        acknowledgedAt: incident.acknowledgedAt || new Date(),
      },
    });

    res.json(updatedIncident);
  } catch (error) {
    logger.error('Failed to assign incident:', error);
    res.status(500).json({ error: 'Failed to assign incident' });
  }
}

/**
 * Resolve incident
 */
export async function resolveIncident(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { solution, rootCause, preventionSteps } = req.body;
    const organizationId = (req.user as any)?.organizationId;

    const incident = await prisma.errorIncident.findFirst({
      where: {
        id,
        ...(organizationId && { organizationId }),
      },
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const updatedIncident = await prisma.errorIncident.update({
      where: { id },
      data: {
        status: IncidentStatus.RESOLVED,
        resolvedAt: new Date(),
        solution,
        rootCause,
        preventionSteps,
      },
    });

    // Also resolve related error logs
    await prisma.errorLog.updateMany({
      where: { incidentId: id },
      data: {
        status: IncidentStatus.RESOLVED,
        resolvedAt: new Date(),
      },
    });

    res.json(updatedIncident);
  } catch (error) {
    logger.error('Failed to resolve incident:', error);
    res.status(500).json({ error: 'Failed to resolve incident' });
  }
}
