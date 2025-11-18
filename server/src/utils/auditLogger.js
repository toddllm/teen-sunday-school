const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Audit logger utility for tracking role and permission changes
 */
class AuditLogger {
  /**
   * Log a role assignment
   */
  static async logRoleAssignment(performedById, targetUserId, roleId, roleName, scope, req) {
    return await prisma.auditLog.create({
      data: {
        action: 'role_assigned',
        entityType: 'user_role',
        entityId: roleId,
        performedBy: performedById,
        targetUser: targetUserId,
        newValue: {
          roleId,
          roleName,
          scope,
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.headers?.['user-agent'],
      },
    });
  }

  /**
   * Log a role removal
   */
  static async logRoleRemoval(performedById, targetUserId, roleId, roleName, scope, req) {
    return await prisma.auditLog.create({
      data: {
        action: 'role_removed',
        entityType: 'user_role',
        entityId: roleId,
        performedBy: performedById,
        targetUser: targetUserId,
        oldValue: {
          roleId,
          roleName,
          scope,
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.headers?.['user-agent'],
      },
    });
  }

  /**
   * Log a role modification
   */
  static async logRoleModification(performedById, roleId, oldData, newData, req) {
    return await prisma.auditLog.create({
      data: {
        action: 'role_modified',
        entityType: 'role',
        entityId: roleId,
        performedBy: performedById,
        oldValue: oldData,
        newValue: newData,
        metadata: {
          timestamp: new Date().toISOString(),
        },
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.headers?.['user-agent'],
      },
    });
  }

  /**
   * Log a permission change
   */
  static async logPermissionChange(performedById, roleId, action, permissions, req) {
    return await prisma.auditLog.create({
      data: {
        action: `permissions_${action}`, // 'permissions_added' or 'permissions_removed'
        entityType: 'role_permission',
        entityId: roleId,
        performedBy: performedById,
        newValue: {
          permissions,
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.headers?.['user-agent'],
      },
    });
  }

  /**
   * Log user account changes
   */
  static async logUserChange(performedById, targetUserId, action, oldData, newData, req) {
    return await prisma.auditLog.create({
      data: {
        action: `user_${action}`, // 'user_created', 'user_updated', 'user_deactivated'
        entityType: 'user',
        entityId: targetUserId,
        performedBy: performedById,
        targetUser: targetUserId,
        oldValue: oldData,
        newValue: newData,
        metadata: {
          timestamp: new Date().toISOString(),
        },
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.headers?.['user-agent'],
      },
    });
  }

  /**
   * Get audit logs with filters
   */
  static async getAuditLogs(filters = {}, pagination = {}) {
    const {
      action,
      entityType,
      performedBy,
      targetUser,
      startDate,
      endDate,
    } = filters;

    const { page = 1, limit = 50 } = pagination;

    const where = {};

    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (performedBy) where.performedBy = performedBy;
    if (targetUser) where.targetUser = targetUser;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          performer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          target: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = AuditLogger;
