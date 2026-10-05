import { prisma } from '../db/client.js';

export async function getScoreboard(teamId: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: { user: { select: { id: true, fullName: true } } },
        orderBy: { weeklyContribution: 'desc' },
      },
    },
  });

  if (!team) return null;

  const allTeams = await prisma.team.findMany({
    orderBy: { weeklyScore: 'desc' },
    select: { id: true },
  });

  const rank = allTeams.findIndex((t: { id: string }) => t.id === teamId) + 1;

  return {
    team: {
      id: team.id,
      name: team.name,
      type: team.type,
      city: team.city,
      captainId: team.captainId,
      memberCount: team.members.length,
      weeklyScore: team.weeklyScore,
      createdAt: team.createdAt.toISOString(),
    },
    members: team.members.map(
      (m: {
        userId: string;
        weeklyContribution: number;
        user: { id: string; fullName: string };
      }) => ({
        userId: m.userId,
        fullName: m.user.fullName,
        weeklyContribution: m.weeklyContribution,
      })
    ),
    rank,
  };
}