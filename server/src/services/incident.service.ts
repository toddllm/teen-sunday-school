import { PrismaClient, IncidentType, SeverityLevel, IncidentStatus } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

/**
 * Incident Reporting Service
 * Manages behavior and wellbeing incident reports
 */

export interface CreateIncidentData {
  organizationId: string;
  reportedById?: string;
  studentName?: string;
  studentId?: string;
  groupId?: string;
  incidentType: IncidentType;
  severity: SeverityLevel;
  incidentDate: Date;
  location?: string;
  description: string;
  witnessNames?: string;
  othersInvolved?: string;
  isConfidential?: boolean;
}

export interface UpdateIncidentData {
  assignedTo?: string;
  leaderNotes?: string;
  actionTaken?: string;
  followUpDate?: Date;
  parentNotified?: boolean;
  parentNotifiedAt?: Date;
  status?: IncidentStatus;
  resolvedAt?: Date;
}

export interface IncidentFilters {
  organizationId: string;
  status?: IncidentStatus;
  incidentType?: IncidentType;
  severity?: SeverityLevel;
  groupId?: string;
  assignedTo?: string;
  studentId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Create a new incident report
 */
export async function createIncident(data: CreateIncidentData) {
  try {
    const incident = await prisma.incidentReport.create({
      data: {
        organizationId: data.organizationId,
        reportedById: data.reportedById,
        studentName: data.studentName,
        studentId: data.studentId,
        groupId: data.groupId,
        incidentType: data.incidentType,
        severity: data.severity,
        incidentDate: data.incidentDate,
        location: data.location,
        description: data.description,
        witnessNames: data.witnessNames,
        othersInvolved: data.othersInvolved,
        isConfidential: data.isConfidential ?? true,
      },
      include: {
        reportedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedLeader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    logger.info(`Incident report created: ${incident.id}`);
    return incident;
  } catch (error) {
    logger.error('Error creating incident report:', error);
    throw error;
  }
}

/**
 * Get incident report by ID
 */
export async function getIncidentById(id: string, organizationId: string) {
  try {
    const incident = await prisma.incidentReport.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        reportedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedLeader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return incident;
  } catch (error) {
    logger.error(`Error fetching incident ${id}:`, error);
    throw error;
  }
}

/**
 * List incident reports with filters
 */
export async function listIncidents(filters: IncidentFilters, limit: number = 50, offset: number = 0) {
  try {
    const where: any = {
      organizationId: filters.organizationId,
    };

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.incidentType) {
      where.incidentType = filters.incidentType;
    }
    if (filters.severity) {
      where.severity = filters.severity;
    }
    if (filters.groupId) {
      where.groupId = filters.groupId;
    }
    if (filters.assignedTo) {
      where.assignedTo = filters.assignedTo;
    }
    if (filters.studentId) {
      where.studentId = filters.studentId;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.incidentDate = {};
      if (filters.dateFrom) {
        where.incidentDate.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.incidentDate.lte = filters.dateTo;
      }
    }

    const [incidents, total] = await Promise.all([
      prisma.incidentReport.findMany({
        where,
        include: {
          reportedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
            },
          },
          assignedLeader: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          incidentDate: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.incidentReport.count({ where }),
    ]);

    return {
      incidents,
      total,
      limit,
      offset,
    };
  } catch (error) {
    logger.error('Error listing incidents:', error);
    throw error;
  }
}

/**
 * Update an incident report
 */
export async function updateIncident(
  id: string,
  organizationId: string,
  data: UpdateIncidentData
) {
  try {
    // If status is being changed to RESOLVED and no resolvedAt is set, set it now
    if (data.status === 'RESOLVED' && !data.resolvedAt) {
      data.resolvedAt = new Date();
    }

    // If parentNotified is being set to true and no parentNotifiedAt, set it now
    if (data.parentNotified === true && !data.parentNotifiedAt) {
      data.parentNotifiedAt = new Date();
    }

    const incident = await prisma.incidentReport.update({
      where: {
        id,
        organizationId,
      },
      data,
      include: {
        reportedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedLeader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    logger.info(`Incident report updated: ${id}`);
    return incident;
  } catch (error) {
    logger.error(`Error updating incident ${id}:`, error);
    throw error;
  }
}

/**
 * Delete an incident report (admin only)
 */
export async function deleteIncident(id: string, organizationId: string) {
  try {
    await prisma.incidentReport.delete({
      where: {
        id,
        organizationId,
      },
    });

    logger.info(`Incident report deleted: ${id}`);
  } catch (error) {
    logger.error(`Error deleting incident ${id}:`, error);
    throw error;
  }
}

/**
 * Get incident statistics for an organization
 */
export async function getIncidentStats(organizationId: string, days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const incidents = await prisma.incidentReport.findMany({
      where: {
        organizationId,
        incidentDate: { gte: startDate },
      },
    });

    const stats = {
      total: incidents.length,
      byStatus: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      pending: 0,
      inProgress: 0,
      resolved: 0,
      critical: 0,
      high: 0,
      averageResolutionTimeHours: 0,
    };

    let totalResolutionTime = 0;
    let resolvedCount = 0;

    incidents.forEach(incident => {
      // Count by status
      stats.byStatus[incident.status] = (stats.byStatus[incident.status] || 0) + 1;

      // Count by type
      stats.byType[incident.incidentType] = (stats.byType[incident.incidentType] || 0) + 1;

      // Count by severity
      stats.bySeverity[incident.severity] = (stats.bySeverity[incident.severity] || 0) + 1;

      // Quick status counts
      if (incident.status === 'PENDING') stats.pending++;
      if (incident.status === 'IN_PROGRESS') stats.inProgress++;
      if (incident.status === 'RESOLVED') stats.resolved++;

      // Quick severity counts
      if (incident.severity === 'CRITICAL') stats.critical++;
      if (incident.severity === 'HIGH') stats.high++;

      // Calculate resolution time
      if (incident.resolvedAt) {
        const resolutionTime = incident.resolvedAt.getTime() - incident.reportedAt.getTime();
        totalResolutionTime += resolutionTime;
        resolvedCount++;
      }
    });

    // Calculate average resolution time in hours
    if (resolvedCount > 0) {
      stats.averageResolutionTimeHours = Math.round(
        totalResolutionTime / resolvedCount / (1000 * 60 * 60)
      );
    }

    return stats;
  } catch (error) {
    logger.error('Error fetching incident statistics:', error);
    throw error;
  }
}

/**
 * Get incidents requiring attention (pending or high priority)
 */
export async function getIncidentsRequiringAttention(organizationId: string) {
  try {
    const incidents = await prisma.incidentReport.findMany({
      where: {
        organizationId,
        OR: [
          { status: 'PENDING' },
          { severity: 'CRITICAL' },
          {
            AND: [
              { severity: 'HIGH' },
              { status: { not: 'RESOLVED' } },
            ],
          },
        ],
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedLeader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { severity: 'desc' },
        { incidentDate: 'desc' },
      ],
      take: 20,
    });

    return incidents;
  } catch (error) {
    logger.error('Error fetching incidents requiring attention:', error);
    throw error;
  }
}
