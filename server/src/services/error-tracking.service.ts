import { PrismaClient, ErrorType, ErrorSeverity, ErrorCategory, IncidentStatus } from '@prisma/client';
import crypto from 'crypto';
import { logger } from '../config/logger';

const prisma = new PrismaClient();

interface ErrorContext {
  errorType: ErrorType;
  errorMessage: string;
  errorStack?: string;
  errorCode?: string;
  httpMethod?: string;
  httpPath?: string;
  httpStatusCode?: number;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  service: string;
  environment: string;
  version?: string;
  severity: ErrorSeverity;
  category?: ErrorCategory;
  tags?: Record<string, any>;
  metadata?: Record<string, any>;
  organizationId?: string;
}

/**
 * Generate a fingerprint for an error to detect duplicates
 */
function generateErrorFingerprint(error: ErrorContext): string {
  const fingerprintData = [
    error.errorType,
    error.errorMessage,
    error.httpPath,
    error.service,
  ].join('|');

  return crypto.createHash('md5').update(fingerprintData).digest('hex');
}

/**
 * Determine error severity based on error type and status code
 */
function determineErrorSeverity(
  errorType: ErrorType,
  statusCode?: number
): ErrorSeverity {
  // Critical errors
  if (errorType === ErrorType.DATABASE_ERROR) return ErrorSeverity.CRITICAL;
  if (statusCode === 500) return ErrorSeverity.HIGH;

  // High priority errors
  if (errorType === ErrorType.AUTHENTICATION_ERROR) return ErrorSeverity.MEDIUM;
  if (errorType === ErrorType.INTEGRATION_ERROR) return ErrorSeverity.HIGH;
  if (errorType === ErrorType.EXTERNAL_API_ERROR) return ErrorSeverity.MEDIUM;

  // Medium priority errors
  if (errorType === ErrorType.AUTHORIZATION_ERROR) return ErrorSeverity.LOW;
  if (errorType === ErrorType.VALIDATION_ERROR) return ErrorSeverity.LOW;
  if (errorType === ErrorType.RATE_LIMIT_ERROR) return ErrorSeverity.MEDIUM;

  // Default
  return ErrorSeverity.MEDIUM;
}

/**
 * Categorize error based on error type and context
 */
function categorizeError(error: ErrorContext): ErrorCategory | undefined {
  if (error.httpPath?.includes('/sync') || error.errorType === ErrorType.INTEGRATION_ERROR) {
    return ErrorCategory.SYNC;
  }

  if (error.errorType === ErrorType.AUTHENTICATION_ERROR) {
    return ErrorCategory.AUTHENTICATION;
  }

  if (error.errorType === ErrorType.AUTHORIZATION_ERROR) {
    return ErrorCategory.AUTHORIZATION;
  }

  if (error.httpPath?.includes('/integrations')) {
    return ErrorCategory.INTEGRATION;
  }

  if (error.errorType === ErrorType.DATABASE_ERROR) {
    return ErrorCategory.DATABASE;
  }

  if (error.service === 'api') {
    return ErrorCategory.API;
  }

  if (error.service === 'job-queue') {
    return ErrorCategory.JOB_QUEUE;
  }

  return undefined;
}

/**
 * Log an error to the database
 */
