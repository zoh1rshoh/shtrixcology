
import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt.js';
import { prisma } from '../db/client.js';
import { AppError } from './error.js';

export interface AuthRequest extends Request {
  userId?: string;
  role?: string;
}

export async function requireAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const authorization = req.headers.authorization;

  if (!authorization || !/^Bearer\s+\S+$/.test(authorization)) {
    next(new AppError('UNAUTHORIZED', 'Autentifikatsiya talab qilinadi', 401));
    return;
  }

  const token = authorization.replace(/^Bearer\s+/i, '');

  let payload: ReturnType<typeof verifyAccessToken>;

  try {
    payload = verifyAccessToken(token);
  } catch {
    next(
      new AppError(
        'INVALID_TOKEN',
        'Token yaroqsiz yoki muddati tugagan',
        401,
      ),
    );
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        role: true,
        tokenVersion: true,
      },
    });

    if (!user) {
      next(new AppError('UNAUTHORIZED', 'Foydalanuvchi topilmadi', 401));
      return;
    }

    if (payload.tokenVersion !== user.tokenVersion) {
      next(
        new AppError(
          'INVALID_TOKEN',
          'Sessiya bekor qilingan. Qayta tizimga kiring.',
          401,
        ),
      );
      return;
    }

    // Foydalanuvchining joriy rolini bazadan olamiz.
    req.userId = user.id;
    req.role = user.role;

    next();
  } catch {
    next(
      new AppError(
        'AUTH_CHECK_FAILED',
        'Autentifikatsiyani tekshirib bo‘lmadi',
        503,
      ),
    );
  }
}
