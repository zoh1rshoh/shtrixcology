import { Router } from 'express';
import { prisma } from '../db/client.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { getProviderConfigs } from '../lib/providers.js';

export const providersRouter = Router();
providersRouter.use(requireAuth);

// ===========================================
// GET /v1/providers — capabilities + connection status
// ===========================================
providersRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const [identities, messaging] = await Promise.all([
      prisma.identityProvider.findMany({ where: { userId: req.userId! } }),
      prisma.messagingIntegration.findMany({ where: { userId: req.userId! } }),
    ]);

    const identityMap = new Map(
      identities.map((i) => [i.provider, i])
    );
    const messagingMap = new Map(
      messaging.map((m) => [m.provider, m])
    );

    const configs = getProviderConfigs();

    const providers = configs.map((c) => {
      let status: string = c.configured
        ? 'not_connected'
        : 'not_configured';
      let externalId: string | null = null;
      let displayName: string | null = null;
      let linkedAt: string | null = null;

      if (c.category === 'identity') {
        const conn = identityMap.get(c.id);
        if (conn) {
          status = 'connected';
          externalId = conn.email ?? conn.providerUserId;
          displayName = conn.displayName ?? null;
          linkedAt = conn.linkedAt.toISOString();
        }
      } else {
        const conn = messagingMap.get(c.id);
        if (conn) {
          status = conn.status === 'connected' ? 'connected' : 'reauthorization_required';
          externalId = conn.externalId;
          displayName = conn.displayName ?? null;
          linkedAt = conn.linkedAt.toISOString();
        }
      }

      return {
        id: c.id,
        name: c.name,
        category: c.category,
        icon: c.icon,
        configured: c.configured,
        status,
        capabilities: c.capabilities.map((cap) => ({
          ...cap,
          // Capability-level check
          available: cap.requiresConfig.every((key) => {
            const idx = c.missingConfig.indexOf(key);
            return idx === -1;
          }),
        })),
        connection: {
          externalId,
          displayName,
          linkedAt,
        },
        missingConfig: c.missingConfig,
      };
    });

    res.json({ ok: true, data: { providers } });
  } catch (err) {
    next(err);
  }
});