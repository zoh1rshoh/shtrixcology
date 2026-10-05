import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client.js';
import { getAIProvider } from '../services/ai/index.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/error.js';

export const scanRouter = Router();

const analyzeSchema = z.object({
  barcode: z.string().min(8).max(32),
  photoBase64: z.string().min(100),
});

scanRouter.post(
  '/analyze',
  requireAuth,
  validate(analyzeSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const { barcode, photoBase64 } = req.body;

      // 1. Internal DB da bormi?
      const local = await prisma.product.findUnique({ where: { barcode } });

      // 2. Open Food Facts
      let offProduct: any = null;
      try {
        const ctl = new AbortController();
        const timeout = setTimeout(() => ctl.abort(), 2000);
        const r = await fetch(
          `https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=product_name,brands,image_front_url,quantity,categories,packaging,countries,manufacturing_places`,
          { signal: ctl.signal }
        );
        clearTimeout(timeout);
        const j: any = await r.json();
        if (j.status === 1) offProduct = j.product;
      } catch {
        // OFF ishlamadi — davom etamiz
      }

      // 3. AI — photo + context → to'liq ma'lumot
      const ai = getAIProvider();
      const aiResult = await ai.analyzePackagingFull({
        imageBase64: photoBase64,
        barcode,
        productName:
          local?.name ?? offProduct?.product_name ?? 'Noma\'lum mahsulot',
        brand: local?.brand ?? offProduct?.brands ?? null,
        category: offProduct?.categories ?? null,
        quantity: local?.weightGrams
          ? `${local.weightGrams}g`
          : offProduct?.quantity ?? null,
      });

      // 4. Agar DB'da yo'q — saqlaymiz (keyingi skaner uchun)
      if (!local) {
        try {
          await prisma.product.create({
            data: {
              barcode,
              name: aiResult.productName,
              brand: aiResult.brand,
              packagingType: aiResult.material,
              weightGrams: aiResult.estimatedWeightGrams,
              source: 'ai_analyzed',
              verified: false,
            },
          });
        } catch {
          // Duplicate — e'tiborsiz
        }
      }

      res.json({
        ok: true,
        data: {
          // AI to'ldiradi
          productName: aiResult.productName,
          brand: aiResult.brand,
          category: aiResult.category,
          material: aiResult.material,
          materialCode: aiResult.materialCode,
          isRecyclable: aiResult.isRecyclable,
          estimatedWeightGrams: aiResult.estimatedWeightGrams,
          manufacturer: aiResult.manufacturer,
          countryOfOrigin: aiResult.countryOfOrigin,
          recyclingInstructions: aiResult.recyclingInstructions,
          estimatedEcoPoints: aiResult.estimatedEcoPoints,
          isEmpty: aiResult.isEmpty,
          isClean: aiResult.isClean,
          confidence: aiResult.confidence,
          secondLifePredictions: aiResult.secondLifePredictions,
          // External
          imageUrl:
            local?.source === 'manual'
              ? null
              : offProduct?.image_front_url ?? null,
          source: local ? 'internal' : offProduct ? 'openfoodfacts' : 'ai_only',
        },
      });
    } catch (err) {
      next(err);
    }
  }
);