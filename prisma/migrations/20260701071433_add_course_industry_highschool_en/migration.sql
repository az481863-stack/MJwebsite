-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "name_en" TEXT,
ADD COLUMN     "outline_en" TEXT;

-- AlterTable
ALTER TABLE "highschool_messages" ADD COLUMN     "content_en" TEXT;

-- AlterTable
ALTER TABLE "industry_items" ADD COLUMN     "description_en" TEXT,
ADD COLUMN     "title_en" TEXT;
