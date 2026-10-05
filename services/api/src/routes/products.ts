import { Router } from 'express';
import { prisma } from '../db/client.js';

export const productsRouter = Router();

// In-memory cache
const cache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

function getFromCache(barcode: string) {
  const item = cache.get(barcode);
  if (item && item.expiresAt > Date.now()) return item.data;
  if (item) cache.delete(barcode);
  return null;
}

function setCache(barcode: string, data: any) {
  cache.set(barcode, { data, expiresAt: Date.now() + CACHE_TTL });
}

productsRouter.get('/:barcode', async (req, res, next) => {
  try {
    const barcode = String(req.params.barcode);

    // 1. Cache
    const cached = getFromCache(barcode);
    if (cached) {
      return res.json({ ok: true, data: cached, source: 'cache' });
    }

    // 2. Internal DB (104 ta mahsulot)
    const local = await prisma.product.findUnique({ where: { barcode } });
    if (local) {
      const result = {
        id: local.id,
        barcode: local.barcode,
        name: local.name,
        brand: local.brand,
        packagingType: local.packagingType,
        weightGrams: local.weightGrams,
        imageUrl: null,
        source: 'internal',
      };
      setCache(barcode, result);
      return res.json({ ok: true, data: result });
    }

    // 3. Open Food Facts (2 mln+)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);

      const offRes = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=product_name,brands,image_front_url,image_url,quantity,packaging,categories`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);

      const offData: any = await offRes.json();

      if (offData.status === 1 && offData.product) {
        const p = offData.product;
        const result = {
          id: null,
          barcode,
          name: p.product_name || 'Noma\'lum mahsulot',
          brand: p.brands || null,
          packagingType: detectPackaging(p.packaging),
          weightGrams: parseWeight(p.quantity),
          imageUrl: p.image_front_url || p.image_url || null,
          source: 'openfoodfacts',
        };
        setCache(barcode, result);
        return res.json({ ok: true, data: result });
      }
    } catch (err) {
      console.log('OFF error:', (err as Error).message);
    }

    // Topilmadi
    res.json({
      ok: true,
      data: {
        id: null,
        barcode,
        name: 'Noma\'lum mahsulot',
        brand: null,
        packagingType: 'other',
        weightGrams: null,
        imageUrl: null,
        source: 'unknown',
      },
    });
  } catch (err) {
    next(err);
  }
});

function detectPackaging(packaging: string | undefined): string {
  if (!packaging) return 'other';
  const p = packaging.toLowerCase();
  if (p.includes('plastic') || p.includes('pet') || p.includes('hdpe')) return 'plastic';
  if (p.includes('aluminium') || p.includes('aluminum') || p.includes('metal')) return 'aluminium';
  if (p.includes('paper') || p.includes('cardboard') || p.includes('carton')) return 'paper';
  if (p.includes('glass')) return 'glass';
  return 'other';
}

function parseWeight(quantity: string | undefined): number | null {
  if (!quantity) return null;
  const match = quantity.match(/(\d+(?:\.\d+)?)\s*(g|gram|grams|ml|cl|l)/i);
  if (!match || !match[1] || !match[2]) return null;
  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === 'g' || unit === 'gram' || unit === 'grams') return value;
  if (unit === 'ml') return value;
  if (unit === 'cl') return value * 10;
  if (unit === 'l') return value * 1000;
  return null;
}