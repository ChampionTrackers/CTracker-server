/*
  Warnings:

  - You are about to drop the column `outcome` on the `tb_guess` table. All the data in the column will be lost.
  - Added the required column `guess_outcome` to the `tb_guess` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tb_guess" DROP COLUMN "outcome",
ADD COLUMN     "guess_outcome" "GuessOutcome" NOT NULL;
