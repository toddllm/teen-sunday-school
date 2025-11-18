const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const {
  authenticate,
  requirePermission,
  requireSuperAdmin,
} = require('../middleware/auth');
const AuditLogger = require('../utils/auditLogger');

const router = express.Router();
const prisma = new PrismaClient();

// All admin routes require authentication
router.use(authenticate);

/**
 * GET /api/admin/users
 * Search and list users with their roles
 */
router.get(
  '/users',
  requirePermission('users:read'),
  [
    query('search').optional().trim(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('role').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { search, page = 1, limit = 20, role } = req.query;

      const where = {};

      // Search by email or name
      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Filter by role
      if (role) {
        where.userRoles = {
          some: {
            role: {
              name: role,
            },
          },
        };
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: {
            userRoles: {
              include: {
                role: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true,
                  },
                },
              },
            },
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
            createdAt: true,
            lastLoginAt: true,
            userRoles: true,
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.user.count({ where }),
      ]);

      const formattedUsers = users.map(user => ({
        ...user,
        roles: user.userRoles.map(ur => ({
          id: ur.role.id,
          name: ur.role.name,
          displayName: ur.role.displayName,
          scope: ur.scope,
          assignedAt: ur.createdAt,
        })),
        userRoles: undefined,
      }));

      res.json({
        users: formattedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
);

/**
 * GET /api/admin/users/:id
 * Get specific user details
 */
router.get(
  '/users/:id',
  requirePermission('users:read'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          userRoles: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const permissions = [
        ...new Set(
          user.userRoles.flatMap(ur =>
            ur.role.rolePermissions.map(rp => rp.permission.name)
          )
        ),
      ];

      res.json({
        user: {
          ...user,
          roles: user.userRoles.map(ur => ({
            id: ur.role.id,
            name: ur.role.name,
            displayName: ur.role.displayName,
            scope: ur.scope,
            assignedAt: ur.createdAt,
          })),
          permissions,
          userRoles: undefined,
        },
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
);

/**
 * POST /api/admin/users/:id/roles
 * Assign role to user (Super Admin only)
 */
router.post(
  '/users/:id/roles',
  requireSuperAdmin,
  [
    body('roleId').isUUID(),
    body('scope').optional().trim().default('global'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id: userId } = req.params;
      const { roleId, scope } = req.body;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if role exists
      const role = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      // Check if user already has this role
      const existingUserRole = await prisma.userRole.findUnique({
        where: {
          userId_roleId_scope: {
            userId,
            roleId,
            scope,
          },
        },
      });

      if (existingUserRole) {
        return res.status(400).json({ error: 'User already has this role' });
      }

      // Assign role
      const userRole = await prisma.userRole.create({
        data: {
          userId,
          roleId,
          scope,
          assignedBy: req.user.id,
        },
      });

      // Log the role assignment
      await AuditLogger.logRoleAssignment(
        req.user.id,
        userId,
        roleId,
        role.name,
        scope,
        req
      );

      res.status(201).json({
        message: 'Role assigned successfully',
        userRole: {
          ...userRole,
          role: {
            id: role.id,
            name: role.name,
            displayName: role.displayName,
          },
        },
      });
    } catch (error) {
      console.error('Assign role error:', error);
      res.status(500).json({ error: 'Failed to assign role' });
    }
  }
);

/**
 * DELETE /api/admin/users/:id/roles/:roleId
 * Remove role from user (Super Admin only)
 */
router.delete(
  '/users/:id/roles/:roleId',
  requireSuperAdmin,
  [
    query('scope').optional().trim().default('global'),
  ],
  async (req, res) => {
    try {
      const { id: userId, roleId } = req.params;
      const { scope = 'global' } = req.query;

      // Find the user role
      const userRole = await prisma.userRole.findUnique({
        where: {
          userId_roleId_scope: {
            userId,
            roleId,
            scope,
          },
        },
        include: {
          role: true,
        },
      });

      if (!userRole) {
        return res.status(404).json({ error: 'User role not found' });
      }

      // Delete the user role
      await prisma.userRole.delete({
        where: {
          userId_roleId_scope: {
            userId,
            roleId,
            scope,
          },
        },
      });

      // Log the role removal
      await AuditLogger.logRoleRemoval(
        req.user.id,
        userId,
        roleId,
        userRole.role.name,
        scope,
        req
      );

      res.json({ message: 'Role removed successfully' });
    } catch (error) {
      console.error('Remove role error:', error);
      res.status(500).json({ error: 'Failed to remove role' });
    }
  }
);

/**
 * GET /api/admin/roles
 * List all available roles
 */
router.get('/roles', requirePermission('roles:read'), async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const formattedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      isSystem: role.isSystem,
      userCount: role._count.userRoles,
      permissions: role.rolePermissions.map(rp => ({
        id: rp.permission.id,
        name: rp.permission.name,
        displayName: rp.permission.displayName,
        category: rp.permission.category,
      })),
      createdAt: role.createdAt,
    }));

    res.json({ roles: formattedRoles });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

/**
 * GET /api/admin/permissions
 * List all available permissions
 */
router.get('/permissions', requirePermission('roles:read'), async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    // Group by category
    const groupedPermissions = permissions.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push({
        id: perm.id,
        name: perm.name,
        displayName: perm.displayName,
        description: perm.description,
      });
      return acc;
    }, {});

    res.json({ permissions: groupedPermissions });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

/**
 * GET /api/admin/audit-logs
 * Get audit logs (Super Admin only)
 */
router.get(
  '/audit-logs',
  requirePermission('audit:view'),
  [
    query('action').optional().trim(),
    query('entityType').optional().trim(),
    query('performedBy').optional().isUUID(),
    query('targetUser').optional().isUUID(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        action,
        entityType,
        performedBy,
        targetUser,
        startDate,
        endDate,
        page = 1,
        limit = 50,
      } = req.query;

      const result = await AuditLogger.getAuditLogs(
        { action, entityType, performedBy, targetUser, startDate, endDate },
        { page, limit }
      );

      res.json(result);
    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  }
);

/**
 * GET /api/admin/analytics/role-usage
 * Get role usage analytics
 */
router.get(
  '/analytics/role-usage',
  requirePermission('analytics:view'),
  async (req, res) => {
    try {
      const roleUsage = await prisma.role.findMany({
        include: {
          _count: {
            select: {
              userRoles: true,
            },
          },
        },
      });

      const data = roleUsage.map(role => ({
        role: role.name,
        displayName: role.displayName,
        userCount: role._count.userRoles,
      }));

      res.json({ roleUsage: data });
    } catch (error) {
      console.error('Get role usage error:', error);
      res.status(500).json({ error: 'Failed to fetch role usage' });
    }
  }
);

/**
 * GET /api/admin/analytics/permission-errors
 * Get permission check failures for monitoring
 */
router.get(
  '/analytics/permission-errors',
  requirePermission('analytics:view'),
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1, max: 1000 }).toInt(),
  ],
  async (req, res) => {
    try {
      const { startDate, endDate, limit = 100 } = req.query;

      const where = { granted: false };

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const errors = await prisma.permissionCheck.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      // Aggregate by permission
      const aggregated = errors.reduce((acc, err) => {
        if (!acc[err.permission]) {
          acc[err.permission] = {
            permission: err.permission,
            count: 0,
            users: new Set(),
          };
        }
        acc[err.permission].count++;
        acc[err.permission].users.add(err.userId);
        return acc;
      }, {});

      const data = Object.values(aggregated).map(item => ({
        permission: item.permission,
        deniedCount: item.count,
        uniqueUsers: item.users.size,
      }));

      res.json({
        permissionErrors: data,
        total: errors.length,
      });
    } catch (error) {
      console.error('Get permission errors error:', error);
      res.status(500).json({ error: 'Failed to fetch permission errors' });
    }
  }
);

module.exports = router;
