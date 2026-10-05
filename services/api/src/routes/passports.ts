import { Router } from 'express';
import { z } from 'zod';
import { createPassport } from '../services/passport.js';
import { creditReward } from '../services/reward.js';
import { recordImpact } from '../services/impact.js';
import { prisma } from '../db/client.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/error.js';
import type { MaterialType } from '@shtrixcology/shared';

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

    await creditReward(req.userId!, passport.id, rewardPoints);
    await recordImpact(
      req.userId!,
      passport.id,
      passport.aiMaterial as MaterialType,
      passport.declaredWeight
    );

    res.status(201).json({
      ok: true,
      data: { passport, rewardPoints },
    });
  } catch (err) {
    next(err);
  }
});

passportsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const passports = await prisma.passport.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ ok: true, data: { passports, total: passports.length } });
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