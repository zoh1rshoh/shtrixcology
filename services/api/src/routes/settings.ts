import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const settingsRouter = Router();
settingsRouter.use(requireAuth);

// ============================================
// GET /v1/settings
// ============================================
settingsRouter.get('/', async (req: AuthRequest, res, next) => {
    try {
        let settings = await prisma.userSettings.findUnique({
            where: { userId: req.userId! },
        });

        // Auto-create default settings
        if (!settings) {
            settings = await prisma.userSettings.create({
                data: { userId: req.userId! },
            });
        }

        res.json({ ok: true, data: { settings } });
    } catch (err) {
        next(err);
    }
});

// ============================================
// PATCH /v1/settings
// ============================================
const updateSchema = z.object({
    displayName: z.string().max(50).optional().nullable(),
    username: z
        .string()
        .min(3)
        .max(20)
        .regex(/^[a-z0-9_]+$/)
        .optional()
        .nullable(),
    bio: z.string().max(200).optional().nullable(),
    avatarUrl: z.string().optional().nullable(),

    pushEnabled: z.boolean().optional(),
    emailEnabled: z.boolean().optional(),
    passportUpdates: z.boolean().optional(),
    rewardNotifications: z.boolean().optional(),
    weeklyDigest: z.boolean().optional(),
    marketingEmails: z.boolean().optional(),

    theme: z.enum(['light', 'dark', 'system']).optional(),
    language: z.enum(['uz', 'ru', 'en']).optional(),
    reduceMotion: z.boolean().optional(),

    profileVisibility: z.enum(['public', 'friends', 'private']).optional(),
    showInRankings: z.boolean().optional(),
    showLocation: z.boolean().optional(),
    allowInvites: z.boolean().optional(),

    fontSize: z.enum(['small', 'medium', 'large', 'xlarge']).optional(),
    highContrast: z.boolean().optional(),

    battleNotifications: z.boolean().optional(),
    autoAcceptInvites: z.boolean().optional(),
    matchmakingRegion: z.string().nullable().optional(),
    preferredBattleType: z.string().nullable().optional(),
    showInBattleRanking: z.boolean().optional(),

    connectedGoogle: z.boolean().optional(),
    connectedTelegram: z.boolean().optional(),
    connectedApple: z.boolean().optional(),
});

settingsRouter.patch('/', validate(updateSchema), async (req: AuthRequest, res, next) => {
    try {
        // Username uniqueness check
        if (req.body.username) {
            const uname = req.body.username.toLowerCase();
            const existing = await prisma.userSettings.findUnique({
                where: { username: uname },
            });
            if (existing && existing.userId !== req.userId) {
                return res.status(409).json({
                    ok: false,
                    error: { code: 'USERNAME_TAKEN', message: 'Bu username band' },
                });
            }
            req.body.username = uname;
        }

        const settings = await prisma.userSettings.upsert({
            where: { userId: req.userId! },
            create: { userId: req.userId!, ...req.body },
            update: req.body,
        });
        res.json({ ok: true, data: { settings } });
    } catch (err) {
        next(err);
    }
});

// ============================================
// POST /v1/settings/reset
// ============================================
settingsRouter.post('/reset', async (req: AuthRequest, res, next) => {
    try {
        await prisma.userSettings.delete({ where: { userId: req.userId! } });
        const settings = await prisma.userSettings.create({
            data: { userId: req.userId! },
        });
        res.json({ ok: true, data: { settings } });
    } catch (err) {
        next(err);
    }
});

// ============================================
// DELETE /v1/settings/account — xavfli
// ============================================
settingsRouter.delete('/account', async (req: AuthRequest, res, next) => {
    try {
        await prisma.user.delete({ where: { id: req.userId! } });
        res.json({ ok: true, data: { deleted: true } });
    } catch (err) {
        next(err);
    }
});
// ============================================
// GET /v1/settings/check-username/:username
// ============================================
settingsRouter.get('/check-username/:username', async (req: AuthRequest, res, next) => {
    try {
        const username = String(req.params.username).toLowerCase();

        // Validatsiya
        if (!/^[a-z0-9_]{3,20}$/.test(username)) {
            return res.json({
                ok: true,
                data: { available: false, reason: 'invalid_format' },
            });
        }

        const existing = await prisma.userSettings.findUnique({
            where: { username },
        });

        // Agar u o'ziniki bo'lsa
        if (existing?.userId === req.userId) {
            return res.json({ ok: true, data: { available: true } });
        }

        res.json({
            ok: true,
            data: { available: !existing, reason: existing ? 'taken' : null },
        });
    } catch (err) {
        next(err);
    }
});
// ============================================
// POST /v1/settings/export-request
// ============================================
settingsRouter.post('/export-request', async (req: AuthRequest, res, next) => {
  try {
    // TODO: queue export job (BullMQ + S3)
    // Hozircha — status qaytaramiz
    res.json({
      ok: true,
      data: {
        requestId: `exp_${Date.now()}`,
        status: 'pending',
        estimatedReadyAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        message: "Ma'lumotlar eksporti 5 daqiqa ichida tayyor bo'ladi",
      },
    });
  } catch (err) {
    next(err);
  }
});

// ============================================
// POST /v1/settings/support/report
// ============================================
const reportSchema = z.object({
  category: z.enum(['bug', 'account', 'battle', 'team', 'abuse', 'other']),
  subject: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  referenceId: z.string().optional(),
});

settingsRouter.post(
  '/support/report',
  validate(reportSchema),
  async (req: AuthRequest, res, next) => {
    try {
      // TODO: store in `support_tickets` table + notify admin
      const ticketId = `T-${Date.now().toString(36).toUpperCase()}`;
      res.json({
        ok: true,
        data: {
          ticketId,
          status: 'received',
          message: 'Murojaatingiz qabul qilindi',
        },
      });
    } catch (err) {
      next(err);
    }
  }
);