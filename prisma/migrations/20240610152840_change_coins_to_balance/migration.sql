/*
  Warnings:

  - You are about to drop the column `user_coins` on the `tb_user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tb_user" DROP COLUMN "user_coins",
ADD COLUMN     "user_balance" INTEGER NOT NULL DEFAULT 100;
