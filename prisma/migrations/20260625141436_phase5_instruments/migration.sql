-- CreateEnum
CREATE TYPE "InstrumentStatus" AS ENUM ('NORMAL', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('BOOKED', 'CANCELLED', 'IN_USE', 'CHECKED_OUT', 'OVERDUE');

-- CreateEnum
CREATE TYPE "ConditionReport" AS ENUM ('NORMAL', 'UNSTABLE', 'BROKEN');

-- CreateTable
CREATE TABLE "instruments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "photo_url" TEXT,
    "status" "InstrumentStatus" NOT NULL DEFAULT 'NORMAL',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "instruments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instrument_managers" (
    "id" TEXT NOT NULL,
    "instrument_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,

    CONSTRAINT "instrument_managers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "instrument_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'BOOKED',
    "cancelled_at" TIMESTAMP(3),
    "checked_in_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkouts" (
    "id" TEXT NOT NULL,
    "reservation_id" TEXT NOT NULL,
    "hours" INTEGER NOT NULL,
    "condition" "ConditionReport" NOT NULL,
    "anomaly_note" TEXT,
    "by_member_id" TEXT NOT NULL,
    "is_proxy" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checkouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "instruments_deleted_at_idx" ON "instruments"("deleted_at");

-- CreateIndex
CREATE INDEX "instrument_managers_member_id_idx" ON "instrument_managers"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "instrument_managers_instrument_id_member_id_key" ON "instrument_managers"("instrument_id", "member_id");

-- CreateIndex
CREATE INDEX "reservations_instrument_id_start_at_idx" ON "reservations"("instrument_id", "start_at");

-- CreateIndex
CREATE INDEX "reservations_status_idx" ON "reservations"("status");

-- CreateIndex
CREATE INDEX "reservations_member_id_status_idx" ON "reservations"("member_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "checkouts_reservation_id_key" ON "checkouts"("reservation_id");

-- AddForeignKey
ALTER TABLE "instrument_managers" ADD CONSTRAINT "instrument_managers_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "instruments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instrument_managers" ADD CONSTRAINT "instrument_managers_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "instruments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkouts" ADD CONSTRAINT "checkouts_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
