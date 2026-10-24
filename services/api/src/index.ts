
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
// Set TRUST_PROXY=1 only when the deployment topology warrants it.
if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

// Configure browser origins through CORS_ORIGINS.
// Example: https://app.example.com,https://admin.example.com
const allowedOrigins = (
  process.env.CORS_ORIGINS ?? ''
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  throw new Error(
    'CORS_ORIGINS must contain approved browser origins in production.'
  );
}

// Basic security headers for a JSON API.
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// Native mobile clients may not send an Origin header.
// Browser clients must match an explicitly allowed origin.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Do not grant CORS access to unknown browser origins.
      return callback(null, false);
    },
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
    maxAge: 600,
  })
);

// Retain the current payload limit for compatibility with the scanner.
// A separate, smaller limit should be applied to ordinary JSON endpoints.
app.use(express.json({ limit: '10mb', strict: true }));

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

// Uncaught exceptions leave the process in an unknown state.
// Log and terminate; let the process manager restart it.
process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught exception; shutting down');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled rejection; shutting down');
  process.exit(1);
});
