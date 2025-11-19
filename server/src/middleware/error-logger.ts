import { Request, Response, NextFunction } from 'express';
import { ErrorType } from '@prisma/client';
import { logError } from '../services/error-tracking.service';

/**
 * Extract organization ID from request
 */
function getOrganizationId(req: Request): string | undefined {
  // Check if user is authenticated and has an organization
  if (req.user && typeof req.user === 'object' && 'organizationId' in req.user) {
    return (req.user as any).organizationId;
  }
  return undefined;
}

/**
 * Map HTTP status code to error type
 */
function mapStatusCodeToErrorType(statusCode: number): ErrorType {
  if (statusCode === 401) return ErrorType.AUTHENTICATION_ERROR;
  if (statusCode === 403) return ErrorType.AUTHORIZATION_ERROR;
  if (statusCode === 400 || statusCode === 422) return ErrorType.VALIDATION_ERROR;
  if (statusCode === 429) return ErrorType.RATE_LIMIT_ERROR;
  if (statusCode === 408 || statusCode === 504) return ErrorType.TIMEOUT_ERROR;
  if (statusCode === 502 || statusCode === 503) return ErrorType.EXTERNAL_API_ERROR;
  if (statusCode >= 500) return ErrorType.INTERNAL_ERROR;
  return ErrorType.INTERNAL_ERROR;
}

/**
 * Determine if error should be logged to database
 */
function shouldLogError(statusCode: number, path: string): boolean {
  // Don't log 404s or health checks
  if (statusCode === 404) return false;
  if (path === '/health' || path === '/api/health') return false;

  // Log all errors 400 and above
  return statusCode >= 400;
}

/**
 * Middleware to log errors to database
 */
export function errorLoggerMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.status || err.statusCode || 500;

  // Check if we should log this error
  if (!shouldLogError(statusCode, req.path)) {
    return next(err);
  }

  // Extract user ID if available
  const userId = req.user && typeof req.user === 'object' && 'id' in req.user
    ? (req.user as any).id
    : undefined;

  // Determine error type
  let errorType = mapStatusCodeToErrorType(statusCode);

  // Override with specific error types if available
  if (err.code === 'P2002') errorType = ErrorType.DATABASE_ERROR;
  if (err.code === 'ECONNREFUSED') errorType = ErrorType.NETWORK_ERROR;
  if (err.name === 'JsonWebTokenError') errorType = ErrorType.AUTHENTICATION_ERROR;
  if (err.name === 'ValidationError') errorType = ErrorType.VALIDATION_ERROR;

  // Extract IP address
  const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
    || req.socket.remoteAddress
    || undefined;

  // Log error to database (async, non-blocking)
  logError({
    errorType,
    errorMessage: err.message || 'Unknown error',
    errorStack: err.stack,
    errorCode: err.code,
    httpMethod: req.method,
    httpPath: req.path,
    httpStatusCode: statusCode,
    userId,
    ipAddress,
    userAgent: req.headers['user-agent'],
    service: 'api',
    organizationId: getOrganizationId(req),
    metadata: {
      body: req.body,
      query: req.query,
      params: req.params,
    },
  }).catch((logErr) => {
    // Silently fail - don't want error logging to break the app
    console.error('Failed to log error:', logErr);
  });

  // Continue to next error handler
  next(err);
}
