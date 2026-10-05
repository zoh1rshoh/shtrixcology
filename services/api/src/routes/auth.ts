import { Router } from 'express';
import { signupSchema, loginSchema } from '@shtrixcology/shared';
import { prisma } from '../db/client.js';
import { hashPassword } from '../lib/hash.js';
import { signAccessToken, signRefreshToken, verifyToken } from '../lib/jwt.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/error.js';
import { rateLimit } from '../middleware/rateLimit.js';

export const authRouter = Router();

authRouter.post('/signup', rateLimit(5, 60_000), validate(signupSchema), async (req, res, next) => {
  try {
    const { phone, email, fullName, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) throw new AppError('PHONE_EXISTS', 'Phone already registered', 409);

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { phone, email: email ?? null, fullName, passwordHash },
    });

    const payload = { userId: user.id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.status(201).json({
      ok: true,
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          city: user.city,
          createdAt: user.createdAt.toISOString(),
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) { next(err); }
});

authRouter.post('/login', rateLimit(10, 60_000), validate(loginSchema), async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) throw new AppError('INVALID_CREDENTIALS', 'Invalid phone or password', 401);

    const hash = await hashPassword(password);
    if (hash !== user.passwordHash) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid phone or password', 401);
    }

    const payload = { userId: user.id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.json({
      ok: true,
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          city: user.city,
          createdAt: user.createdAt.toISOString(),
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) { next(err); }
});

authRouter.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError('NO_TOKEN', 'Refresh token required', 400);

    const payload = verifyToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw new AppError('USER_NOT_FOUND', 'User not found', 404);

    const newPayload = { userId: user.id, role: user.role };
    res.json({
      ok: true,
      data: {
        user: {
          id: user.id, phone: user.phone, email: user.email,
          fullName: user.fullName, role: user.role, city: user.city,
          createdAt: user.createdAt.toISOString(),
        },
        accessToken: signAccessToken(newPayload),
        refreshToken: signRefreshToken(newPayload),
      },
    });
  } catch (err) { next(err); }
});