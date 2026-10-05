import { Router } from 'express';
import { createTeamSchema, joinTeamSchema } from '@shtrixcology/shared';
import { prisma } from '../db/client.js';
import { getScoreboard } from '../services/team.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/error.js';

export const teamsRouter = Router();

teamsRouter.use(requireAuth);

teamsRouter.post('/', validate(createTeamSchema), async (req: AuthRequest, res, next) => {
  try {
    const team = await prisma.team.create({
      data: {
        name: req.body.name,
        type: req.body.type,
        city: req.body.city,
        captainId: req.userId!,
      },
    });
    await prisma.teamMember.create({
      data: { teamId: team.id, userId: req.userId!, role: 'captain' },
    });
    res.status(201).json({ ok: true, data: team });
  } catch (err) { next(err); }
});

teamsRouter.post('/join', validate(joinTeamSchema), async (req: AuthRequest, res, next) => {
  try {
    const team = await prisma.team.findUnique({ where: { id: req.body.teamId } });
    if (!team) throw new AppError('TEAM_NOT_FOUND', 'Team not found', 404);

    await prisma.teamMember.upsert({
      where: { teamId_userId: { teamId: team.id, userId: req.userId! } },
      update: {},
      create: { teamId: team.id, userId: req.userId!, role: 'member' },
    });
    res.json({ ok: true, data: team });
  } catch (err) { next(err); }
});

teamsRouter.get('/', async (_req, res, next) => {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { weeklyScore: 'desc' },
      take: 50,
    });
    res.json({ ok: true, data: teams });
  } catch (err) { next(err); }
});

teamsRouter.get('/:id', async (req, res, next) => {
  try {
    const scoreboard = await getScoreboard(req.params.id);
    if (!scoreboard) throw new AppError('TEAM_NOT_FOUND', 'Team not found', 404);
    res.json({ ok: true, data: scoreboard });
  } catch (err) { next(err); }
});