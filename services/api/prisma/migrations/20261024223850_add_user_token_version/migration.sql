/*
  Warnings:

  - A unique constraint covering the columns `[submissionId]` on the table `wallet_transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "tokenVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_submissionId_key" ON "wallet_transactions"("submissionId");
