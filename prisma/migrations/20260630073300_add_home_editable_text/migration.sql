-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "home_hero_subtitle_en" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "home_hero_subtitle_zh" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "home_hero_title_en" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "home_hero_title_zh" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "home_philosophy_body_en" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "home_philosophy_body_zh" TEXT NOT NULL DEFAULT '';
