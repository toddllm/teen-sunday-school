import { Request, Response } from 'express';
import { PrismaClient, SignupEventType } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

/**
 * Signup Funnel Analytics Controller
 * Tracks and analyzes teen signup funnel progression
 */

/**
 * POST /api/analytics/signup/track
 * Track a signup funnel event
 */
export const trackSignupEvent = async (req: Request, res: Response) => {
  try {
    const {
      eventType,
      sessionId,
      organizationId,
      userId,
      referralSource,
      metadata,
    } = req.body;

    // Validate event type
    if (!Object.values(SignupEventType).includes(eventType)) {
      return res.status(400).json({
        error: 'Invalid event type',
        validTypes: Object.values(SignupEventType),
      });
    }

    // Extract context from request
    const userAgent = req.headers['user-agent'] || null;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || null;

    const event = await prisma.signupFunnelEvent.create({
      data: {
        eventType,
        sessionId,
        organizationId,
        userId: userId || null,
        referralSource: referralSource || null,
        userAgent,
        ipAddress,
        metadata: metadata || {},
      },
    });

    logger.info(`Signup event tracked: ${eventType} for session ${sessionId}`);
    res.status(201).json(event);
  } catch (error) {
    logger.error('Error tracking signup event:', error);
    res.status(500).json({ error: 'Failed to track signup event' });
  }
};

/**
 * GET /api/analytics/signup/events
 * Get signup funnel events with optional filters
 */
export const getSignupEvents = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const {
      eventType,
      sessionId,
      userId,
      startDate,
      endDate,
      limit = 100,
      offset = 0,
    } = req.query;

    const where: any = { organizationId };

    if (eventType) {
      where.eventType = eventType;
    }
    if (sessionId) {
      where.sessionId = sessionId;
    }
    if (userId) {
      where.userId = userId;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    const [events, total] = await Promise.all([
      prisma.signupFunnelEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.signupFunnelEvent.count({ where }),
    ]);

    res.json({
      events,
      total,
      pagination: {
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + events.length < total,
      },
    });
  } catch (error) {
    logger.error('Error fetching signup events:', error);
    res.status(500).json({ error: 'Failed to fetch signup events' });
  }
};

/**
 * GET /api/analytics/signup/funnel
 * Get funnel conversion statistics
 */
export const getFunnelStats = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    // Get counts by event type
    const eventCounts = await prisma.signupFunnelEvent.groupBy({
      by: ['eventType'],
      where: {
        organizationId,
        createdAt: { gte: startDate },
      },
      _count: true,
    });

    // Create a map for easy lookup
    const countMap: Record<string, number> = {};
    eventCounts.forEach(item => {
      countMap[item.eventType] = item._count;
    });

    // Define funnel stages in order
    const funnelStages = [
      'SIGNUP_STARTED',
      'ACCOUNT_CREATED',
      'PROFILE_COMPLETED',
      'GROUP_JOINED',
      'FIRST_LOGIN',
      'ONBOARDING_COMPLETED',
    ];

    // Calculate funnel metrics
    const funnel = funnelStages.map((stage, index) => {
      const count = countMap[stage] || 0;
      const previousCount = index > 0 ? (countMap[funnelStages[index - 1]] || 0) : count;
      const conversionRate = previousCount > 0 ? (count / previousCount) * 100 : 0;
      const dropoffRate = previousCount > 0 ? ((previousCount - count) / previousCount) * 100 : 0;

      return {
        stage,
        count,
        conversionRate: Math.round(conversionRate * 100) / 100,
        dropoffRate: Math.round(dropoffRate * 100) / 100,
      };
    });

    // Calculate overall conversion rate (SIGNUP_STARTED -> ONBOARDING_COMPLETED)
    const signupStarted = countMap['SIGNUP_STARTED'] || 0;
    const onboardingCompleted = countMap['ONBOARDING_COMPLETED'] || 0;
    const overallConversionRate = signupStarted > 0
      ? (onboardingCompleted / signupStarted) * 100
      : 0;

    res.json({
      period: {
        days: Number(days),
        startDate,
        endDate: new Date(),
      },
      funnel,
      summary: {
        totalSignupStarted: signupStarted,
        totalCompleted: onboardingCompleted,
        overallConversionRate: Math.round(overallConversionRate * 100) / 100,
      },
    });
  } catch (error) {
    logger.error('Error fetching funnel stats:', error);
    res.status(500).json({ error: 'Failed to fetch funnel statistics' });
  }
};

/**
 * GET /api/analytics/signup/cohorts
 * Get cohort analysis (group by signup date)
 */
