-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "home_research_areas_en" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "home_research_areas_zh" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "home_research_heading_en" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "home_research_heading_zh" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "home_research_intro_en" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "home_research_intro_zh" TEXT NOT NULL DEFAULT '';
