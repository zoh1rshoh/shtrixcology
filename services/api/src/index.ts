import express from 'express';
import cors from 'cors';
import os from 'node:os';
import { env } from './env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/error.js';
import { logger } from './lib/logger.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.use('/v1', apiRouter);
app.use(errorHandler);

// ============================================
// XATOLARNI GLOBAL USHLASH (Process crash bo'lmasligi uchun)
// ============================================
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ promise, reason }, '❌ Unhandled Rejection at:');
});

process.on('uncaughtException', (error) => {
  logger.error({ error }, '❌ Uncaught Exception:');
});

function getLocalIP(): string {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name] ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

app.listen(env.PORT, '0.0.0.0', () => {
  logger.info(`🚀 SHTRIXCOLOGY API running on http://0.0.0.0:${env.PORT}`);
  logger.info(`📱 Telefon uchun: http://${getLocalIP()}:${env.PORT}`);
});