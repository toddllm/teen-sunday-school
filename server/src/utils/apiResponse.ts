import { Response } from 'express';

/**
 * Unified API response format
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Send a successful response
 */
export function sendSuccess<T = any>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): void {
  const response: ApiResponse<T> = {
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message }),
  };
  res.status(statusCode).json(response);
}

/**
 * Send an error response
 */
export function sendError(
  res: Response,
  error: string,
  statusCode: number = 500,
  data?: any
): void {
  const response: ApiResponse = {
    success: false,
    error,
    ...(data !== undefined && { data }),
  };
  res.status(statusCode).json(response);
}

/**
 * Send a created response (201)
 */
export function sendCreated<T = any>(res: Response, data: T, message?: string): void {
  sendSuccess(res, data, message, 201);
}

/**
 * Send a bad request error (400)
 */
export function sendBadRequest(res: Response, error: string): void {
  sendError(res, error, 400);
}

/**
 * Send an unauthorized error (401)
 */
export function sendUnauthorized(res: Response, error: string = 'Unauthorized'): void {
  sendError(res, error, 401);
}

/**
 * Send a forbidden error (403)
 */
export function sendForbidden(res: Response, error: string = 'Forbidden'): void {
  sendError(res, error, 403);
}

/**
 * Send a not found error (404)
 */
export function sendNotFound(res: Response, error: string = 'Resource not found'): void {
  sendError(res, error, 404);
}

/**
 * Send a conflict error (409)
 */
export function sendConflict(res: Response, error: string): void {
  sendError(res, error, 409);
}

/**
 * Send an internal server error (500)
 */
export function sendServerError(res: Response, error: string = 'Internal server error'): void {
  sendError(res, error, 500);
}
