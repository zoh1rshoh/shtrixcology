import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt.js';
import { AppError } from './error.js';

export interface AuthRequest extends Request {
  userId?: string;
  role?: string;
}

export function requireAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError('UNAUTHORIZED', 'No token', 401);
  }

  try {
    const payload = verifyToken(header.slice(7));
    req.userId = payload.userId;
    req.role = payload.role;
    next();
  } catch {
    throw new AppError('INVALID_TOKEN', 'Invalid token', 401);
  }
}