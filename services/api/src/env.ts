
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z
  .object({
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(16),
    JWT_ACCESS_EXPIRES: z.string().default('15m'),
    JWT_REFRESH_EXPIRES: z.string().default('7d'),

    GEMINI_API_KEY: z.string().default(''),
    AI_PROVIDER: z.enum(['gemini']).default('gemini'),

    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),

    // Browser origins, separated by commas.
    // Native mobile applications do not require a browser origin.
    CORS_ORIGINS: z.string().default(''),

    TOKEN_ENCRYPTION_KEY: z.string().default(''),
    PASSWORD_PEPPER: z.string().min(16).default('dev-pepper-not-secure'),

    GOOGLE_CLIENT_ID: z.string().default(''),
    GOOGLE_CLIENT_SECRET: z.string().default(''),
    GOOGLE_REDIRECT_URI: z
      .string()
      .default('http://localhost:3000/v1/auth/oauth/google/callback'),

    APPLE_CLIENT_ID: z.string().default(''),
    APPLE_TEAM_ID: z.string().default(''),
    APPLE_KEY_ID: z.string().default(''),
    APPLE_PRIVATE_KEY: z.string().default(''),
    APPLE_REDIRECT_URI: z
      .string()
      .default('http://localhost:3000/v1/auth/oauth/apple/callback'),

    FACEBOOK_APP_ID: z.string().default(''),
    FACEBOOK_APP_SECRET: z.string().default(''),
    FACEBOOK_REDIRECT_URI: z
      .string()
      .default('http://localhost:3000/v1/auth/oauth/facebook/callback'),

    TELEGRAM_BOT_TOKEN: z.string().default(''),
    TELEGRAM_BOT_USERNAME: z.string().default(''),
    TELEGRAM_WEBHOOK_SECRET: z.string().default(''),

    INSTAGRAM_APP_ID: z.string().default(''),
    INSTAGRAM_APP_SECRET: z.string().default(''),
    INSTAGRAM_APPROVED: z.string().default(''),
    FACEBOOK_PAGE_TOKEN: z.string().default(''),
    MESSENGER_APPROVED: z.string().default(''),

    X_CLIENT_ID: z.string().default(''),
    X_CLIENT_SECRET: z.string().default(''),
    X_DM_ENABLED: z.string().default(''),
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV !== 'production') return;

    if (value.JWT_SECRET.length < 32) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_SECRET'],
        message: 'Production JWT_SECRET must be at least 32 characters.',
      });
    }

    if (
      value.PASSWORD_PEPPER === 'dev-pepper-not-secure' ||
      value.PASSWORD_PEPPER.length < 32
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['PASSWORD_PEPPER'],
        message:
          'Production PASSWORD_PEPPER must be a unique secret of at least 32 characters.',
      });
    }

    if (value.CORS_ORIGINS.trim()) {
      const origins = value.CORS_ORIGINS
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

      for (const origin of origins) {
        try {
          const url = new URL(origin);

          if (
            url.protocol !== 'https:' ||
            url.origin !== origin ||
            url.username ||
            url.password
          ) {
            throw new Error('Invalid origin');
          }
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['CORS_ORIGINS'],
            message:
              `Invalid production origin "${origin}". Use an HTTPS origin without a path.`,
          });
        }
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
