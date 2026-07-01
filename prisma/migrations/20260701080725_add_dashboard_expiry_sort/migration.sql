-- AlterTable
ALTER TABLE "dashboard_posts" ADD COLUMN     "expires_at" TIMESTAMP(3),
ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0;

-- 既有資料回填:過期日 = 發布日 + 7 天
UPDATE "dashboard_posts" SET "expires_at" = "published_date" + INTERVAL '7 days' WHERE "expires_at" IS NULL;
