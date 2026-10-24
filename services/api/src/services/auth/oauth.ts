import { prisma } from '../../db/client.js';
import { env } from '../../env.js';
import { randomToken, sha256, sha256Base64Url } from '../../lib/crypto.js';
import { AppError } from '../../middleware/error.js';
import { logger } from '../../lib/logger.js';
export interface OAuthStateInput {
  provider: string;
  codeVerifier: string;
  nonce?: string;
  userId?: string;
  mode: 'signin' | 'link';
  mobileRedirect?: string;
  ttlMinutes?: number;
}

export async function createOAuthState(input: OAuthStateInput) {
  const state = randomToken(32);
  const stateHash = sha256(state);
  const ttl = input.ttlMinutes ?? 10;

  await prisma.oAuthState.create({
    data: {
      stateHash,
      provider: input.provider,
      codeVerifier: input.codeVerifier,
      nonce: input.nonce ?? null,
      userId: input.userId ?? null,
      mode: input.mode,
      mobileRedirect: input.mobileRedirect ?? null,
      expiresAt: new Date(Date.now() + ttl * 60 * 1000),
    },
  });

  return state;
}