
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
  // Mijoz yuborgan aiData mukofot hisoblashda ishlatilmaydi.
  aiData?: unknown;
}

const MATERIALS = [
  'plastic',
  'aluminium',
  'paper',
  'glass',
  'other',
] as const;

export async function createPassport(input: CreatePassportInput) {
  if (
    !Number.isFinite(input.declaredWeight) ||
    input.declaredWeight <= 0 ||
    input.declaredWeight > 100_000
  ) {
    throw new AppError('INVALID_WEIGHT', 'Vazn qiymati noto‘g‘ri', 400);
  }

  const phash = photoFingerprint(input.photoBase64);

  const existing = await prisma.passport.findFirst({
    where: {
      userId: input.userId,
      barcode: input.barcode,
      photoPhash: phash,
    },
  });

  if (existing) {
    throw new AppError(
      'DUPLICATE',
      'Bu rasm bilan topshiriq avval yuborilgan',
      409,
    );
  }

  // AI tahlili faqat server tomonidan bajariladi.
  const ai = getAIProvider();

  const analysis = await ai.analyzePackagingFull({
    imageBase64: input.photoBase64,
    barcode: input.barcode,
    productName: input.productName,
    brand: null,
    category: null,
    quantity: null,
  });

  if (
    !MATERIALS.includes(analysis.material) ||
    !Number.isFinite(analysis.confidence) ||
    analysis.confidence < 0 ||
    analysis.confidence > 1 ||
    !Number.isFinite(analysis.estimatedWeightGrams) ||
    analysis.estimatedWeightGrams <= 0 ||
    analysis.estimatedWeightGrams > 100_000 ||
    typeof analysis.isEmpty !== 'boolean'
  ) {
    throw new AppError(
      'AI_INVALID_RESULT',
      'AI natijasi tekshiruvdan o‘tmadi',
      502,
    );
  }

  const material = analysis.material as MaterialType;
  const passportId = generatePassportId(input.barcode, analysis.productName);

  // AI natijasi qadoq topshirilganini yoki vaznni isbotlamaydi.
  // Shu sababli tasdiqlanmaguncha mukofot berilmaydi.
  const passport = await prisma.$transaction(async (tx) => {
    const created = await tx.passport.create({
      data: {
        id: passportId,
        userId: input.userId,
        barcode: input.barcode,
        productName: analysis.productName.slice(0, 200),
        aiMaterial: material,
        aiConfidence: analysis.confidence,
        aiStatus: 'pending',
        aiResponse: {
          source: 'server_ai',
          estimatedWeightGrams: analysis.estimatedWeightGrams,
          isEmpty: analysis.isEmpty,
          isClean: analysis.isClean,
          isRecyclable: analysis.isRecyclable,
        },
        secondLifePredictions:
          analysis.secondLifePredictions as never,
        // Bu hozircha AI taxmini. Mukofot uchun tasdiqlangan
        // vazn keyinchalik ishonchli tekshiruvda yozilishi kerak.
        declaredWeight: analysis.estimatedWeightGrams,
        isEmpty: analysis.isEmpty,
        state: 'created',
        photoPhash: phash,
        rewardPoints: 0,
        verifiedAt: null,
      },
    });

    await tx.passportEvent.create({
      data: {
        passportId: created.id,
        eventType: 'scanned',
        actor: 'user',
        metadata: { barcode: input.barcode },
      },
    });

    await tx.passportEvent.create({
      data: {
        passportId: created.id,
        eventType: 'awaiting_verification',
        actor: 'system',
        metadata: { material, confidence: analysis.confidence },
      },
    });

    return created;
  });

  return {
    passport,
    rewardPoints: 0,
  };
}
