import type { MaterialType } from '@shtrixcology/shared';
import { prisma } from '../db/client.js';
import { calculateCO2Saved, CO2_METHODOLOGY } from '../lib/co2.js';

export async function recordImpact(
  userId: string,
  passportId: string,
  material: MaterialType,
  weightGrams: number
) {
  const co2SavedG = calculateCO2Saved(material, weightGrams);

  return prisma.impactRecord.create({
    data: {
      userId,
      passportId,
      material,
      weightGrams,
      co2SavedG,
      methodology: CO2_METHODOLOGY,
    },
  });
}