-- AlterTable
ALTER TABLE "blog_posts" ADD COLUMN     "summary_en" TEXT;

-- AlterTable
ALTER TABLE "instruments" ADD COLUMN     "name_en" TEXT,
ADD COLUMN     "purpose_en" TEXT;

-- AlterTable
ALTER TABLE "job_openings" ADD COLUMN     "description_en" TEXT,
ADD COLUMN     "title_en" TEXT;
