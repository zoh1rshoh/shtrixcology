
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error & { status?: number; statusCode?: number; type?: string },
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

  if (
    err.type === 'entity.too.large' ||
    err.status === 413 ||
    err.statusCode === 413
  ) {
    return res.status(413).json({
      ok: false,
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request body exceeds the 1 MB limit',
      },
    });
  }

  logger.error(err);
  return res.status(500).json({
    ok: false,
    error: { code: 'INTERNAL', message: 'Internal server error' },
  });
}
