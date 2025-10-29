import type { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from '../utils/errors.js';

/**
 * Middleware to handle validation errors from express-validator
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Extract the first error message
    const firstError = errors.array()[0];
    const errorMessage = firstError.msg || 'Validation failed';

    // Throw validation error which will be caught by error handler
    next(new ValidationError(errorMessage));
  };
};
