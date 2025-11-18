import { Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';
import { validateNickname, sanitizeNickname } from '../services/nicknameValidator';
import { validateAvatarId } from '../services/avatar.service';

/**
 * Profile Controller
 *
 * Handles user profile operations including nickname and avatar management.
 */

/**
 * Get current user's profile
 * GET /api/me/profile
 */
export async function getMyProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userId = req.user.userId;

    // Fetch user with avatar
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        nickname: true,
        avatarId: true,
        profileCompletedAt: true,
        nicknameUpdatedAt: true,
        createdAt: true,
        avatar: {
          select: {
            id: true,
            name: true,
            displayName: true,
            imageUrl: true,
            category: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user,
    });
  } catch (error) {
    logger.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

/**
 * Update current user's profile (nickname and/or avatar)
 * PATCH /api/me/profile
 */
export async function updateMyProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userId = req.user.userId;
    const { nickname, avatarId } = req.body;

    // Validate that at least one field is provided
    if (nickname === undefined && avatarId === undefined) {
      res.status(400).json({ error: 'At least one field (nickname or avatarId) must be provided' });
      return;
    }

    // Build update data object
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Validate and sanitize nickname if provided
    if (nickname !== undefined) {
      // Allow null to clear nickname
      if (nickname === null) {
        updateData.nickname = null;
        updateData.nicknameUpdatedAt = new Date();
      } else {
        // Sanitize nickname
        const sanitized = sanitizeNickname(nickname);

        // Validate nickname
        const validation = validateNickname(sanitized);
        if (!validation.isValid) {
          res.status(400).json({
            error: 'Invalid nickname',
            details: validation.errors,
          });
          return;
        }

        updateData.nickname = sanitized;
        updateData.nicknameUpdatedAt = new Date();
      }
    }

    // Validate avatar ID if provided
    if (avatarId !== undefined) {
      // Allow null to clear avatar
      if (avatarId === null) {
        updateData.avatarId = null;
      } else {
        // Validate that avatar exists and is active
        const isValidAvatar = await validateAvatarId(avatarId);
        if (!isValidAvatar) {
          res.status(400).json({ error: 'Invalid avatar ID' });
          return;
        }

        updateData.avatarId = avatarId;
      }
    }

    // Check if profile is now complete (has both nickname and avatar)
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        nickname: true,
        avatarId: true,
        profileCompletedAt: true,
      },
    });

    if (!currentUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Set profileCompletedAt if this is the first time both are set
    const finalNickname = updateData.nickname !== undefined ? updateData.nickname : currentUser.nickname;
    const finalAvatarId = updateData.avatarId !== undefined ? updateData.avatarId : currentUser.avatarId;

    if (finalNickname && finalAvatarId && !currentUser.profileCompletedAt) {
      updateData.profileCompletedAt = new Date();
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        nickname: true,
        avatarId: true,
        profileCompletedAt: true,
        nicknameUpdatedAt: true,
        createdAt: true,
        avatar: {
          select: {
            id: true,
            name: true,
            displayName: true,
            imageUrl: true,
            category: true,
          },
        },
      },
    });

    logger.info(`Profile updated for user ${userId}`);

    res.json({
      user: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    logger.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

/**
 * Validate nickname (without updating)
 * POST /api/me/profile/validate-nickname
 */
export async function validateNicknameEndpoint(req: Request, res: Response): Promise<void> {
  try {
    const { nickname } = req.body;

    if (!nickname) {
      res.status(400).json({ error: 'Nickname is required' });
      return;
    }

    const sanitized = sanitizeNickname(nickname);
    const validation = validateNickname(sanitized);

    res.json({
      isValid: validation.isValid,
      errors: validation.errors,
      sanitized,
    });
  } catch (error) {
    logger.error('Error validating nickname:', error);
    res.status(500).json({ error: 'Failed to validate nickname' });
  }
}
