
import express from 'express';
import cors from 'cors';
import os from 'node:os';

import { env } from './env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/error.js';
import { logger } from './lib/logger.js';

const app = express();

// Do not disclose the Express framework through response headers.
app.disable('x-powered-by');

// Trust a reverse proxy only when explicitly configured.
if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

// Configure allowed browser origins through env.ts.
const allowedOrigins = env.CORS_ORIGINS
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// A browser frontend must have an explicit origin allowlist in production.
// A mobile-only API may not need CORS_ORIGINS; revisit this if a web
// frontend or admin panel is deployed.
if (
  env.NODE_ENV === 'production' &&
  allowedOrigins.length === 0
) {
  logger.warn(
    'CORS_ORIGINS is empty; browser cross-origin access will not be allowed.'
  );
}

// Basic security headers for a JSON API.
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; frame-ancestors 'none'"
  );
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// Native mobile clients commonly do not send an Origin header.
// Browser clients must match an explicitly allowed origin.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Do not grant browser CORS access to unknown origins.
      return callback(null, false);
    },
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Idempotency-Key',
    ],
    maxAge: 600,
  })
);

// Apply a conservative default JSON body limit.
// If the scanner sends large base64 images, use a dedicated larger
// limit on that specific route rather than increasing every endpoint.
app.use(express.json({ limit: '1mb', strict: true }));

app.use('/v1', apiRouter);

// Centralized application error handling.
app.use(errorHandler);

function getLocalIP(): string {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }

  return 'localhost';
}

const server = app.listen(env.PORT, '0.0.0.0', () => {
  logger.info(
    { port: env.PORT, environment: env.NODE_ENV },
    'SHTRIXCOLOGY API started'
  );

  if (env.NODE_ENV === 'development') {
    logger.info(
      { url: `http://${getLocalIP()}:${env.PORT}` },
      'Development network address'
    );
  }
});

// Limit slow or incomplete HTTP connections.
server.requestTimeout = 30_000;
server.headersTimeout = 15_000;
server.keepAliveTimeout = 5_000;

// Log and terminate on unexpected process-level failures.
// A process manager or development runner should restart the API.
process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught exception; shutting down');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled rejection; shutting down');
  process.exit(1);
});
