import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400
  ) {
    super(message);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      ok: false,
      error: { code: err.code, message: err.message },
    });
  }

  logger.error(err);
  res.status(500).json({
    ok: false,
    error: { code: 'INTERNAL', message: 'Internal server error' },
  });
}