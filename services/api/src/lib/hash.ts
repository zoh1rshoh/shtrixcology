import crypto from 'node:crypto';

// Sodda pHash: rasm base64 dan deterministic hash
export function photoFingerprint(photoBase64: string): string {
  const clean = photoBase64.replace(/^data:image\/\w+;base64,/, '');
  return crypto.createHash('sha256').update(clean).digest('hex').slice(0, 32);
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}