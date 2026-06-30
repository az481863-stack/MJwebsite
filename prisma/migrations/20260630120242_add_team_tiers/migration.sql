-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TeamTier" ADD VALUE 'PROFESSOR';
ALTER TYPE "TeamTier" ADD VALUE 'DISTINGUISHED_PROFESSOR';
ALTER TYPE "TeamTier" ADD VALUE 'EMERITUS_PROFESSOR';
ALTER TYPE "TeamTier" ADD VALUE 'ASSOC_PROFESSOR';
ALTER TYPE "TeamTier" ADD VALUE 'ASST_PROFESSOR';
ALTER TYPE "TeamTier" ADD VALUE 'VISITING_PROFESSOR';
ALTER TYPE "TeamTier" ADD VALUE 'ADJUNCT_PROFESSOR';
ALTER TYPE "TeamTier" ADD VALUE 'STAFF';
