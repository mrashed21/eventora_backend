/*
  Warnings:

  - You are about to drop the column `registered_at` on the `event_participants` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `event_participants` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "participation_status" AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('not_required', 'pending', 'paid', 'failed', 'refunded', 'cancelled');

-- CreateEnum
CREATE TYPE "payment_provider" AS ENUM ('stripe');

-- AlterTable
ALTER TABLE "event_participants" DROP COLUMN "registered_at",
ADD COLUMN     "approval_note" TEXT,
ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "cancelled_at" TIMESTAMP(3),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "joined_at" TIMESTAMP(3),
ADD COLUMN     "participation_status" "participation_status" NOT NULL DEFAULT 'pending',
ADD COLUMN     "payment_id" TEXT,
ADD COLUMN     "payment_status" "payment_status" NOT NULL DEFAULT 'not_required',
ADD COLUMN     "rejected_at" TIMESTAMP(3),
ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "stripe_payment_intent" TEXT,
ADD COLUMN     "stripe_session_id" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "event_payments" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "payment_status" "payment_status" NOT NULL DEFAULT 'pending',
    "payment_provider" "payment_provider" NOT NULL DEFAULT 'stripe',
    "stripe_session_id" TEXT,
    "stripe_payment_intent" TEXT,
    "stripe_charge_id" TEXT,
    "payment_method" TEXT,
    "paid_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "refund_amount" DOUBLE PRECISION,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_payments_stripe_session_id_key" ON "event_payments"("stripe_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_payments_stripe_payment_intent_key" ON "event_payments"("stripe_payment_intent");

-- CreateIndex
CREATE INDEX "idx_event_payment_event_id" ON "event_payments"("event_id");

-- CreateIndex
CREATE INDEX "idx_event_payment_user_id" ON "event_payments"("user_id");

-- CreateIndex
CREATE INDEX "idx_event_payment_status" ON "event_payments"("payment_status");

-- CreateIndex
CREATE INDEX "idx_event_participant_status" ON "event_participants"("participation_status");

-- CreateIndex
CREATE INDEX "idx_event_participant_payment_status" ON "event_participants"("payment_status");

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "event_payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_payments" ADD CONSTRAINT "event_payments_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_payments" ADD CONSTRAINT "event_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
