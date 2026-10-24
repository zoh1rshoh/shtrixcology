import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client.js';
import { logger } from '../lib/logger.js';

export const productsRouter = Router();

// ===========================================
// CONFIG
// ===========================================
const OFF_BASE = 'https://world.openfoodfacts.org/api/v3/product';
const OFF_TIMEOUT_MS = 4000;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 soat (in-memory)
const USER_AGENT = 'SHTRIXCOLOGY/0.1.0 (contact@shtrixcology.uz)';

// ===========================================
// IN-MEMORY CACHE
// ===========================================
interface CachedProduct {
  data: unknown;
  expiresAt: number;
}
const cache = new Map<string, CachedProduct>();

function getFromCache(barcode: string): unknown | null {
  const item = cache.get(barcode);
  if (item && item.expiresAt > Date.now()) return item.data;
  if (item) cache.delete(barcode);
  return null;
}

function setCache(barcode: string, data: unknown): void {
  cache.set(barcode, { data, expiresAt: Date.now() + CACHE_TTL });
}

// ===========================================
// RATE LIMIT — OFF uchun
// ===========================================
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function checkRate(ip: string, max = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const b = rateBuckets.get(ip);
  if (!b || b.resetAt < now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= max) return false;
  b.count++;
  return true;
}

// ===========================================
// BARCODE VALIDATION
// ===========================================
const barcodeSchema = z.string().regex(/^\d{8,14}$/);

// ===========================================
// NORMALIZER
// ===========================================
interface NormalizedProduct {
  barcode: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  quantity: string | null;
  categories: string | null;
  packagingType: string;
  weightGrams: number | null;
  source: 'internal' | 'openfoodfacts' | 'ai_only' | 'unknown';
  attribution: string | null;
}

function normalizeOFF(off: any, barcode: string): NormalizedProduct {
  const product = off?.product ?? {};

  // Brand — birinchi bo'lak
  let brand: string | null = null;
  if (product.brands) {
    const parts = String(product.brands).split(',');
    const first = parts[0];
    if (first) brand = first.trim();
  }

  return {
    barcode,
    name:
      product.product_name ||
      product.product_name_en ||
      product.product_name_uz ||
      "Noma'lum mahsulot",
    brand,
    imageUrl: product.image_front_url || product.image_url || null,
    quantity: product.quantity ?? null,
    categories: product.categories ?? null,
    packagingType: detectPackaging(product.packaging),
    weightGrams: parseWeight(product.quantity),
    source: 'openfoodfacts',
    attribution: 'Open Food Facts (ODbL)',
  };
} 
function detectPackaging(packaging: string | undefined): string {
  if (!packaging) return 'other';
  const p = packaging.toLowerCase();
  if (p.includes('plastic') || p.includes('pet') || p.includes('hdpe'))
    return 'plastic';
  if (p.includes('aluminium') || p.includes('aluminum') || p.includes('metal'))
    return 'aluminium';
  if (p.includes('paper') || p.includes('cardboard') || p.includes('carton'))
    return 'paper';
  if (p.includes('glass')) return 'glass';
  return 'other';
}

function parseWeight(quantity: string | undefined): number | null {
  if (!quantity) return null;

  const match = quantity.match(
    /(\d+(?:[.,]\d+)?)\s*(g|gram|grams|ml|cl|l)/i
  );
  if (!match) return null;

  const numStr: string | undefined = match[1];
  const unitStr: string | undefined = match[2];
  if (!numStr || !unitStr) return null;

  const value = parseFloat(numStr.replace(',', '.'));
  const unit = unitStr.toLowerCase();

  if (unit === 'g' || unit === 'gram' || unit === 'grams') return value;
  if (unit === 'ml') return value;
  if (unit === 'cl') return value * 10;
  if (unit === 'l') return value * 1000;
  return null;
}

// ===========================================
// GET /v1/products/:barcode
// ===========================================
productsRouter.get('/:barcode', async (req, res, next) => {
  try {
    const raw = String(req.params.barcode);
    const parsed = barcodeSchema.safeParse(raw);

    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        error: {
          code: 'INVALID_BARCODE',
          message: "Barcode 8-14 raqamdan iborat bo'lishi kerak",
        },
      });
    }

    const barcode = parsed.data;
    const ip = req.ip ?? 'unknown';

    // 1. In-memory cache
    const cached = getFromCache(barcode);
    if (cached) {
      return res.json({ ok: true, data: cached, source: 'cache' });
    }

    // 2. Local DB
    const local = await prisma.product.findUnique({ where: { barcode } });
    if (local) {
      const normalized: NormalizedProduct = {
        barcode: local.barcode,
        name: local.name,
        brand: local.brand,
        imageUrl: null,
        quantity: local.weightGrams ? `${local.weightGrams}g` : null,
        categories: null,
        packagingType: local.packagingType,
        weightGrams: local.weightGrams,
        source: 'internal',
        attribution: null,
      };
      setCache(barcode, normalized);
      return res.json({ ok: true, data: normalized, source: 'internal' });
    }

    // 3. Open Food Facts — rate limit
    if (!checkRate(ip)) {
      return res.status(429).json({
        ok: false,
        error: {
          code: 'RATE_LIMIT',
          message: "Juda ko'p so'rov. 1 daqiqadan keyin urinib ko'ring",
        },
      });
    }

    let offData: any = null;
    let offFailed = false;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), OFF_TIMEOUT_MS);

      const offRes = await fetch(`${OFF_BASE}/${barcode}.json`, {
        signal: controller.signal,
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json',
        },
      });
      clearTimeout(timeout);

      if (offRes.status === 404) {
        offData = null;
      } else if (!offRes.ok) {
        offFailed = true;
        logger.warn(
          { barcode, status: offRes.status },
          'Open Food Facts HTTP error'
        );
      } else {
        offData = await offRes.json();
      }
    } catch (err) {
      offFailed = true;
      logger.warn(
        { barcode, err: (err as Error).message },
        'Open Food Facts network error'
      );
    }

    // OFF topilmadi
    if (!offData || offData.status === 'failure' || !offData.product) {
      if (offFailed) {
        return res.status(502).json({
          ok: false,
          error: {
            code: 'OFF_UNAVAILABLE',
            message: 'Tashqi xizmat vaqtincha ishlamayapti',
          },
        });
      }
      return res.status(404).json({
        ok: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Bu barcode bazada topilmadi',
        },
      });
    }

    // Normalize
    const normalized = normalizeOFF(offData, barcode);

    // 4. Cache to local DB (upsert — keyingi safar tez)
    try {
      await prisma.product.upsert({
        where: { barcode },
        create: {
          barcode,
          name: normalized.name,
          brand: normalized.brand,
          packagingType: normalized.packagingType,
          weightGrams: normalized.weightGrams,
          source: 'openfoodfacts',
          verified: false,
        },
        update: {
          name: normalized.name,
          brand: normalized.brand,
          packagingType: normalized.packagingType,
          weightGrams: normalized.weightGrams,
        },
      });
    } catch (err) {
      logger.warn({ barcode, err }, 'Local DB cache upsert failed');
    }

    // 5. In-memory cache
    setCache(barcode, normalized);

    return res.json({
      ok: true,
      data: normalized,
      source: 'openfoodfacts',
    });
  } catch (err) {
    next(err);
  }
});