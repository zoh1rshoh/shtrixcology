import type { Request, Response, NextFunction } from 'express';

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(max: number, windowMs: number) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const key = req.ip ?? 'unknown';
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (bucket.count >= max) {
      return _res.status(429).json({
        ok: false,
        error: { code: 'RATE_LIMIT', message: 'Too many requests' },
      });
    }

    bucket.count++;
    next();
  };
}