import { Router } from 'express';
import { prisma } from '../db/client.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

export const walletRouter = Router();

walletRouter.use(requireAuth);

walletRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    const balance = transactions[0]?.balanceAfter ?? 0;
    res.json({ ok: true, data: { balance, transactions } });
  } catch (err) { next(err); }
}); 