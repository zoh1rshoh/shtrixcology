import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/error.js';

export const battlesRouter = Router();
battlesRouter.use(requireAuth);

const createSchema = z.object({
  title: z.string().min(2).max(100),
  type: z.string(),
  goal: z.string(),
  durationDays: z.number().int().positive().max(365),
  entry: z.string(),
  rewards: z.array(z.any()).default([]),
  participants: z.array(z.string()).default([]),
});

battlesRouter.post('/', validate(createSchema), async (req: AuthRequest, res, next) => {
  try {
    const member = await prisma.teamMember.findFirst({
      where: { userId: req.userId! },
    });

    const battle = await prisma.battle.create({
      data: {
        title: req.body.title,
        type: req.body.type,
        goal: req.body.goal,
        durationDays: req.body.durationDays,
        entry: req.body.entry,
        rewards: req.body.rewards,
        participants: req.body.participants,
        status: 'upcoming',
        creatorUserId: req.userId!,
        creatorTeamId: member?.teamId ?? null,
      },
    });

    res.status(201).json({ ok: true, data: { battle } });
  } catch (err) {
    next(err);
  }
});

battlesRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const filter = String(req.query.filter ?? 'all');

    const member = await prisma.teamMember.findFirst({
      where: { userId: req.userId! },
    });
    const myTeamId = member?.teamId;

    if (filter === 'my') {
      if (!myTeamId) return res.json({ ok: true, data: { battles: [] } });
      const all = await prisma.battle.findMany({ orderBy: { createdAt: 'desc' } });
      const mine = all.filter((b) => {
        const p = Array.isArray(b.participants) ? (b.participants as string[]) : [];
        return p.includes(myTeamId);
      });
      return res.json({ ok: true, data: { battles: mine } });
    }

    let where: any = {};
    if (filter === 'upcoming') where = { status: 'upcoming' };
    else if (filter === 'active') where = { status: 'active' };
    else if (filter === 'history') where = { status: 'finished' };
    else if (filter === 'discover') where = { status: 'upcoming', entry: 'open' };

    const battles = await prisma.battle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ ok: true, data: { battles } });
  } catch (err) {
    next(err);
  }
});

battlesRouter.post('/:id/join', async (req: AuthRequest, res, next) => {
  try {
    const id = String(req.params.id);
    const battle = await prisma.battle.findUnique({ where: { id } });
    if (!battle) throw new AppError('NOT_FOUND', 'Battle topilmadi', 404);

    const member = await prisma.teamMember.findFirst({
      where: { userId: req.userId! },
    });
    if (!member) throw new AppError('NO_TEAM', 'Avval jamoa yarating', 400);

    const participants = Array.isArray(battle.participants)
      ? (battle.participants as string[])
      : [];

    if (participants.includes(member.teamId)) {
      throw new AppError('ALREADY_JOINED', 'Siz allaqachon qatnashyapsiz', 400);
    }

    const updated = await prisma.battle.update({
      where: { id },
      data: { participants: [...participants, member.teamId] as any },
    });

    res.json({ ok: true, data: { battle: updated } });
  } catch (err) {
    next(err);
  }
});