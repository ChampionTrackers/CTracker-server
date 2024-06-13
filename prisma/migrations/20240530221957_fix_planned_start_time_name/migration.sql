/*
  Warnings:

  - You are about to drop the column `mat_planned_start_time` on the `tb_match` table. All the data in the column will be lost.
  - Added the required column `mat_plannedstarttime` to the `tb_match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tb_match" DROP COLUMN "mat_planned_start_time",
ADD COLUMN     "mat_plannedstarttime" TIMESTAMP(3) NOT NULL;