export async function logError(errorContext: Partial<ErrorContext>): Promise<void> {
  try {
    // Set defaults
    const context: ErrorContext = {
      errorType: errorContext.errorType || ErrorType.INTERNAL_ERROR,
      errorMessage: errorContext.errorMessage || 'Unknown error',
      errorStack: errorContext.errorStack,
      errorCode: errorContext.errorCode,
      httpMethod: errorContext.httpMethod,
      httpPath: errorContext.httpPath,
      httpStatusCode: errorContext.httpStatusCode,
      userId: errorContext.userId,
      ipAddress: errorContext.ipAddress,
      userAgent: errorContext.userAgent,
      service: errorContext.service || 'api',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION,
      severity: errorContext.severity || determineErrorSeverity(
        errorContext.errorType || ErrorType.INTERNAL_ERROR,
        errorContext.httpStatusCode
      ),
      category: errorContext.category || categorizeError(errorContext as ErrorContext),
      tags: errorContext.tags,
      metadata: errorContext.metadata,
      organizationId: errorContext.organizationId,
    };

    const fingerprint = generateErrorFingerprint(context);

    // Check if similar error exists (within last 24 hours)
    const existingError = await prisma.errorLog.findFirst({
      where: {
        errorType: context.errorType,
        errorMessage: context.errorMessage,
        httpPath: context.httpPath,
        service: context.service,
        status: {
          not: IncidentStatus.RESOLVED,
        },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (existingError) {
      // Update existing error
      await prisma.errorLog.update({
        where: { id: existingError.id },
        data: {
          occurrenceCount: { increment: 1 },
          lastSeenAt: new Date(),
          metadata: context.metadata || existingError.metadata,
        },
      });

      logger.info(`Updated existing error log: ${existingError.id}`);
    } else {
      // Create new error log
      await prisma.errorLog.create({
        data: {
          errorType: context.errorType,
          errorMessage: context.errorMessage,
          errorStack: context.errorStack,
          errorCode: context.errorCode,
          httpMethod: context.httpMethod,
          httpPath: context.httpPath,
          httpStatusCode: context.httpStatusCode,
          userId: context.userId,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          service: context.service,
          environment: context.environment,
          version: context.version,
          severity: context.severity,
          category: context.category,
          tags: context.tags,
          metadata: context.metadata,
          organizationId: context.organizationId,
        },
      });

      logger.info('Created new error log');

      // Check if we should create an incident for critical errors
      if (context.severity === ErrorSeverity.CRITICAL) {
        await createIncidentFromError(context);
      }
    }
  } catch (error) {
    // Don't throw errors from error logging to prevent infinite loops
    logger.error('Failed to log error to database:', error);
  }
}

/**
 * Create an incident from a critical error
 */
async function createIncidentFromError(error: ErrorContext): Promise<void> {
  try {
    await prisma.errorIncident.create({
      data: {
        title: `Critical Error: ${error.errorType}`,
        description: error.errorMessage,
        status: IncidentStatus.OPEN,
        severity: error.severity,
        organizationId: error.organizationId,
        affectedUsers: 1,
      },
    });

    logger.warn(`Created incident for critical error: ${error.errorType}`);
  } catch (err) {
    logger.error('Failed to create incident:', err);
  }
}

/**
 * Get error statistics for dashboard
 */
export async function getErrorStats(organizationId?: string, hours: number = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const where = {
    createdAt: { gte: since },
    ...(organizationId && { organizationId }),
  };

  const [totalErrors, criticalErrors, openIncidents, errorsByType] = await Promise.all([
    // Total errors
    prisma.errorLog.count({ where }),

    // Critical errors
    prisma.errorLog.count({
      where: {
        ...where,
        severity: ErrorSeverity.CRITICAL,
      },
    }),

    // Open incidents
    prisma.errorIncident.count({
      where: {
        status: {
          in: [IncidentStatus.OPEN, IncidentStatus.ACKNOWLEDGED, IncidentStatus.INVESTIGATING],
        },
        ...(organizationId && { organizationId }),
      },
    }),

    // Errors by type
    prisma.errorLog.groupBy({
      by: ['errorType'],
      where,
      _count: {
        errorType: true,
      },
    }),
  ]);

  // Calculate average resolution time
  const resolvedIncidents = await prisma.errorIncident.findMany({
    where: {
      status: IncidentStatus.RESOLVED,
      resolvedAt: { not: null },
      createdAt: { gte: since },
      ...(organizationId && { organizationId }),
    },
    select: {
      createdAt: true,
      resolvedAt: true,
    },
  });

  const avgResolutionTime = resolvedIncidents.length > 0
    ? resolvedIncidents.reduce((acc, incident) => {
        if (incident.resolvedAt) {
          return acc + (incident.resolvedAt.getTime() - incident.createdAt.getTime());
        }
        return acc;
      }, 0) / resolvedIncidents.length
    : 0;

  return {
    totalErrors,
    criticalErrors,
    openIncidents,
    avgResolutionTimeMs: Math.round(avgResolutionTime),
    errorsByType: errorsByType.map(({ errorType, _count }) => ({
      type: errorType,
      count: _count.errorType,
    })),
  };
}

/**
 * Get error trends over time
 */
export async function getErrorTrends(organizationId?: string, days: number = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const errors = await prisma.errorLog.findMany({
    where: {
      createdAt: { gte: since },
      ...(organizationId && { organizationId }),
    },
    select: {
      createdAt: true,
      severity: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Group by day
  const trendsByDay = errors.reduce((acc, error) => {
    const day = error.createdAt.toISOString().split('T')[0];
    if (!acc[day]) {
      acc[day] = {
        date: day,
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      };
    }
    acc[day].total++;
    acc[day][error.severity.toLowerCase() as 'critical' | 'high' | 'medium' | 'low']++;
    return acc;
  }, {} as Record<string, any>);

  return Object.values(trendsByDay);
}
