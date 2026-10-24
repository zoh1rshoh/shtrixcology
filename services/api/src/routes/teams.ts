import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/error.js';

export const teamsRouter = Router();
teamsRouter.use(requireAuth);

// ============================================
// GET /v1/teams — Leaderboard
// ============================================
teamsRouter.get('/', async (req, res, next) => {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { weeklyScore: 'desc' },
      take: 50,
      include: {
        _count: { select: { members: true } },
      },
    });

    const result = teams.map((t, idx) => ({
      id: t.id,
      name: t.name,
      type: t.type,
      city: t.city,
      weeklyScore: t.weeklyScore,
      memberCount: t._count.members,
      rank: idx + 1,
    }));

    res.json({ ok: true, data: { teams: result } });
  } catch (err) {
    next(err);
  }
});

// ============================================
// GET /v1/teams/me — Mening jamoam
// ============================================
teamsRouter.get('/me', async (req: AuthRequest, res, next) => {
  try {
    const member = await prisma.teamMember.findFirst({
      where: { userId: req.userId! },
      include: {
        team: {
          include: {
            _count: { select: { members: true } },
            members: {
              include: {
                user: { select: { id: true, fullName: true } },
              },
              orderBy: { weeklyContribution: 'desc' },
              take: 10,
            },
          },
        },
      },
    });

    if (!member) {
      return res.json({ ok: true, data: { team: null } });
    }

    const allTeams = await prisma.team.findMany({
      orderBy: { weeklyScore: 'desc' },
      select: { id: true },
    });
    const rank = allTeams.findIndex((t) => t.id === member.team.id) + 1;

    res.json({
      ok: true,
      data: {
        team: {
          id: member.team.id,
          name: member.team.name,
          type: member.team.type,
          city: member.team.city,
          weeklyScore: member.team.weeklyScore,
          memberCount: member.team._count.members,
          rank,
          myRole: member.role,
          myContribution: member.weeklyContribution,
          topMembers: member.team.members.map((m) => ({
            id: m.user.id,
            fullName: m.user.fullName,
            weeklyContribution: m.weeklyContribution,
          })),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// ============================================
// POST /v1/teams — Jamoa yaratish
// ============================================
const createTeamSchema = z.object({
  name: z.string().min(2).max(50),
  type: z.enum(['school', 'office', 'neighborhood', 'family', 'university']),
  city: z.string().min(2).max(50),
});

teamsRouter.post('/', validate(createTeamSchema), async (req: AuthRequest, res, next) => {
  try {
    // Bir foydalanuvchi bitta jamoada
    const existing = await prisma.teamMember.findFirst({
      where: { userId: req.userId! },
    });
    if (existing) {
      throw new AppError('ALREADY_IN_TEAM', 'Siz allaqachon jamoadasiz', 400);
    }

    const team = await prisma.team.create({
      data: {
        name: req.body.name,
        type: req.body.type,
        city: req.body.city,
        captainId: req.userId!,
      },
    });

    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: req.userId!,
        role: 'captain',
      },
    });

    res.status(201).json({
      ok: true,
      data: { team: { id: team.id, name: team.name } },
    });
  } catch (err) {
    next(err);
  }
});

// ============================================
// POST /v1/teams/join — Jamoaga qo'shilish
// ============================================
const joinSchema = z.object({ teamId: z.string().uuid() });

teamsRouter.post('/join', validate(joinSchema), async (req: AuthRequest, res, next) => {
  try {
    const existing = await prisma.teamMember.findFirst({
      where: { userId: req.userId! },
    });
    if (existing) {
      throw new AppError('ALREADY_IN_TEAM', 'Siz allaqachon jamoadasiz', 400);
    }

    const team = await prisma.team.findUnique({
      where: { id: req.body.teamId },
    });
    if (!team) {
      throw new AppError('TEAM_NOT_FOUND', 'Jamoa topilmadi', 404);
    }

    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: req.userId!,
        role: 'member',
      },
    });

    res.json({ ok: true, data: { team: { id: team.id, name: team.name } } });
  } catch (err) {
    next(err);
  }
});

// ============================================
// POST /v1/teams/leave — Jamoadan chiqish
// ============================================
teamsRouter.post('/leave', async (req: AuthRequest, res, next) => {
  try {
    await prisma.teamMember.deleteMany({
      where: { userId: req.userId! },
    });
    res.json({ ok: true, data: { success: true } });
  } catch (err) {
    next(err);
  }
});