import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/database';
import logger from '../config/logger';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { SignupEventType } from '@prisma/client';

/**
 * Register a new user
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, firstName, lastName, organizationId, sessionId, referralSource } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName || !organizationId) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        organizationId,
        role: 'MEMBER',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user as any);
    const refreshToken = generateRefreshToken(user as any);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Track signup funnel event (ACCOUNT_CREATED)
    if (sessionId) {
      try {
        await prisma.signupFunnelEvent.create({
          data: {
            eventType: SignupEventType.ACCOUNT_CREATED,
            sessionId,
            organizationId,
            userId: user.id,
            referralSource: referralSource || null,
            userAgent: req.headers['user-agent'] || null,
            ipAddress: req.ip || (req.headers['x-forwarded-for'] as string) || null,
            metadata: {},
          },
        });
        logger.info(`Signup funnel event tracked: ACCOUNT_CREATED for user ${user.id}`);
      } catch (trackingError) {
        // Don't fail the registration if tracking fails
        logger.error('Failed to track signup event:', trackingError);
      }
    }

    res.status(201).json({
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
}

/**
 * Login user
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, sessionId } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(403).json({ error: 'Account is inactive' });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check if this is the first login
    const isFirstLogin = !user.lastLoginAt;

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Track FIRST_LOGIN event if applicable
    if (isFirstLogin && sessionId) {
      try {
        await prisma.signupFunnelEvent.create({
          data: {
            eventType: SignupEventType.FIRST_LOGIN,
            sessionId,
            organizationId: user.organizationId,
            userId: user.id,
            userAgent: req.headers['user-agent'] || null,
            ipAddress: req.ip || (req.headers['x-forwarded-for'] as string) || null,
            metadata: {},
          },
        });
        logger.info(`Signup funnel event tracked: FIRST_LOGIN for user ${user.id}`);
      } catch (trackingError) {
        // Don't fail the login if tracking fails
        logger.error('Failed to track first login event:', trackingError);
      }
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Return user data (without password hash)
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
}

/**
 * Logout user
 */
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Delete refresh token
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token required' });
      return;
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.refreshToken.delete({
        where: { token: refreshToken },
      });
      res.status(401).json({ error: 'Refresh token expired' });
      return;
    }

    // Generate new access token
    const accessToken = generateAccessToken(storedToken.user);

    res.json({ accessToken });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
}
