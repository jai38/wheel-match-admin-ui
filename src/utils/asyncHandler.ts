import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wrapper to handle async route handlers and pass errors to error middleware
 * This eliminates the need for try-catch blocks in every controller
 * 
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.findAll();
 *   res.json(users);
 * }));
 */
export const asyncHandler = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
