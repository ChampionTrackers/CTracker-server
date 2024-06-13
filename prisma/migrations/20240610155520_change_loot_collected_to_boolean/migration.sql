/*
  Warnings:

  - The `guess_lootCollected` column on the `tb_guess` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "tb_guess" DROP COLUMN "guess_lootCollected",
ADD COLUMN     "guess_lootCollected" BOOLEAN NOT NULL DEFAULT false;

-- DropEnum
DROP TYPE "GuessLootCollected";
