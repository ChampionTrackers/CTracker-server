/*
  Warnings:

  - You are about to drop the column `mat_idmatch` on the `tb_guess` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `tb_guess` table. All the data in the column will be lost.
  - Added the required column `ts_idteamscore` to the `tb_guess` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tb_guess" DROP CONSTRAINT "tb_guess_mat_idmatch_fkey";

-- DropForeignKey
ALTER TABLE "tb_guess" DROP CONSTRAINT "tb_guess_teamId_fkey";

-- DropForeignKey
ALTER TABLE "tb_guess" DROP CONSTRAINT "tb_guess_user_iduser_fkey";

-- AlterTable
ALTER TABLE "tb_guess" DROP COLUMN "mat_idmatch",
DROP COLUMN "teamId",
ADD COLUMN     "ts_idteamscore" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "tb_guess" ADD CONSTRAINT "tb_guess_user_iduser_fkey" FOREIGN KEY ("user_iduser") REFERENCES "tb_user"("user_iduser") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_guess" ADD CONSTRAINT "tb_guess_ts_idteamscore_fkey" FOREIGN KEY ("ts_idteamscore") REFERENCES "tb_team_score"("ts_idteamscore") ON DELETE CASCADE ON UPDATE CASCADE;
