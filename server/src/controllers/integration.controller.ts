import { Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';
import { PlanningCenterService } from '../services/planning-center.service';
import { SyncService } from '../services/sync.service';
import { encryptJSON } from '../utils/encryption';
import crypto from 'crypto';

/**
 * List all integrations for an organization
 */
export async function listIntegrations(req: Request, res: Response): Promise<void> {
  try {
    const { orgId } = req.params;

    const integrations = await prisma.externalIntegration.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        provider: true,
        status: true,
        syncEnabled: true,
        syncFrequency: true,
        lastSyncAt: true,
        lastSyncStatus: true,
        nextSyncAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ integrations });
  } catch (error) {
    logger.error('Error listing integrations:', error);
    res.status(500).json({ error: 'Failed to list integrations' });
  }
}

/**
 * Get integration details
 */
export async function getIntegration(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const integration = await prisma.externalIntegration.findUnique({
      where: { id },
      include: {
        groupMappings: {
          include: {
            group: {
              select: { id: true, name: true },
            },
          },
        },
        syncLogs: {
          take: 10,
          orderBy: { startedAt: 'desc' },
        },
      },
    });

    if (!integration) {
      res.status(404).json({ error: 'Integration not found' });
      return;
    }

    // Remove sensitive data
    const { credentialsEncrypted, credentialsIV, credentialsTag, ...safeIntegration } = integration;

    res.json({ integration: safeIntegration });
  } catch (error) {
    logger.error('Error getting integration:', error);
    res.status(500).json({ error: 'Failed to get integration' });
  }
}

/**
 * Delete integration
 */
export async function deleteIntegration(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    await prisma.externalIntegration.delete({
      where: { id },
    });

    res.json({ message: 'Integration deleted successfully' });
  } catch (error) {
    logger.error('Error deleting integration:', error);
    res.status(500).json({ error: 'Failed to delete integration' });
  }
}

/**
 * Update integration settings
 */
export async function updateIntegration(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { syncEnabled, syncFrequency } = req.body;

    const integration = await prisma.externalIntegration.update({
      where: { id },
      data: {
        syncEnabled,
        syncFrequency,
      },
      select: {
        id: true,
        provider: true,
        status: true,
        syncEnabled: true,
        syncFrequency: true,
        lastSyncAt: true,
        lastSyncStatus: true,
      },
    });

    res.json({ integration });
  } catch (error) {
    logger.error('Error updating integration:', error);
    res.status(500).json({ error: 'Failed to update integration' });
  }
}

/**
 * Initiate Planning Center OAuth flow
 */
export async function planningCenterAuth(req: Request, res: Response): Promise<void> {
  try {
    const { orgId } = req.query;

    if (!orgId || typeof orgId !== 'string') {
      res.status(400).json({ error: 'Organization ID required' });
      return;
    }

    // Generate state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');

    // Store state in session or temporary storage
    // For now, we'll include orgId in state (in production, use encrypted session)
    const stateData = JSON.stringify({ orgId, nonce: state });
    const encodedState = Buffer.from(stateData).toString('base64');

    const authUrl = PlanningCenterService.getAuthorizationUrl(encodedState);

    res.json({ authUrl });
  } catch (error) {
    logger.error('Error initiating Planning Center auth:', error);
    res.status(500).json({ error: 'Failed to initiate authorization' });
  }
}

/**
 * Handle Planning Center OAuth callback
 */
export async function planningCenterCallback(req: Request, res: Response): Promise<void> {
  try {
    const { code, state } = req.query;

    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: 'Authorization code required' });
      return;
    }

    if (!state || typeof state !== 'string') {
      res.status(400).json({ error: 'State parameter required' });
      return;
    }

    // Decode state to get orgId
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    const { orgId } = stateData;

    // Exchange code for tokens
    const credentials = await PlanningCenterService.exchangeCodeForToken(code);

    // Encrypt credentials
    const encrypted = encryptJSON(credentials);

    // Create integration
    const integration = await prisma.externalIntegration.create({
      data: {
        organizationId: orgId,
        provider: 'PLANNING_CENTER',
        status: 'ACTIVE',
        credentialsEncrypted: encrypted.encrypted,
        credentialsIV: encrypted.iv,
        credentialsTag: encrypted.tag,
        accessToken: credentials.accessToken,
        refreshToken: credentials.refreshToken,
        tokenExpiresAt: credentials.expiresAt,
        syncEnabled: false,
        syncFrequency: 'DAILY',
      },
    });

    // Test connection
    const pcService = new PlanningCenterService(integration);
    const isConnected = await pcService.testConnection();

    if (!isConnected) {
      await prisma.externalIntegration.update({
        where: { id: integration.id },
        data: { status: 'ERROR' },
      });
      res.redirect(`${process.env.FRONTEND_URL}/admin/integrations?error=connection_failed`);
      return;
    }

    // Fetch initial groups
    const lists = await pcService.fetchLists();

    // Create mappings for all lists (unmapped initially)
    for (const list of lists) {
      await prisma.externalGroupMapping.create({
        data: {
          integrationId: integration.id,
          externalGroupId: list.id,
          externalGroupName: list.attributes.name,
          externalGroupType: list.attributes.list_type,
        },
      });
    }

    // Redirect to frontend success page
    res.redirect(
      `${process.env.FRONTEND_URL}/admin/integrations/${integration.id}?success=true`
    );
  } catch (error) {
    logger.error('Error in Planning Center callback:', error);
    res.redirect(`${process.env.FRONTEND_URL}/admin/integrations?error=auth_failed`);
  }
}

