-- AlterTable
ALTER TABLE "instruments" ADD COLUMN     "anomaly_cleared_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "name" TEXT;
