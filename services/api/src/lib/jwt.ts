
import jwt from 'jsonwebtoken';
import { env } from '../env.js';

export interface JwtPayload {
  userId: string;
  role: string;
  tokenVersion: number;
}

type TokenType = 'access' | 'refresh';

interface TypedJwtPayload extends JwtPayload {
  type: TokenType;
}

function signToken(
  payload: JwtPayload,
  type: TokenType,
  expiresIn: string,
): string {
  if (
    !Number.isSafeInteger(payload.tokenVersion) ||
    payload.tokenVersion < 0
  ) {
    throw new Error('Invalid token version');
  }

  return jwt.sign(
    {
      userId: payload.userId,
      role: payload.role,
      tokenVersion: payload.tokenVersion,
      type,
    },
    env.JWT_SECRET,
    { expiresIn } as jwt.SignOptions,
  );
}

function verifyTypedToken(
  token: string,
  expectedType: TokenType,
): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);

  if (
    typeof decoded === 'string' ||
    !decoded ||
    typeof decoded.userId !== 'string' ||
    typeof decoded.role !== 'string' ||
    !Number.isSafeInteger(decoded.tokenVersion) ||
    (decoded.tokenVersion as number) < 0 ||
    (decoded as TypedJwtPayload).type !== expectedType
  ) {
    throw new Error('Invalid token type or payload');
  }

  return {
    userId: decoded.userId,
    role: decoded.role,
    tokenVersion: decoded.tokenVersion as number,
  };
}

export function signAccessToken(payload: JwtPayload): string {
  return signToken(payload, 'access', env.JWT_ACCESS_EXPIRES);
}

export function signRefreshToken(payload: JwtPayload): string {
  return signToken(payload, 'refresh', env.JWT_REFRESH_EXPIRES);
}

export function verifyAccessToken(token: string): JwtPayload {
  return verifyTypedToken(token, 'access');
}

export function verifyRefreshToken(token: string): JwtPayload {
  return verifyTypedToken(token, 'refresh');
}
