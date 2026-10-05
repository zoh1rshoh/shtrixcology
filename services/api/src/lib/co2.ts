import { CO2_PER_GRAM } from '@shtrixcology/shared';
import type { MaterialType } from '@shtrixcology/shared';

export function calculateCO2Saved(
  material: MaterialType,
  weightGrams: number
): number {
  return weightGrams * CO2_PER_GRAM[material];
}

export const CO2_METHODOLOGY = 'EPA_WARM_v15';