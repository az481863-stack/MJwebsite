-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "checkout_reminder_sent_at" TIMESTAMP(3),
ADD COLUMN     "reminder_sent_at" TIMESTAMP(3);
