/*
  Warnings:

  - You are about to drop the column `guess_prediction` on the `tb_guess` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tb_guess" DROP COLUMN "guess_prediction",
ALTER COLUMN "guess_outcome" SET DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "GuessPrediction";
