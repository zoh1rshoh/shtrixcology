import { REWARD_RATES } from '@shtrixcology/shared';
import type { MaterialType } from '@shtrixcology/shared';
import { prisma } from '../db/client.js';
import { generatePassportId } from '../lib/id.js';
import { photoFingerprint } from '../lib/hash.js';
import { getAIProvider } from './ai/index.js';
import { AppError } from '../middleware/error.js';

export interface CreatePassportInput {
  userId: string;
  barcode: string;
  productName: string;
  photoBase64: string;
  declaredWeight: number;
  isEmpty: boolean;
  aiData?: {
    material: string;
    materialCode?: string | null;
    isRecyclable?: boolean;
    estimatedWeightGrams?: number;
    manufacturer?: string | null;
    countryOfOrigin?: string | null;
    recyclingInstructions?: string | null;
    confidence?: number;
    secondLifePredictions?: Array<{
      type: string;
      label: string;
      probability: number;
    }>;
  };
}

export async function createPassport(input: CreatePassportInput) {
  const phash = photoFingerprint(input.photoBase64);

  // Duplicate check
  const existing = await prisma.passport.findFirst({
    where: { userId: input.userId, barcode: input.barcode, photoPhash: phash },
  });
  if (existing) {
    throw new AppError('DUPLICATE', 'Bu rasm allaqachon yuborilgan', 409);
  }

  // AI ANALYSIS — faqat aiData yo'q bo'lsa
  let material: MaterialType;
  let confidence: number;
  let secondLife: any[];

  if (input.aiData) {
    // Frontend'dan kelgan AI ma'lumotlarini ishlatamiz — qayta AI chaqirmaymiz
    material = (input.aiData.material ?? 'other') as MaterialType;
    confidence = input.aiData.confidence ?? 0.9;
    secondLife = input.aiData.secondLifePredictions ?? [];
  } else {
    // Fallback: AI ni qayta chaqiramiz
    const ai = getAIProvider();
    const analysis = await ai.analyzePackaging({
      imageBase64: input.photoBase64,
      barcode: input.barcode,
      productName: input.productName,
    });
    material = analysis.material as MaterialType;
    confidence = analysis.confidence;
    secondLife = analysis.secondLifePredictions;
  }

  const passportId = generatePassportId(input.barcode, input.productName);
  const rewardPoints = Math.round(
    input.declaredWeight * REWARD_RATES[material]
  );

  const passport = await prisma.passport.create({
    data: {
      id: passportId,
      userId: input.userId,
      barcode: input.barcode,
      productName: input.productName,
      aiMaterial: material,
      aiConfidence: confidence,
      aiStatus: 'passed',
      aiResponse: (input.aiData ?? {}) as never,
      secondLifePredictions: secondLife as never,
      declaredWeight: input.declaredWeight,
      isEmpty: input.isEmpty,
      state: 'created',
      photoPhash: phash,
      rewardPoints,
      verifiedAt: new Date(),
    },
  });

  await prisma.passportEvent.create({
    data: {
      passportId: passport.id,
      eventType: 'scanned',
      actor: 'user',
      metadata: { barcode: input.barcode },
    },
  });

  await prisma.passportEvent.create({
    data: {
      passportId: passport.id,
      eventType: 'verified',
      actor: 'ai',
      metadata: { material, confidence },
    },
  });

  return { passport, rewardPoints };
}