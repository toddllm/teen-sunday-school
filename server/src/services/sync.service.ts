import { ExternalIntegration, SyncStatus } from '@prisma/client';
import prisma from '../config/database';
import logger from '../config/logger';
import { PlanningCenterService, PlanningCenterPerson } from './planning-center.service';
import bcrypt from 'bcrypt';

interface SyncResult {
  status: SyncStatus;
  peopleAdded: number;
  peopleUpdated: number;
  peopleRemoved: number;
  groupsAdded: number;
  groupsUpdated: number;
  groupsSkipped: number;
  errorMessage?: string;
  metadata?: any;
}

export class SyncService {
  constructor(private integration: ExternalIntegration) {}

  /**
   * Perform full sync from Planning Center
   */
  async performSync(): Promise<SyncResult> {
    const startTime = Date.now();

    // Create sync log
    const syncLog = await prisma.syncLog.create({
      data: {
        integrationId: this.integration.id,
        status: 'SUCCESS',
        startedAt: new Date(),
      },
    });

    const result: SyncResult = {
      status: 'SUCCESS',
      peopleAdded: 0,
      peopleUpdated: 0,
      peopleRemoved: 0,
      groupsAdded: 0,
      groupsUpdated: 0,
      groupsSkipped: 0,
    };

    try {
      logger.info(`Starting sync for integration ${this.integration.id}`);

      const pcService = new PlanningCenterService(this.integration);

      // Step 1: Sync groups (lists) from Planning Center
      await this.syncGroups(pcService, result);

      // Step 2: Sync people from mapped groups
      await this.syncPeople(pcService, result);

      // Step 3: Remove people no longer in groups
      await this.removePeopleNotInGroups(result);

      // Update integration last sync time
      await prisma.externalIntegration.update({
        where: { id: this.integration.id },
        data: {
          lastSyncAt: new Date(),
          lastSyncStatus: 'SUCCESS',
          status: 'ACTIVE',
        },
      });

      logger.info(`Sync completed successfully for integration ${this.integration.id}`);
    } catch (error: any) {
      logger.error(`Sync failed for integration ${this.integration.id}:`, error);

      result.status = 'ERROR';
      result.errorMessage = error.message;

      await prisma.externalIntegration.update({
        where: { id: this.integration.id },
        data: {
          lastSyncStatus: 'ERROR',
          status: 'ERROR',
        },
      });
    } finally {
      const duration = Date.now() - startTime;

      // Update sync log
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: result.status,
          completedAt: new Date(),
          durationMs: duration,
          peopleAdded: result.peopleAdded,
          peopleUpdated: result.peopleUpdated,
          peopleRemoved: result.peopleRemoved,
          groupsAdded: result.groupsAdded,
          groupsUpdated: result.groupsUpdated,
          groupsSkipped: result.groupsSkipped,
          errorMessage: result.errorMessage,
          metadata: result.metadata,
        },
      });
    }

    return result;
  }

  /**
   * Sync groups (lists) from Planning Center
   */
  private async syncGroups(
    pcService: PlanningCenterService,
    result: SyncResult
  ): Promise<void> {
    logger.info('Syncing groups from Planning Center');

    const lists = await pcService.fetchLists();

    for (const list of lists) {
      // Check if mapping exists
      const mapping = await prisma.externalGroupMapping.findUnique({
        where: {
          integrationId_externalGroupId: {
            integrationId: this.integration.id,
            externalGroupId: list.id,
          },
        },
        include: { group: true },
      });

      if (mapping) {
        // Update existing mapping
        await prisma.externalGroupMapping.update({
          where: { id: mapping.id },
          data: {
            externalGroupName: list.attributes.name,
            externalGroupType: list.attributes.list_type,
          },
        });

        // Update group if mapped
        if (mapping.groupId) {
          await prisma.group.update({
            where: { id: mapping.groupId },
            data: {
              name: list.attributes.name,
              description: list.attributes.description,
              externalId: list.id,
            },
          });
          result.groupsUpdated++;
        } else {
          result.groupsSkipped++;
        }
      } else {
        // Create new mapping (unmapped)
        await prisma.externalGroupMapping.create({
          data: {
            integrationId: this.integration.id,
            externalGroupId: list.id,
            externalGroupName: list.attributes.name,
            externalGroupType: list.attributes.list_type,
          },
        });
        result.groupsAdded++;
      }
    }

    logger.info(
      `Groups synced: ${result.groupsAdded} added, ${result.groupsUpdated} updated, ${result.groupsSkipped} skipped`
    );
  }

  /**
   * Sync people from mapped groups
   */
  private async syncPeople(
    pcService: PlanningCenterService,
    result: SyncResult
  ): Promise<void> {
    logger.info('Syncing people from mapped groups');

    // Get all mapped groups
    const mappings = await prisma.externalGroupMapping.findMany({
      where: {
        integrationId: this.integration.id,
        groupId: { not: null },
        syncMembers: true,
      },
      include: { group: true },
    });

    for (const mapping of mappings) {
      if (!mapping.groupId) continue;

      try {
        // Fetch people from Planning Center list
        const people = await pcService.fetchPeopleFromList(mapping.externalGroupId);

        for (const person of people) {
          await this.syncPerson(person, mapping.groupId, result);
        }
      } catch (error) {
        logger.error(`Error syncing people from group ${mapping.externalGroupName}:`, error);
        // Continue with other groups
      }
    }

    logger.info(
      `People synced: ${result.peopleAdded} added, ${result.peopleUpdated} updated`
    );
  }

  /**
   * Sync individual person
   */
  private async syncPerson(
    pcPerson: PlanningCenterPerson,
    groupId: string,
    result: SyncResult
  ): Promise<void> {
    const email = pcPerson.attributes.email;

    if (!email) {
      // Skip people without email
      return;
    }

    // Check if user exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { externalId: pcPerson.id },
        ],
      },
    });

    if (user) {
      // Update existing user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: pcPerson.attributes.first_name,
          lastName: pcPerson.attributes.last_name,
          externalId: pcPerson.id,
          externalData: pcPerson.attributes as any,
        },
      });
      result.peopleUpdated++;
    } else {
      // Create new user
      const organization = await prisma.externalIntegration.findUnique({
        where: { id: this.integration.id },
        select: { organizationId: true },
      });

      if (!organization) {
        throw new Error('Organization not found for integration');
      }

      // Generate temporary password (user should reset on first login)
      const tempPassword = this.generateTemporaryPassword();
      const passwordHash = await bcrypt.hash(tempPassword, 12);

      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName: pcPerson.attributes.first_name,
          lastName: pcPerson.attributes.last_name,
          organizationId: organization.organizationId,
          role: 'MEMBER',
          externalId: pcPerson.id,
          externalData: pcPerson.attributes as any,
        },
      });
      result.peopleAdded++;
    }

    // Add to group if not already a member
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: user.id,
          groupId,
        },
      },
    });

    if (!membership) {
      await prisma.groupMember.create({
        data: {
          userId: user.id,
          groupId,
          role: 'member',
        },
      });
    }
  }

  /**
   * Remove people who are no longer in any synced groups
   */
  private async removePeopleNotInGroups(result: SyncResult): Promise<void> {
    // Get all users synced from this integration
    const syncedUsers = await prisma.user.findMany({
      where: {
        externalId: { not: null },
        organization: {
          integrations: {
            some: { id: this.integration.id },
          },
        },
      },
      include: {
        groupMemberships: {
          include: {
            group: {
              include: {
                mappings: true,
              },
            },
          },
        },
      },
    });

    for (const user of syncedUsers) {
      // Check if user is in any mapped group
      const isinMappedGroup = user.groupMemberships.some((membership) =>
        membership.group.mappings.some(
          (mapping) => mapping.integrationId === this.integration.id
        )
      );

      if (!isinMappedGroup) {
        // Remove user's group memberships
        await prisma.groupMember.deleteMany({
          where: { userId: user.id },
        });

        // Optionally deactivate user instead of deleting
        await prisma.user.update({
          where: { id: user.id },
          data: { isActive: false },
        });

        result.peopleRemoved++;
      }
    }

    logger.info(`Removed ${result.peopleRemoved} people no longer in synced groups`);
  }

  /**
   * Generate temporary password
   */
  private generateTemporaryPassword(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
