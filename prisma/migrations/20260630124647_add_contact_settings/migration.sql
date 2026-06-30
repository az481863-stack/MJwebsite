-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "contact_address_en" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "contact_address_zh" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "contact_email" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "contact_lab_name_en" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "contact_lab_name_zh" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "contact_office_hours_en" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "contact_office_hours_zh" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "contact_phone" TEXT NOT NULL DEFAULT '';
