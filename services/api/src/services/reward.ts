import { prisma } from '../db/client.js';

export async function creditReward(userId: string, passportId: string, points: number) {
  const last = await prisma.walletTransaction.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const balanceAfter = (last?.balanceAfter ?? 0) + points;

  return prisma.walletTransaction.create({
    data: {
      userId,
      deltaPoints: points,
      reason: 'submission_reward',
      submissionId: passportId,
      balanceAfter,
    },
  });
}