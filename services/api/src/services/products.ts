import { prisma } from '../db/client.js';
import { logger } from '../lib/logger.js';

interface OFFProduct {
  status: number;
  product?: {
    product_name?: string;
    product_name_en?: string;
    product_name_ru?: string;
    brands?: string;
    quantity?: string;
    packaging?: string;
    image_front_small_url?: string;
    categories_tags?: string[];
  };
}

/**
 * Barcode bo'yicha mahsulot qidirish:
 * 1. Local DB
 * 2. Open Food Facts API
 * 3. null (topilmadi)
 */
export async function findOrFetchProduct(barcode: string) {
  // ============ 1. LOCAL DB ============
  const existing = await prisma.product.findUnique({
    where: { barcode },
  });
  if (existing) return existing;

  // ============ 2. OPEN FOOD FACTS ============
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      {
        headers: {
          'User-Agent': 'SHTRIXCOLOGY/0.1 (https://shtrixcology.uz)',
        },
      }
    );

    if (!res.ok) {
      logger.warn({ barcode, status: res.status }, 'OFF request failed');
      return null;
    }

    const data = (await res.json()) as OFFProduct;

    if (data.status !== 1 || !data.product) {
      logger.info({ barcode }, 'OFF: product not found');
      return null;
    }

    const p = data.product;
    const name =
      p.product_name_ru ||
      p.product_name_en ||
      p.product_name ||
      'Noma\'lum mahsulot';

    const packagingType = guessPackaging(
      p.packaging ?? '',
      p.categories_tags ?? []
    );

    // Save to local DB (cache)
    const saved = await prisma.product.create({
      data: {
        barcode,
        name,
        brand: p.brands ?? null,
        packagingType,
        weightGrams: null,
        source: 'openfoodfacts',
        verified: false,
      },
    });

    logger.info({ barcode, name }, 'OFF: product saved');
    return saved;
  } catch (err) {
    logger.error({ err, barcode }, 'OFF error');
    return null;
  }
}

/**
 * Qadoq turini taxmin qilish
 */
function guessPackaging(packaging: string, categories: string[]): string {
  const t = (packaging + ' ' + categories.join(' ')).toLowerCase();
  if (t.includes('plastic') || t.includes('pet') || t.includes('plastik'))
    return 'plastic';
  if (t.includes('aluminium') || t.includes('aluminum') || t.includes('metal'))
    return 'aluminium';
  if (t.includes('glass') || t.includes('shisha')) return 'glass';
  if (t.includes('paper') || t.includes('cardboard') || t.includes('qog'))
    return 'paper';
  return 'plastic'; // default
}

/**
 * Foydalanuvchi qo'lda yaratgan mahsulotni saqlash
 */
export async function saveManualProduct(input: {
  barcode: string;
  name: string;
  brand?: string;
  packagingType: string;
  weightGrams?: number;
}) {
  const existing = await prisma.product.findUnique({
    where: { barcode: input.barcode },
  });
  if (existing) return existing;

  return prisma.product.create({
    data: {
      barcode: input.barcode,
      name: input.name,
      brand: input.brand ?? null,
      packagingType: input.packagingType,
      weightGrams: input.weightGrams ?? null,
      source: 'manual',
      verified: false,
    },
  });
}