export const getCohortAnalysis = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    // Get daily signup trends
    const dailySignups = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT
        DATE(created_at) as date,
        COUNT(DISTINCT session_id) as count
      FROM "SignupFunnelEvent"
      WHERE organization_id = ${organizationId}
        AND event_type = 'SIGNUP_STARTED'
        AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;

    // Get completion rate by cohort
    const cohortCompletion = await prisma.$queryRaw<
      Array<{ date: Date; started: bigint; completed: bigint }>
    >`
      SELECT
        DATE(s.created_at) as date,
        COUNT(DISTINCT s.session_id) as started,
        COUNT(DISTINCT c.session_id) as completed
      FROM "SignupFunnelEvent" s
      LEFT JOIN "SignupFunnelEvent" c
        ON s.session_id = c.session_id
        AND c.event_type = 'ONBOARDING_COMPLETED'
      WHERE s.organization_id = ${organizationId}
        AND s.event_type = 'SIGNUP_STARTED'
        AND s.created_at >= ${startDate}
      GROUP BY DATE(s.created_at)
      ORDER BY DATE(s.created_at) ASC
    `;

    res.json({
      period: {
        days: Number(days),
        startDate,
        endDate: new Date(),
      },
      dailySignups: dailySignups.map(row => ({
        date: row.date,
        count: Number(row.count),
      })),
      cohortCompletion: cohortCompletion.map(row => ({
        date: row.date,
        started: Number(row.started),
        completed: Number(row.completed),
        completionRate: Number(row.started) > 0
          ? Math.round((Number(row.completed) / Number(row.started)) * 100 * 100) / 100
          : 0,
      })),
    });
  } catch (error) {
    logger.error('Error fetching cohort analysis:', error);
    res.status(500).json({ error: 'Failed to fetch cohort analysis' });
  }
};

/**
 * GET /api/analytics/signup/referrals
 * Get referral source analysis
 */
export const getReferralAnalysis = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    // Get referral sources for signup starts
    const referralCounts = await prisma.signupFunnelEvent.groupBy({
      by: ['referralSource'],
      where: {
        organizationId,
        eventType: 'SIGNUP_STARTED',
        createdAt: { gte: startDate },
      },
      _count: true,
    });

    // Get conversion rates by referral source
    const referralConversion = await prisma.$queryRaw<
      Array<{ referral_source: string; started: bigint; completed: bigint }>
    >`
      SELECT
        s.referral_source,
        COUNT(DISTINCT s.session_id) as started,
        COUNT(DISTINCT c.session_id) as completed
      FROM "SignupFunnelEvent" s
      LEFT JOIN "SignupFunnelEvent" c
        ON s.session_id = c.session_id
        AND c.event_type = 'ONBOARDING_COMPLETED'
      WHERE s.organization_id = ${organizationId}
        AND s.event_type = 'SIGNUP_STARTED'
        AND s.created_at >= ${startDate}
        AND s.referral_source IS NOT NULL
      GROUP BY s.referral_source
      ORDER BY started DESC
    `;

    res.json({
      period: {
        days: Number(days),
        startDate,
        endDate: new Date(),
      },
      referralSources: referralConversion.map(row => ({
        source: row.referral_source || 'direct',
        signupsStarted: Number(row.started),
        signupsCompleted: Number(row.completed),
        conversionRate: Number(row.started) > 0
          ? Math.round((Number(row.completed) / Number(row.started)) * 100 * 100) / 100
          : 0,
      })),
    });
  } catch (error) {
    logger.error('Error fetching referral analysis:', error);
    res.status(500).json({ error: 'Failed to fetch referral analysis' });
  }
};

/**
 * GET /api/analytics/signup/time-to-complete
 * Get average time to complete funnel stages
 */
export const getTimeToComplete = async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.user!;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    // Get average time between key stages
    const timeAnalysis = await prisma.$queryRaw<
      Array<{
        session_id: string;
        signup_started: Date;
        account_created: Date | null;
        onboarding_completed: Date | null;
      }>
    >`
      SELECT
        s.session_id,
        MIN(CASE WHEN s.event_type = 'SIGNUP_STARTED' THEN s.created_at END) as signup_started,
        MIN(CASE WHEN s.event_type = 'ACCOUNT_CREATED' THEN s.created_at END) as account_created,
        MIN(CASE WHEN s.event_type = 'ONBOARDING_COMPLETED' THEN s.created_at END) as onboarding_completed
      FROM "SignupFunnelEvent" s
      WHERE s.organization_id = ${organizationId}
        AND s.created_at >= ${startDate}
      GROUP BY s.session_id
      HAVING MIN(CASE WHEN s.event_type = 'SIGNUP_STARTED' THEN s.created_at END) IS NOT NULL
    `;

    // Calculate average times
    let totalTimeToAccount = 0;
    let totalTimeToComplete = 0;
    let accountCreatedCount = 0;
    let completedCount = 0;

    timeAnalysis.forEach(session => {
      if (session.signup_started && session.account_created) {
        const timeToAccount = new Date(session.account_created).getTime() - new Date(session.signup_started).getTime();
        totalTimeToAccount += timeToAccount;
        accountCreatedCount++;
      }
      if (session.signup_started && session.onboarding_completed) {
        const timeToComplete = new Date(session.onboarding_completed).getTime() - new Date(session.signup_started).getTime();
        totalTimeToComplete += timeToComplete;
        completedCount++;
      }
    });

    const avgTimeToAccount = accountCreatedCount > 0 ? totalTimeToAccount / accountCreatedCount : 0;
    const avgTimeToComplete = completedCount > 0 ? totalTimeToComplete / completedCount : 0;

    res.json({
      period: {
        days: Number(days),
        startDate,
        endDate: new Date(),
      },
      averageTimes: {
        signupToAccountCreation: {
          milliseconds: Math.round(avgTimeToAccount),
          minutes: Math.round(avgTimeToAccount / 60000 * 100) / 100,
          sampleSize: accountCreatedCount,
        },
        signupToCompletion: {
          milliseconds: Math.round(avgTimeToComplete),
          minutes: Math.round(avgTimeToComplete / 60000 * 100) / 100,
          sampleSize: completedCount,
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching time to complete:', error);
    res.status(500).json({ error: 'Failed to fetch time to complete analysis' });
  }
};
