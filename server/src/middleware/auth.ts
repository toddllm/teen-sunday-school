import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../utils/jwt';
import prisma from '../config/database';
import logger from '../config/logger';
import { PrismaClient } from '@prisma/client';

// Extend Express Request to include user and prisma
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload & { isActive: boolean };
      prisma: PrismaClient;
    }
  }
}

/**
 * Authenticate user via JWT token
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const payload = verifyAccessToken(token);

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, isActive: true },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }

    // Attach user to request
    req.user = { ...payload, isActive: user.isActive };
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Require specific role
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role,
      });
      return;
    }

    next();
  };
}

/**
 * Require organization admin
 */
export function requireOrgAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'ORG_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    res.status(403).json({ error: 'Organization admin access required' });
    return;
  }

  next();
}

/**
 * Verify user belongs to organization
 */
export function requireOrgAccess(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const orgId = req.params.orgId || req.body.organizationId;

  // Super admins can access any org
  if (req.user.role === 'SUPER_ADMIN') {
    next();
    return;
  }

  if (req.user.organizationId !== orgId) {
    res.status(403).json({ error: 'Access denied to this organization' });
    return;
  }

  next();
}

/**
 * Verify user is a leader/teacher or admin
 * Leaders can manage their own groups, admins can manage all
 */
export async function requireLeaderOrAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  // Admins and teachers have access
  if (['SUPER_ADMIN', 'ORG_ADMIN', 'TEACHER'].includes(req.user.role)) {
    next();
    return;
  }

  // Check if user is a group leader
  const groupId = req.params.groupId || req.query.groupId;

  if (groupId) {
    const membership = await prisma.groupMember.findFirst({
      where: {
        userId: req.user.userId,
        groupId: groupId as string,
        role: 'leader',
      },
    });

    if (membership) {
      next();
      return;
    }
  }

  res.status(403).json({ error: 'Leader or admin access required' });
}
