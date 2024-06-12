/*
  Warnings:

  - The primary key for the `tb_guess` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `guess_cost` on the `tb_guess` table. All the data in the column will be lost.
  - You are about to drop the column `guess_createdAt` on the `tb_guess` table. All the data in the column will be lost.
  - You are about to drop the column `guess_id` on the `tb_guess` table. All the data in the column will be lost.
  - You are about to drop the column `guess_lootCollected` on the `tb_guess` table. All the data in the column will be lost.
  - You are about to drop the column `guess_outcome` on the `tb_guess` table. All the data in the column will be lost.
  - Added the required column `ges_cost` to the `tb_guess` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tb_team_score" DROP CONSTRAINT "tb_team_score_mat_idmatch_fkey";

-- DropForeignKey
ALTER TABLE "tb_team_score" DROP CONSTRAINT "tb_team_score_team_idteam_fkey";

-- AlterTable
ALTER TABLE "tb_guess" DROP CONSTRAINT "tb_guess_pkey",
DROP COLUMN "guess_cost",
DROP COLUMN "guess_createdAt",
DROP COLUMN "guess_id",
DROP COLUMN "guess_lootCollected",
DROP COLUMN "guess_outcome",
ADD COLUMN     "ges_cost" INTEGER NOT NULL,
ADD COLUMN     "ges_createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ges_idguess" SERIAL NOT NULL,
ADD COLUMN     "ges_lootCollected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ges_outcome" "GuessOutcome" NOT NULL DEFAULT 'PENDING',
ADD CONSTRAINT "tb_guess_pkey" PRIMARY KEY ("ges_idguess");

-- CreateTable
CREATE TABLE "tb_user_following_championship" (
    "user_iduser" INTEGER NOT NULL,
    "cha_idchampionship" INTEGER NOT NULL,
    "ufc_createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "tb_user_following_team" (
    "user_iduser" INTEGER NOT NULL,
    "team_idteam" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "tb_championship_comments" (
    "cc_idcomment" SERIAL NOT NULL,
    "user_iduser" INTEGER NOT NULL,
    "cha_idchampionship" INTEGER NOT NULL,
    "cc_comment" TEXT NOT NULL,
    "cc_createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_championship_comments_pkey" PRIMARY KEY ("cc_idcomment")
);

-- CreateIndex
CREATE UNIQUE INDEX "tb_user_following_championship_user_iduser_cha_idchampionsh_key" ON "tb_user_following_championship"("user_iduser", "cha_idchampionship");

-- CreateIndex
CREATE UNIQUE INDEX "tb_user_following_team_user_iduser_team_idteam_key" ON "tb_user_following_team"("user_iduser", "team_idteam");

-- AddForeignKey
ALTER TABLE "tb_user_following_championship" ADD CONSTRAINT "tb_user_following_championship_user_iduser_fkey" FOREIGN KEY ("user_iduser") REFERENCES "tb_user"("user_iduser") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_user_following_championship" ADD CONSTRAINT "tb_user_following_championship_cha_idchampionship_fkey" FOREIGN KEY ("cha_idchampionship") REFERENCES "tb_championship"("cha_idchampionship") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_user_following_team" ADD CONSTRAINT "tb_user_following_team_user_iduser_fkey" FOREIGN KEY ("user_iduser") REFERENCES "tb_user"("user_iduser") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_user_following_team" ADD CONSTRAINT "tb_user_following_team_team_idteam_fkey" FOREIGN KEY ("team_idteam") REFERENCES "tb_team"("team_idteam") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_championship_comments" ADD CONSTRAINT "tb_championship_comments_user_iduser_fkey" FOREIGN KEY ("user_iduser") REFERENCES "tb_user"("user_iduser") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_championship_comments" ADD CONSTRAINT "tb_championship_comments_cha_idchampionship_fkey" FOREIGN KEY ("cha_idchampionship") REFERENCES "tb_championship"("cha_idchampionship") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_team_score" ADD CONSTRAINT "tb_team_score_team_idteam_fkey" FOREIGN KEY ("team_idteam") REFERENCES "tb_team"("team_idteam") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_team_score" ADD CONSTRAINT "tb_team_score_mat_idmatch_fkey" FOREIGN KEY ("mat_idmatch") REFERENCES "tb_match"("mat_idmatch") ON DELETE CASCADE ON UPDATE CASCADE;
