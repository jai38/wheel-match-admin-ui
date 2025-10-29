import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { HTTP_STATUS } from '../config/constants.js';

interface ErrorResponse {
  status: 'error';
  message: string;
  stack?: string;
}

/**
 * Global error handler middleware
 * Handles both operational and programming errors
 */
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  } else {
    console.error('Error:', err.message);
  }

  // Default to 500 if not an AppError
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = 'Internal server error';

  // Handle custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    // Handle standard errors
    message = err.message || message;
  }

  // Build response
  const response: ErrorResponse = {
    status: 'error',
    message,
  };

  // Include stack trace in development mode
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
};
