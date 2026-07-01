-- CreateTable
CREATE TABLE "rate_hits" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rate_hits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rate_hits_scope_ip_created_at_idx" ON "rate_hits"("scope", "ip", "created_at");
