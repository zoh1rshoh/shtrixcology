
import { Prisma } from '@prisma/client';
import { prisma } from '../db/client.js';
import { AppError } from '../middleware/error.js';

const MAX_RETRIES = 3;

function isPrismaError(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === code
  );
}

export async function creditReward(
  userId: string,
  passportId: string,
  points: number,
) {
  if (!Number.isSafeInteger(points) || points <= 0) {
    throw new AppError(
      'INVALID_REWARD',
      'Mukofot ballari musbat butun son bo‘lishi kerak',
      400,
    );
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          // Faqat egasiga tegishli va tekshiruvdan o'tgan passport.
          const claimed = await tx.passport.updateMany({
            where: {
              id: passportId,
              userId,
              verifiedAt: { not: null },
              rewardedAt: null,
            },
            data: {
              rewardedAt: new Date(),
              rewardPoints: points,
            },
          });

          if (claimed.count !== 1) {
            throw new AppError(
              'REWARD_NOT_ALLOWED',
              'Passport topilmadi, tekshiruvdan o‘tmagan yoki mukofot avval berilgan',
              409,
            );
          }

          // Ledgerdagi barcha kirim-chiqimlar bo'yicha balans.
          const aggregate = await tx.walletTransaction.aggregate({
            where: { userId },
            _sum: { deltaPoints: true },
          });

          const currentBalance = aggregate._sum.deltaPoints ?? 0;
          const balanceAfter = currentBalance + points;

          if (!Number.isSafeInteger(balanceAfter) || balanceAfter < 0) {
            throw new AppError(
              'INVALID_BALANCE',
              'Balansni hisoblashda xatolik',
              409,
            );
          }

          return await tx.walletTransaction.create({
            data: {
              userId,
              deltaPoints: points,
              reason: 'submission_reward',
              submissionId: passportId,
              balanceAfter,
            },
          });
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error) {
      if (isPrismaError(error, 'P2002')) {
        throw new AppError(
          'DUPLICATE_REWARD',
          'Bu passport uchun mukofot avval berilgan',
          409,
        );
      }

      // Serializable tranzaksiyadagi parallel yozuvlar to'qnashuvi.
      if (isPrismaError(error, 'P2034') && attempt < MAX_RETRIES) {
        continue;
      }

      throw error;
    }
  }

  throw new AppError(
    'REWARD_RETRY_EXHAUSTED',
    'Mukofotni yozib bo‘lmadi, qayta urinib ko‘ring',
    409,
  );
}
