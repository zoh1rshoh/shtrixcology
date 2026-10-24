-- CreateTable
CREATE TABLE "battles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "entry" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "rewards" JSONB NOT NULL DEFAULT '[]',
    "participants" JSONB NOT NULL DEFAULT '[]',
    "creatorUserId" TEXT NOT NULL,
    "creatorTeamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "battles_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "battles" ADD CONSTRAINT "battles_creatorUserId_fkey" FOREIGN KEY ("creatorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
