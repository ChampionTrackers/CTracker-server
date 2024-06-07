-- AlterTable
ALTER TABLE "tb_match" ADD COLUMN     "mat_createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "mat_planned_start_time" DROP DEFAULT;
