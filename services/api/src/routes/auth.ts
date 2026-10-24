import { Router } from 'express';
import { signupSchema, loginSchema } from '@shtrixcology/shared';
import { prisma } from '../db/client.js';
import { hashPassword, verifyPassword, isLegacyBcrypt } from '../lib/hash.js';
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

    // Endi Argon2id ishlatiladi
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

    // Parolni tekshirish (Argon2id yoki eski bcrypt)
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid phone or password', 401);
    }

    // ============================================
    // MIGRATSIYA: Eski bcrypt -> Yangi Argon2id
    // ============================================
    if (isLegacyBcrypt(user.passwordHash)) {
      try {
        const newHash = await hashPassword(password);
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: newHash },
        });
        // Log yoki konsolga yozish (ixtiyoriy)
        console.log(`🔄 Password migrated to Argon2id for user: ${user.id}`);
      } catch (migrateErr) {
        // Migratsiya xato bersa ham, foydalanuvchini kiritamiz (lekin bazaga yozmaymiz)
        console.error('Migration failed:', migrateErr);
      }
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
import crypto from 'node:crypto';

// ============================================
// 1. KOD SO'RASH (Parolni tiklash uchun)
// ============================================
authRouter.post('/forgot-password', rateLimit(3, 60_000), async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) throw new AppError('VALIDATION_ERROR', 'Telefon raqam kerak', 400);

    const user = await prisma.user.findUnique({ where: { phone } });
    // Xavfsizlik: Agar user topilmasa ham "Yuborildi" deb javob beramiz (enumeration attack'dan himoya)
    if (!user) return res.json({ ok: true, data: { message: "Kod yuborildi" } });

    // 6 xonali kod generatsiya qilamiz
    const code = crypto.randomInt(100000, 999999).toString();
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    // Eski kodlarni o'chiramiz
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 daqiqa
      },
    });

    // Hozircha SMS yo'q, shuning uchun konsolga chiqaramiz (Keyinchalik SMS API ga ulanadi)
    console.log(`\n🔑 [SMS YUBORILDI] User: ${phone}, Kod: ${code}\n`);

    res.json({ ok: true, data: { message: "Tasdiqlash kodi yuborildi" } });
  } catch (err) { next(err); }
});

// ============================================
// 2. KODNI TEKSHIRISH VA PAROLNI YANGILASH
// ============================================
authRouter.post('/reset-password', rateLimit(5, 60_000), async (req, res, next) => {
  try {
    const { phone, code, newPassword } = req.body;
    if (!phone || !code || !newPassword) throw new AppError('VALIDATION_ERROR', 'Barcha maydonlarni to\'ldiring', 400);
    if (newPassword.length < 8) throw new AppError('VALIDATION_ERROR', 'Parol kamida 8 belgi', 400);

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) throw new AppError('INVALID_CODE', 'Kod xato yoki muddati o\'tgan', 400);

    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { userId: user.id, codeHash },
    });

    if (!resetToken) throw new AppError('INVALID_CODE', 'Kod xato', 400);
    if (resetToken.usedAt) throw new AppError('INVALID_CODE', 'Kod allaqachon ishlatilgan', 400);
    if (resetToken.expiresAt < new Date()) throw new AppError('INVALID_CODE', 'Kod muddati o\'tgan', 400);

    // Yangi parolni hash qilamiz
    const newPasswordHash = await hashPassword(newPassword);

    // Tranzaksiya orqali parolni yangilaymiz va kodni o'chirilgan deb belgilaymiz
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    res.json({ ok: true, data: { message: "Parol muvaffaqiyatli o'zgartirildi" } });
  } catch (err) { next(err); }
});