/*
  Warnings:

  - You are about to drop the column `tc_points` on the `tb_team_championship` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mat_idmatch,team_idteam]` on the table `tb_team_score` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tb_team_championship" DROP COLUMN "tc_points";

-- CreateIndex
CREATE UNIQUE INDEX "tb_team_score_mat_idmatch_team_idteam_key" ON "tb_team_score"("mat_idmatch", "team_idteam");
