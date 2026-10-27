
import crypto from 'node:crypto';
import { Router } from 'express';
import { signupSchema, loginSchema } from '@shtrixcology/shared';
import { prisma } from '../db/client.js';
import {
  hashPassword,
  verifyPassword,
  isLegacyBcrypt,
} from '../lib/hash.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../lib/jwt.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/error.js';
import { rateLimit } from '../middleware/rateLimit.js';

export const authRouter = Router();

authRouter.post(
  '/signup',
  rateLimit(5, 60_000),
  validate(signupSchema),
  async (req, res, next) => {
    try {
      const { phone, email, fullName, password } = req.body;

      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing) {
        throw new AppError('PHONE_EXISTS', 'Phone already registered', 409);
      }

      const passwordHash = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          phone,
          email: email ?? null,
          fullName,
          passwordHash,
        },
      });

      const payload = {
        userId: user.id,
        role: user.role,
        tokenVersion: user.tokenVersion,
      };

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
          accessToken: signAccessToken(payload),
          refreshToken: signRefreshToken(payload),
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

authRouter.post(
  '/login',
  rateLimit(10, 60_000),
  validate(loginSchema),
  async (req, res, next) => {
    try {
      const { phone, password } = req.body;

      const user = await prisma.user.findUnique({ where: { phone } });
      if (!user) {
        throw new AppError(
          'INVALID_CREDENTIALS',
          'Invalid phone or password',
          401,
        );
      }

      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        throw new AppError(
          'INVALID_CREDENTIALS',
          'Invalid phone or password',
          401,
        );
      }

      // Eski bcrypt hashini Argon2id bilan yangilash.
      if (isLegacyBcrypt(user.passwordHash)) {
        try {
          const newHash = await hashPassword(password);
          await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newHash },
          });
        } catch (migrateErr) {
          // Hash migratsiyasi muvaffaqiyatsiz bo'lsa ham loginni davom ettiramiz.
          console.error('Password hash migration failed:', migrateErr);
        }
      }

      const payload = {
        userId: user.id,
        role: user.role,
        tokenVersion: user.tokenVersion,
      };

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
          accessToken: signAccessToken(payload),
          refreshToken: signRefreshToken(payload),
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

authRouter.post(
  '/refresh',
  rateLimit(10, 60_000),
  async (req, res, next) => {
    try {
      const { refreshToken } = req.body ?? {};

      if (typeof refreshToken !== 'string' || !refreshToken) {
        throw new AppError('NO_TOKEN', 'Refresh token required', 400);
      }

      const payload = verifyRefreshToken(refreshToken);

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || payload.tokenVersion !== user.tokenVersion) {
        throw new AppError(
          'INVALID_TOKEN',
          'Refresh token is invalid or expired',
          401,
        );
      }

      const newPayload = {
        userId: user.id,
        role: user.role,
        tokenVersion: user.tokenVersion,
      };

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
          accessToken: signAccessToken(newPayload),
          refreshToken: signRefreshToken(newPayload),
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// Parolni tiklash kodi.
authRouter.post(
  '/forgot-password',
  rateLimit(3, 60_000),
  async (req, res, next) => {
    try {
      const { phone } = req.body ?? {};

      if (typeof phone !== 'string' || !phone) {
        throw new AppError('VALIDATION_ERROR', 'Telefon raqam kerak', 400);
      }

      const user = await prisma.user.findUnique({ where: { phone } });

      // Hisob mavjudligini oshkor qilmaymiz.
      if (!user) {
        return res.json({
          ok: true,
          data: { message: 'Tasdiqlash kodi yuborildi' },
        });
      }

      const code = crypto.randomInt(100000, 1000000).toString();
      const codeHash = crypto
        .createHash('sha256')
        .update(code)
        .digest('hex');

      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          codeHash,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      // Faqat lokal development muhitida vaqtincha ishlatish uchun.
      // Production uchun SMS provayderini ulash kerak.
      if (process.env.NODE_ENV !== 'production') {
        console.info(`[DEV PASSWORD RESET] User: ${user.id}, Code: ${code}`);
      }

      return res.json({
        ok: true,
        data: { message: 'Tasdiqlash kodi yuborildi' },
      });
    } catch (err) {
      next(err);
    }
  },
);

// Tasdiqlash kodini bir marta ishlatib, parolni yangilash.
authRouter.post(
  '/reset-password',
  rateLimit(5, 60_000),
  async (req, res, next) => {
    try {
      const { phone, code, newPassword } = req.body ?? {};

      if (
        typeof phone !== 'string' ||
        typeof code !== 'string' ||
        typeof newPassword !== 'string' ||
        !phone ||
        !code ||
        !newPassword
      ) {
        throw new AppError(
          'VALIDATION_ERROR',
          'Barcha maydonlarni to‘ldiring',
          400,
        );
      }

      if (newPassword.length < 8) {
        throw new AppError(
          'VALIDATION_ERROR',
          'Parol kamida 8 belgi bo‘lishi kerak',
          400,
        );
      }

      const user = await prisma.user.findUnique({ where: { phone } });
      if (!user) {
        throw new AppError(
          'INVALID_CODE',
          'Kod noto‘g‘ri yoki muddati o‘tgan',
          400,
        );
      }

      const codeHash = crypto
        .createHash('sha256')
        .update(code)
        .digest('hex');

      const resetToken = await prisma.passwordResetToken.findFirst({
        where: { userId: user.id, codeHash },
      });

      if (
        !resetToken ||
        resetToken.usedAt ||
        resetToken.expiresAt <= new Date()
      ) {
        throw new AppError(
          'INVALID_CODE',
          'Kod noto‘g‘ri, ishlatilgan yoki muddati tugagan',
          400,
        );
      }

      const newPasswordHash = await hashPassword(newPassword);

      await prisma.$transaction(async (tx) => {
        const now = new Date();

        const claimed = await tx.passwordResetToken.updateMany({
          where: {
            id: resetToken.id,
            userId: user.id,
            codeHash,
            usedAt: null,
            expiresAt: { gt: now },
          },
          data: { usedAt: now },
        });

        if (claimed.count !== 1) {
          throw new AppError(
            'INVALID_CODE',
            'Kod noto‘g‘ri, ishlatilgan yoki muddati tugagan',
            400,
          );
        }

        await tx.user.update({
          where: { id: user.id },
          data: {
            passwordHash: newPasswordHash,
            tokenVersion: { increment: 1 },
          },
        });

        // Boshqa faol tiklash kodlarini ham bekor qilish.
        await tx.passwordResetToken.deleteMany({
          where: {
            userId: user.id,
            id: { not: resetToken.id },
          },
        });
      });

      return res.json({
        ok: true,
        data: { message: 'Parol muvaffaqiyatli o‘zgartirildi' },
      });
    } catch (err) {
      next(err);
    }
  },
);
