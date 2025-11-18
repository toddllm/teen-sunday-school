const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Middleware to verify JWT token and attach user to request
 */
async function authenticate(req, res, next) {
  try {
    // Get token from header or cookie
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user with roles and permissions
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Attach user and permissions to request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.userRoles.map(ur => ur.role.name),
      permissions: [
        ...new Set(
          user.userRoles.flatMap(ur =>
            ur.role.rolePermissions.map(rp => rp.permission.name)
          )
        ),
      ],
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Middleware to check if user has specific permission
 */
function requirePermission(permission) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const hasPermission = req.user.permissions.includes(permission);

      // Log permission check for analytics
      await prisma.permissionCheck.create({
        data: {
          userId: req.user.id,
          permission,
          granted: hasPermission,
          resourceType: req.baseUrl,
          resourceId: req.params.id || null,
        },
      }).catch(err => console.error('Failed to log permission check:', err));

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          required: permission,
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

/**
 * Middleware to check if user has any of the specified permissions
 */
function requireAnyPermission(permissions) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const hasAnyPermission = permissions.some(perm =>
        req.user.permissions.includes(perm)
      );

      if (!hasAnyPermission) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          requiredAny: permissions,
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

/**
 * Middleware to check if user has specific role
 */
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.roles.includes(role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        requiredRole: role,
      });
    }

    next();
  };
}

/**
 * Middleware to check if user is super admin
 */
function requireSuperAdmin(req, res, next) {
  return requireRole('super_admin')(req, res, next);
}

module.exports = {
  authenticate,
  requirePermission,
  requireAnyPermission,
  requireRole,
  requireSuperAdmin,
};
