import { Router } from 'express';
import { z } from 'zod';
import { createPassport } from '../services/passport.js';
import { prisma } from '../db/client.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/error.js';
import type { MaterialType } from '@shtrixcology/shared';
import { REWARD_RATES } from '@shtrixcology/shared';
import { calculateCO2Saved, CO2_METHODOLOGY } from '../lib/co2.js';

export const passportsRouter = Router();
passportsRouter.use(requireAuth);

const createSchema = z.object({
  barcode: z.string().min(8).max(32),
  productName: z.string().min(1).max(200),
  photoBase64: z.string().min(100),
  declaredWeight: z.number().positive().max(100000),
  isEmpty: z.boolean(),
  aiData: z
    .object({
      material: z.string(),
      materialCode: z.string().nullable().optional(),
      isRecyclable: z.boolean().optional(),
      estimatedWeightGrams: z.number().optional(),
      manufacturer: z.string().nullable().optional(),
      countryOfOrigin: z.string().nullable().optional(),
      recyclingInstructions: z.string().nullable().optional(),
      confidence: z.number().optional(),
      secondLifePredictions: z
        .array(
          z.object({
            type: z.string(),
            label: z.string(),
            probability: z.number(),
          })
        )
        .optional(),
    })
    .optional(),
});

passportsRouter.post('/', validate(createSchema), async (req: AuthRequest, res, next) => {
  try {
    const { passport, rewardPoints } = await createPassport({
      userId: req.userId!,
      ...req.body,
    });

    res.status(201).json({
      ok: true,
      data: {
        passport,
        rewardPoints,
        message: 'Topshiriq tekshiruvni kutmoqda',
      },
    });
  } catch (err) {
    next(err);
  }
});

passportsRouter.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const id = String(req.params.id);
    const passport = await prisma.passport.findUnique({
      where: { id },
      include: { events: { orderBy: { createdAt: 'asc' } } },
    });
    if (!passport || passport.userId !== req.userId) {
      throw new AppError('NOT_FOUND', 'Passport not found', 404);
    }
    res.json({ ok: true, data: { passport, events: passport.events } });
  } catch (err) {
    next(err);
  }
});

const verifyPassportSchema = z.object({
  verifiedWeightGrams: z.number().finite().positive().max(100_000),
  packageEmpty: z.literal(true),
}).strict();

passportsRouter.post(
  '/:id/verify',
  validate(verifyPassportSchema),
  async (req: AuthRequest, res, next) => {
    try {
      if (req.role !== 'admin') {
        throw new AppError(
          'FORBIDDEN',
          'Tasdiqlash uchun admin huquqi kerak',
          403,
        );
      }

      const { verifiedWeightGrams } =
        req.body as z.infer<typeof verifyPassportSchema>;

      const result = await prisma.$transaction(
        async (tx) => {
          const passport = await tx.passport.findUnique({
            where: { id: String(req.params.id) },
          });

          if (!passport) {
            throw new AppError('NOT_FOUND', 'Passport topilmadi', 404);
          }

          if (passport.verifiedAt || passport.rewardedAt || passport.state !== 'created') {
            throw new AppError(
              'ALREADY_VERIFIED',
              'Passport allaqachon tasdiqlangan yoki yaroqsiz',
              409,
            );
          }

          const material = passport.aiMaterial as keyof typeof REWARD_RATES;
          const rate = REWARD_RATES[material];

          if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
            throw new AppError('INVALID_MATERIAL', 'Material uchun mukofot stavkasi topilmadi', 422);
          }

          const rewardPoints = Math.round(verifiedWeightGrams * rate);

          if (!Number.isSafeInteger(rewardPoints) || rewardPoints <= 0) {
            throw new AppError('INVALID_REWARD', 'Mukofot qiymati noto‘g‘ri', 422);
          }

          // Faqat bitta parallel so‘rov passportni tasdiqlay oladi.
          const claimed = await tx.passport.updateMany({
            where: {
              id: passport.id,
              verifiedAt: null,
              rewardedAt: null,
              state: 'created',
            },
            data: {
              declaredWeight: verifiedWeightGrams,
              isEmpty: true,
              aiStatus: 'passed',
              state: 'verified',
              verifiedAt: new Date(),
              rewardedAt: new Date(),
              rewardPoints,
            },
          });

          if (claimed.count !== 1) {
            throw new AppError('ALREADY_VERIFIED', 'Passport allaqachon tasdiqlangan', 409);
          }

          const aggregate = await tx.walletTransaction.aggregate({
            where: { userId: passport.userId },
            _sum: { deltaPoints: true },
          });

          const balanceAfter = (aggregate._sum.deltaPoints ?? 0) + rewardPoints;

          if (!Number.isSafeInteger(balanceAfter)) {
            throw new AppError('INVALID_BALANCE', 'Balansni hisoblab bo‘lmadi', 409);
          }

          await tx.walletTransaction.create({
            data: {
              userId: passport.userId,
              deltaPoints: rewardPoints,
              reason: 'submission_reward',
              submissionId: passport.id,
              balanceAfter,
            },
          });

          const co2SavedG = calculateCO2Saved(
            material as MaterialType,
            verifiedWeightGrams,
          );

          await tx.impactRecord.create({
            data: {
              userId: passport.userId,
              passportId: passport.id,
              material,
              weightGrams: verifiedWeightGrams,
              co2SavedG,
              methodology: CO2_METHODOLOGY,
            },
          });

          await tx.passportEvent.create({
            data: {
              passportId: passport.id,
              eventType: 'verified_and_rewarded',
              actor: 'admin',
              metadata: { verifiedWeightGrams, rewardPoints, co2SavedG },
            },
          });

          return { passportId: passport.id, rewardPoints, balanceAfter };
        },
        { isolationLevel: 'Serializable' },
      );

      res.json({ ok: true, data: result });
    } catch (err) {
      next(err);
    }
  },
);
