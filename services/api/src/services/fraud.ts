import { prisma } from '../db/client.js';

export async function checkVelocity(userId: string): Promise<boolean> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const count = await prisma.passport.count({
    where: { userId, createdAt: { gte: oneDayAgo } },
  });
  return count > 20; // 20+ per day = suspicious
}