/**
 * Manual sync trigger
 */
export async function triggerSync(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const integration = await prisma.externalIntegration.findUnique({
      where: { id },
    });

    if (!integration) {
      res.status(404).json({ error: 'Integration not found' });
      return;
    }

    // Perform sync
    const syncService = new SyncService(integration);
    const result = await syncService.performSync();

    res.json({ result });
  } catch (error) {
    logger.error('Error triggering sync:', error);
    res.status(500).json({ error: 'Failed to trigger sync' });
  }
}

/**
 * Get sync status
 */
export async function getSyncStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const integration = await prisma.externalIntegration.findUnique({
      where: { id },
      select: {
        lastSyncAt: true,
        lastSyncStatus: true,
        nextSyncAt: true,
        syncEnabled: true,
        syncFrequency: true,
        status: true,
      },
    });

    if (!integration) {
      res.status(404).json({ error: 'Integration not found' });
      return;
    }

    res.json({ sync: integration });
  } catch (error) {
    logger.error('Error getting sync status:', error);
    res.status(500).json({ error: 'Failed to get sync status' });
  }
}

/**
 * Get sync logs
 */
export async function getSyncLogs(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const logs = await prisma.syncLog.findMany({
      where: { integrationId: id },
      orderBy: { startedAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.syncLog.count({
      where: { integrationId: id },
    });

    res.json({ logs, total });
  } catch (error) {
    logger.error('Error getting sync logs:', error);
    res.status(500).json({ error: 'Failed to get sync logs' });
  }
}

/**
 * List external groups
 */
export async function listExternalGroups(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const mappings = await prisma.externalGroupMapping.findMany({
      where: { integrationId: id },
      include: {
        group: {
          select: { id: true, name: true },
        },
      },
      orderBy: { externalGroupName: 'asc' },
    });

    res.json({ groups: mappings });
  } catch (error) {
    logger.error('Error listing external groups:', error);
    res.status(500).json({ error: 'Failed to list external groups' });
  }
}

/**
 * Create group mapping
 */
export async function createGroupMapping(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { externalGroupId, groupId } = req.body;

    const mapping = await prisma.externalGroupMapping.update({
      where: {
        integrationId_externalGroupId: {
          integrationId: id,
          externalGroupId,
        },
      },
      data: { groupId },
      include: {
        group: {
          select: { id: true, name: true },
        },
      },
    });

    res.json({ mapping });
  } catch (error) {
    logger.error('Error creating group mapping:', error);
    res.status(500).json({ error: 'Failed to create group mapping' });
  }
}

/**
 * Update group mapping
 */
export async function updateGroupMapping(req: Request, res: Response): Promise<void> {
  try {
    const { mappingId } = req.params;
    const { groupId, syncMembers, syncLeaders } = req.body;

    const mapping = await prisma.externalGroupMapping.update({
      where: { id: mappingId },
      data: {
        groupId,
        syncMembers,
        syncLeaders,
      },
      include: {
        group: {
          select: { id: true, name: true },
        },
      },
    });

    res.json({ mapping });
  } catch (error) {
    logger.error('Error updating group mapping:', error);
    res.status(500).json({ error: 'Failed to update group mapping' });
  }
}

/**
 * Delete group mapping
 */
export async function deleteGroupMapping(req: Request, res: Response): Promise<void> {
  try {
    const { mappingId } = req.params;

    await prisma.externalGroupMapping.update({
      where: { id: mappingId },
      data: { groupId: null },
    });

    res.json({ message: 'Group mapping removed successfully' });
  } catch (error) {
    logger.error('Error deleting group mapping:', error);
    res.status(500).json({ error: 'Failed to delete group mapping' });
  }
}
