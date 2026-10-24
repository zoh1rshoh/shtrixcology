/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `user_settings` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user_settings" ADD COLUMN     "username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_username_key" ON "user_settings"("username");
