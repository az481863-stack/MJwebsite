-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "DashboardCategory" AS ENUM ('ACADEMIC', 'LAB_LIFE', 'HONOR');

-- CreateEnum
CREATE TYPE "TeamTier" AS ENUM ('POSTDOC', 'PHD', 'MASTER', 'UNDERGRAD');

-- CreateEnum
CREATE TYPE "RecruitStatus" AS ENUM ('OPEN', 'FULL');

-- CreateEnum
CREATE TYPE "IndustryCategory" AS ENUM ('PATENT', 'LICENSABLE', 'COLLABORATION');

-- CreateTable
CREATE TABLE "dashboard_posts" (
    "id" TEXT NOT NULL,
    "category" "DashboardCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "image_url" TEXT,
    "link_url" TEXT,
    "link_text" TEXT,
    "published_date" TIMESTAMP(3) NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "dashboard_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publications" (
    "id" TEXT NOT NULL,
    "authors" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "doi_url" TEXT,
    "highlight" BOOLEAN NOT NULL DEFAULT false,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" "TeamTier" NOT NULL,
    "photo_url" TEXT,
    "research_topic" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alumni" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grad_year" INTEGER NOT NULL,
    "destination" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "alumni_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_openings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "recruit_status" "RecruitStatus" NOT NULL DEFAULT 'OPEN',
    "slots" INTEGER,
    "description" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "job_openings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "title_zh" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "summary" TEXT,
    "body_zh" JSONB NOT NULL,
    "body_en" JSONB NOT NULL,
    "cover_url" TEXT,
    "published_date" TIMESTAMP(3) NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "outline" TEXT NOT NULL,
    "handout_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industry_items" (
    "id" TEXT NOT NULL,
    "category" "IndustryCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "industry_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "highschool_messages" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "highschool_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "show_research" BOOLEAN NOT NULL DEFAULT true,
    "show_team" BOOLEAN NOT NULL DEFAULT true,
    "show_instruments" BOOLEAN NOT NULL DEFAULT false,
    "show_blog" BOOLEAN NOT NULL DEFAULT true,
    "show_contact" BOOLEAN NOT NULL DEFAULT true,
    "show_industry" BOOLEAN NOT NULL DEFAULT true,
    "show_highschool" BOOLEAN NOT NULL DEFAULT true,
    "instrument_max_hours" INTEGER NOT NULL DEFAULT 24,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dashboard_posts_status_deleted_at_idx" ON "dashboard_posts"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "publications_status_deleted_at_idx" ON "publications"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "team_members_status_deleted_at_idx" ON "team_members"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "alumni_status_deleted_at_idx" ON "alumni"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "job_openings_status_deleted_at_idx" ON "job_openings"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "blog_posts_status_deleted_at_idx" ON "blog_posts"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "courses_status_deleted_at_idx" ON "courses"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "industry_items_status_deleted_at_idx" ON "industry_items"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "highschool_messages_status_deleted_at_idx" ON "highschool_messages"("status", "deleted_at");
