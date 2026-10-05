import { PASSPORT_ID_PREFIX } from '@shtrixcology/shared';

export function generatePassportId(barcode: string, productName: string): string {
  const year = new Date().getFullYear();
  const name = productName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);
  const random = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, '0');
  return `${PASSPORT_ID_PREFIX}-${year}-${name}-${random}`;
}