import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

/**
 * Custom error class with status code
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized error handling middleware
 * Should be the last middleware in the chain
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Default error values
  let statusCode = 500;
  let message = 'Internal server error';
  let isOperational = false;

  // Check if it's an AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else {
    // Handle known error types
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation error';
    } else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Unauthorized';
    } else if (err.name === 'NotFoundError') {
      statusCode = 404;
      message = 'Resource not found';
    } else if (err.message) {
      message = err.message;
    }
  }

  // Log the error
  logger.error({
    message: err.message,
    statusCode,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?.id,
  });

  // Don't leak error details in production for non-operational errors
  if (process.env.NODE_ENV === 'production' && !isOperational) {
    message = 'Internal server error';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err,
    }),
  });
}

/**
 * Handle 404 errors for undefined routes
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
  next(error);
}

/**
 * Async error wrapper for route handlers
 * Usage: asyncHandler(async (req, res) => { ... })
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
