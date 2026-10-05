import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { AppError } from './error.js';

export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        result.error.issues.map((i) => i.message).join(', '),
        400
      );
    }
    req.body = result.data;
    next();
  };
}