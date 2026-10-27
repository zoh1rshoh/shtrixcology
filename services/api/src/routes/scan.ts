
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client.js';
import { getAIProvider } from '../services/ai/index.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/error.js';

export const scanRouter = Router();

function isValidBarcode(barcode: string): boolean {
  if (!/^(?:\d{8}|\d{12,14})$/.test(barcode)) return false;

  const digits = barcode.split('').map(Number);
  const checkDigit = digits.pop();

  if (checkDigit === undefined) return false;

  let sum = 0;
  let weight = 3;

  for (let i = digits.length - 1; i >= 0; i--) {
    const digit = digits[i];
    if (digit === undefined) return false;

    sum += digit * weight;
    weight = weight === 3 ? 1 : 3;
  }

  return (10 - (sum % 10)) % 10 === checkDigit;
}

const analyzeSchema = z.object({
  barcode: z.string().trim().refine(isValidBarcode, 'Shtrix-kod noto‘g‘ri'),
  photoBase64: z.string().min(100).max(900_000),
}).strict();

interface OFFProduct {
  product_name?: string;
  brands?: string;
  image_front_url?: string;
  quantity?: string;
  categories?: string;
}

interface OFFResponse {
  status?: number;
  product?: OFFProduct;
}

function validateImage(value: string): string {
  const match = /^(?:data:image\/(jpeg|png|webp);base64,)?([A-Za-z0-9+/]+={0,2})$/.exec(value);

  const base64 = match?.[2];
  if (!base64) {
    throw new AppError('INVALID_IMAGE', 'Rasm formati noto‘g‘ri', 400);
  }

  if (base64.length % 4 !== 0) {
    throw new AppError('INVALID_IMAGE', 'Base64 rasm noto‘g‘ri', 400);
  }

  const bytes = Buffer.from(base64, 'base64');

  if (!bytes.length || bytes.length > 650_000 || bytes.toString('base64') !== base64) {
    throw new AppError('INVALID_IMAGE', 'Rasm hajmi yoki Base64 formati noto‘g‘ri', 400);
  }

  const isJpeg =
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff;

  const isPng =
    bytes.length >= 8 &&
    bytes.subarray(0, 8).equals(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    );

  const isWebp =
    bytes.length >= 12 &&
    bytes.toString('ascii', 0, 4) === 'RIFF' &&
    bytes.toString('ascii', 8, 12) === 'WEBP';

  if (!isJpeg && !isPng && !isWebp) {
    throw new AppError('INVALID_IMAGE', 'Haqiqiy JPEG, PNG yoki WebP rasm yuboring', 400);
  }

  return base64;
}

scanRouter.post(
  '/analyze',
  requireAuth,
  validate(analyzeSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const { barcode, photoBase64 } = req.body as z.infer<typeof analyzeSchema>;
      const imageBase64 = validateImage(photoBase64);

      const local = await prisma.product.findUnique({ where: { barcode } });

      let offProduct: OFFProduct | null = null;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);

      try {
        const response = await fetch(
          `https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=product_name,brands,image_front_url,quantity,categories`,
          {
            signal: controller.signal,
            headers: { 'User-Agent': 'SHTRIXCOLOGY/0.1' },
          },
        );

        if (response.ok) {
          const result = await response.json() as OFFResponse;
          if (result.status === 1 && result.product) {
            offProduct = result.product;
          }
        }
      } catch {
        // Open Food Facts ishlamasa, AI tahliliga o'tamiz.
      } finally {
        clearTimeout(timeout);
      }

      const ai = getAIProvider();

      const result = await ai.analyzePackagingFull({
        imageBase64,
        barcode,
        productName: local?.name ?? offProduct?.product_name ?? 'Noma’lum mahsulot',
        brand: local?.brand ?? offProduct?.brands ?? null,
        category: offProduct?.categories ?? null,
        quantity: local?.weightGrams
          ? `${local.weightGrams}g`
          : offProduct?.quantity ?? null,
      });

      const validMaterials = ['plastic', 'aluminium', 'paper', 'glass', 'other'];

      if (
        !validMaterials.includes(result.material) ||
        !Number.isFinite(result.confidence) ||
        result.confidence < 0 ||
        result.confidence > 1 ||
        !Number.isFinite(result.estimatedWeightGrams) ||
        result.estimatedWeightGrams < 0 ||
        result.estimatedWeightGrams > 100_000 ||
        !Number.isFinite(result.estimatedEcoPoints) ||
        result.estimatedEcoPoints < 0
      ) {
        throw new AppError('AI_INVALID_RESULT', 'AI natijasi tekshiruvdan o‘tmadi', 502);
      }

      if (!local) {
        try {
          await prisma.product.create({
            data: {
              barcode,
              name: result.productName.slice(0, 200),
              brand: result.brand?.slice(0, 200) ?? null,
              packagingType: result.material,
              weightGrams: result.estimatedWeightGrams,
              source: 'ai_analyzed',
              verified: false,
            },
          });
        } catch (error) {
          const isDuplicate =
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 'P2002';

          if (!isDuplicate) throw error;
        }
      }

      res.json({
        ok: true,
        data: {
          productName: result.productName,
          brand: result.brand,
          category: result.category,
          material: result.material,
          materialCode: result.materialCode,
          isRecyclable: result.isRecyclable,
          estimatedWeightGrams: result.estimatedWeightGrams,
          manufacturer: result.manufacturer,
          countryOfOrigin: result.countryOfOrigin,
          recyclingInstructions: result.recyclingInstructions,
          estimatedEcoPoints: result.estimatedEcoPoints,
          isEmpty: result.isEmpty,
          isClean: result.isClean,
          confidence: result.confidence,
          secondLifePredictions: result.secondLifePredictions,
          imageUrl: offProduct?.image_front_url ?? null,
          source: local ? 'internal' : offProduct ? 'openfoodfacts' : 'ai_only',
        },
      });
    } catch (error) {
      next(error);
    }
  },
);
