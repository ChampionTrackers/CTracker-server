/*
  Warnings:

  - The values [TEAM1_WIN,TEAM2_WIN] on the enum `GuessOutcome` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `guess_cost` to the `tb_guess` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guess_prediction` to the `tb_guess` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GuessPrediction" AS ENUM ('WIN', 'LOST');

-- CreateEnum
CREATE TYPE "GuessLootCollected" AS ENUM ('COLLECTED', 'NOT_COLLECTED', 'NONE');

-- CreateEnum
CREATE TYPE "TeamScoreStatus" AS ENUM ('NONE', 'WON', 'LOST', 'DRAW');

-- AlterEnum
BEGIN;
CREATE TYPE "GuessOutcome_new" AS ENUM ('PENDING', 'WIN', 'LOST', 'DRAW', 'CANCELLED');
ALTER TABLE "tb_guess" ALTER COLUMN "guess_outcome" TYPE "GuessOutcome_new" USING ("guess_outcome"::text::"GuessOutcome_new");
ALTER TYPE "GuessOutcome" RENAME TO "GuessOutcome_old";
ALTER TYPE "GuessOutcome_new" RENAME TO "GuessOutcome";
DROP TYPE "GuessOutcome_old";
COMMIT;

-- AlterTable
ALTER TABLE "tb_guess" ADD COLUMN     "guess_cost" INTEGER NOT NULL,
ADD COLUMN     "guess_createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "guess_lootCollected" "GuessLootCollected" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "guess_prediction" "GuessPrediction" NOT NULL;

-- AlterTable
ALTER TABLE "tb_match" ALTER COLUMN "mat_plannedstarttime" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "tb_team_score" ADD COLUMN     "ts_teamstatus" "TeamScoreStatus" NOT NULL DEFAULT 'NONE';
