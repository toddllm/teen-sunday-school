import { Request, Response } from 'express';
import { IncidentType, SeverityLevel, IncidentStatus } from '@prisma/client';
import logger from '../config/logger';
import * as incidentService from '../services/incident.service';

/**
 * Incident Reporting Controller
 * Handles behavior and wellbeing incident reports
 */

/**
 * POST /api/incidents
 * Create a new incident report
 */
export const createIncident = async (req: Request, res: Response) => {
  try {
    const { organizationId, id: userId } = req.user!;
    const {
      studentName,
      studentId,
      groupId,
      incidentType,
      severity,
      incidentDate,
      location,
      description,
      witnessNames,
      othersInvolved,
      isConfidential,
    } = req.body;

    // Validate required fields
    if (!incidentType || !severity || !incidentDate || !description) {
      return res.status(400).json({
        error: 'Missing required fields: incidentType, severity, incidentDate, description',
      });
    }

    // Validate enums
    if (!Object.values(IncidentType).includes(incidentType)) {
      return res.status(400).json({
        error: `Invalid incident type: ${incidentType}`,
        validTypes: Object.values(IncidentType),
      });
    }

    if (!Object.values(SeverityLevel).includes(severity)) {
      return res.status(400).json({
        error: `Invalid severity level: ${severity}`,
        validLevels: Object.values(SeverityLevel),
      });
    }

    // Create the incident
    const incident = await incidentService.createIncident({
      organizationId,
      reportedById: userId,
      studentName,
      studentId,
      groupId,
      incidentType,
      severity,
      incidentDate: new Date(incidentDate),
      location,
      description,
      witnessNames,
      othersInvolved,
      isConfidential,
    });

    res.status(201).json(incident);
  } catch (error) {
    logger.error('Error creating incident report:', error);
    res.status(500).json({ error: 'Failed to create incident report' });
  }
};

/**
 * GET /api/incidents/:id
 * Get a specific incident report
 */
export const getIncident = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user!;

    const incident = await incidentService.getIncidentById(id, organizationId);

    if (!incident) {
      return res.status(404).json({ error: 'Incident report not found' });
    }

    res.json(incident);
  } catch (error) {
    logger.error('Error fetching incident report:', error);
    res.status(500).json({ error: 'Failed to fetch incident report' });
  }
};

/**
 * GET /api/incidents
 * List incident reports with filters
 */
export const listIncidents = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const {
      status,
      incidentType,
      severity,
      groupId,
      assignedTo,
      studentId,
      dateFrom,
      dateTo,
      limit = 50,
      offset = 0,
    } = req.query;

    const filters: any = {
      organizationId,
    };

    if (status) filters.status = status as IncidentStatus;
    if (incidentType) filters.incidentType = incidentType as IncidentType;
    if (severity) filters.severity = severity as SeverityLevel;
    if (groupId) filters.groupId = groupId as string;
    if (assignedTo) filters.assignedTo = assignedTo as string;
    if (studentId) filters.studentId = studentId as string;
    if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
    if (dateTo) filters.dateTo = new Date(dateTo as string);

    const result = await incidentService.listIncidents(
      filters,
      Number(limit),
      Number(offset)
    );

    res.json(result);
  } catch (error) {
    logger.error('Error listing incident reports:', error);
    res.status(500).json({ error: 'Failed to list incident reports' });
  }
};

/**
 * PATCH /api/incidents/:id
 * Update an incident report (for follow-up actions)
 */
export const updateIncident = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user!;
    const {
      assignedTo,
      leaderNotes,
      actionTaken,
      followUpDate,
      parentNotified,
      parentNotifiedAt,
      status,
      resolvedAt,
    } = req.body;

    // Validate status if provided
    if (status && !Object.values(IncidentStatus).includes(status)) {
      return res.status(400).json({
        error: `Invalid status: ${status}`,
        validStatuses: Object.values(IncidentStatus),
      });
    }

    const updateData: any = {};
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (leaderNotes !== undefined) updateData.leaderNotes = leaderNotes;
    if (actionTaken !== undefined) updateData.actionTaken = actionTaken;
    if (followUpDate !== undefined) updateData.followUpDate = followUpDate ? new Date(followUpDate) : null;
    if (parentNotified !== undefined) updateData.parentNotified = parentNotified;
    if (parentNotifiedAt !== undefined) updateData.parentNotifiedAt = parentNotifiedAt ? new Date(parentNotifiedAt) : null;
    if (status !== undefined) updateData.status = status;
    if (resolvedAt !== undefined) updateData.resolvedAt = resolvedAt ? new Date(resolvedAt) : null;

    const incident = await incidentService.updateIncident(
      id,
      organizationId,
      updateData
    );

    res.json(incident);
  } catch (error) {
    logger.error('Error updating incident report:', error);
    res.status(500).json({ error: 'Failed to update incident report' });
  }
};

/**
 * DELETE /api/incidents/:id
 * Delete an incident report (admin only)
 */
export const deleteIncident = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user!;

    await incidentService.deleteIncident(id, organizationId);

    res.json({ message: 'Incident report deleted successfully' });
  } catch (error) {
    logger.error('Error deleting incident report:', error);
    res.status(500).json({ error: 'Failed to delete incident report' });
  }
};

/**
 * GET /api/incidents/stats
 * Get incident statistics for the organization
 */
export const getIncidentStats = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { days = 30 } = req.query;

    const stats = await incidentService.getIncidentStats(
      organizationId,
      Number(days)
    );

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching incident statistics:', error);
    res.status(500).json({ error: 'Failed to fetch incident statistics' });
  }
};

/**
 * GET /api/incidents/attention
 * Get incidents requiring immediate attention
 */
export const getIncidentsRequiringAttention = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;

    const incidents = await incidentService.getIncidentsRequiringAttention(organizationId);

    res.json(incidents);
  } catch (error) {
    logger.error('Error fetching incidents requiring attention:', error);
    res.status(500).json({ error: 'Failed to fetch incidents requiring attention' });
  }
};

/**
 * GET /api/incidents/enums
 * Get available enums for incident types, severity levels, and statuses
 */
export const getIncidentEnums = async (req: Request, res: Response) => {
  try {
    const incidentTypes = Object.values(IncidentType).map(type => ({
      value: type,
      label: type.split('_').map(word =>
        word.charAt(0) + word.slice(1).toLowerCase()
      ).join(' '),
    }));

    const severityLevels = Object.values(SeverityLevel).map(level => ({
      value: level,
      label: level.charAt(0) + level.slice(1).toLowerCase(),
    }));

    const statuses = Object.values(IncidentStatus).map(status => ({
      value: status,
      label: status.split('_').map(word =>
        word.charAt(0) + word.slice(1).toLowerCase()
      ).join(' '),
    }));

    res.json({
      incidentTypes,
      severityLevels,
      statuses,
    });
  } catch (error) {
    logger.error('Error fetching incident enums:', error);
    res.status(500).json({ error: 'Failed to fetch incident enums' });
  }
};
