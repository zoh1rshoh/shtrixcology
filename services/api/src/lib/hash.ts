import argon2 from 'argon2';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { env } from '../env.js';

// ============================================
// 8 GB RAM HIMOYASI: Hashing Navbati
// Bir vaqtda faqat 2 ta og'ir operatsiya bajariladi
// ============================================
let activeHashes = 0;
const MAX_CONCURRENT = 2;
const queue: (() => void)[] = [];

async function withHashLock<T>(fn: () => Promise<T>): Promise<T> {
  if (activeHashes >= MAX_CONCURRENT) {
    await new Promise<void>((resolve) => queue.push(resolve));
  }
  
  activeHashes++;
  try {
    return await fn();
  } finally {
    activeHashes--;
    if (queue.length > 0) {
      const next = queue.shift();
      if (next) next();
    }
  }
}

// ============================================
// RASM FINGERPRINT (O'zgarishsiz)
// ============================================
export function photoFingerprint(photoBase64: string): string {
  const clean = photoBase64.replace(/^data:image\/\w+;base64,/, '');
  return crypto.createHash('sha256').update(clean).digest('hex').slice(0, 32);
}

// ============================================
// PAROL HASH QILISH (Argon2id + Pepper)
// ============================================
export async function hashPassword(password: string): Promise<string> {
  return withHashLock(async () => {
    // Pepper ni parolga qo'shamiz
    const pepperedPassword = password + env.PASSWORD_PEPPER;

    // Argon2id (OWASP tavsiya qilgan qiymatlar: 19 MiB, 2 iteratsiya)
    return argon2.hash(pepperedPassword, {
      type: argon2.argon2id,
      memoryCost: 19456, // 19 MiB
      timeCost: 2,
      parallelism: 1,
    });
  });
}

// ============================================
// PAROLNI TEKSHIRISH (Argon2id + Eski bcrypt Migratsiyasi)
// ============================================
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  // OAuth foydalanuvchilari uchun
  if (hash === '!oauth') return false;

  const pepperedPassword = password + env.PASSWORD_PEPPER;

  return withHashLock(async () => {
    // 1. Agar yangi Argon2id hash bo'lsa
    if (hash.startsWith('$argon2id$')) {
      try {
        return await argon2.verify(hash, pepperedPassword);
      } catch (err) {
        return false;
      }
    }

    // 2. Agar eski bcrypt hash bo'lsa (Migratsiya uchun)
    if (hash.startsWith('$2b$') || hash.startsWith('$2a$')) {
      // Eski hash'lar pepper'siz yaratilgan
      return bcrypt.compare(password, hash);
    }

    return false;
  });
}

// Eski bcrypt hash ekanligini aniqlash (auth.ts da ishlatiladi)
export function isLegacyBcrypt(hash: string): boolean {
  return hash.startsWith('$2b$') || hash.startsWith('$2a$');
}