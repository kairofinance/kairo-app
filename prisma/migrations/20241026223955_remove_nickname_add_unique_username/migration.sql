/*
  Warnings:

  - You are about to drop the column `nickname` on the `Profile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "nickname";

-- CreateIndex
CREATE UNIQUE INDEX "Profile_username_key" ON "Profile"("username");
