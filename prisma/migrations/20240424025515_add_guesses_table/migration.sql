/*
  Warnings:

  - You are about to drop the column `mat_date` on the `tb_match` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'RUNNING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "GuessOutcome" AS ENUM ('TEAM1_WIN', 'TEAM2_WIN', 'DRAW', 'CANCELLED');

-- AlterTable
ALTER TABLE "tb_match" DROP COLUMN "mat_date",
ADD COLUMN     "mat_planned_start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "mat_status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED';

-- CreateTable
CREATE TABLE "tb_guess" (
    "guess_id" SERIAL NOT NULL,
    "user_iduser" INTEGER NOT NULL,
    "mat_idmatch" INTEGER NOT NULL,
    "outcome" "GuessOutcome" NOT NULL,
    "teamId" INTEGER,

    CONSTRAINT "tb_guess_pkey" PRIMARY KEY ("guess_id")
);

-- AddForeignKey
ALTER TABLE "tb_guess" ADD CONSTRAINT "tb_guess_user_iduser_fkey" FOREIGN KEY ("user_iduser") REFERENCES "tb_user"("user_iduser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_guess" ADD CONSTRAINT "tb_guess_mat_idmatch_fkey" FOREIGN KEY ("mat_idmatch") REFERENCES "tb_match"("mat_idmatch") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_guess" ADD CONSTRAINT "tb_guess_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "tb_team"("team_idteam") ON DELETE SET NULL ON UPDATE CASCADE;
