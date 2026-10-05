import { Router } from 'express';

export const collectionRouter = Router();

// TODO: keyingi fazada
collectionRouter.get('/points', (_req, res) => {
  res.json({ ok: true, data: { points: [] } });
});