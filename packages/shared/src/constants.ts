import type { MaterialType } from './models.js';

export const MATERIALS: MaterialType[] = [
  'plastic',
  'aluminium',
  'paper',
  'glass',
  'other',
];

export const MATERIAL_LABELS: Record<MaterialType, string> = {
  plastic: 'Plastik',
  aluminium: 'Alyuminiy',
  paper: "Qog'oz",
  glass: 'Shisha',
  other: 'Boshqa',
};

// Points per gram
export const REWARD_RATES: Record<MaterialType, number> = {
  plastic: 0.8,
  aluminium: 2.5,
  paper: 0.4,
  glass: 0.3,
  other: 0.1,
};

// g CO2e per g material (EPA WARM v15)
export const CO2_PER_GRAM: Record<MaterialType, number> = {
  plastic: 1.4,
  aluminium: 9.0,
  paper: 0.9,
  glass: 0.3,
  other: 0.5,
};

export const PASSPORT_ID_PREFIX = 'PP';
export const QR_EXPIRY_DAYS = 7;
export const JOURNEY_TIMELINE_DAYS = [1, 2, 4, 6, 8, 10, 11, 12];