import type { Request, Response, NextFunction } from 'express';
import { RATE_LIMIT } from '../config/constants.js';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis-based rate limiter like express-rate-limit with Redis store
 */
export const rateLimiter = (windowMs: number = RATE_LIMIT.WINDOW_MS, maxRequests: number = RATE_LIMIT.MAX_REQUESTS) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Use IP address as key
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    // Initialize or get existing entry
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    // Increment count
    store[key].count += 1;

    // Check if limit exceeded
    if (store[key].count > maxRequests) {
      res.status(429).json({
        status: 'error',
        message: RATE_LIMIT.MESSAGE,
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
      });
      return;
    }

    next();
  };
};

/**
 * Cleanup old entries periodically
 */
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 60000); // Cleanup every minute
