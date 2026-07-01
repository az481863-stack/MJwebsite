-- CreateTable
CREATE TABLE "chat_logs" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ip_blocks" (
    "ip" TEXT NOT NULL,
    "blocked" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ip_blocks_pkey" PRIMARY KEY ("ip")
);

-- CreateIndex
CREATE INDEX "chat_logs_ip_created_at_idx" ON "chat_logs"("ip", "created_at");

-- CreateIndex
CREATE INDEX "chat_logs_created_at_idx" ON "chat_logs"("created_at");
