-- CreateEnum
CREATE TYPE "event_status" AS ENUM ('active', 'in_active', 'cancelled');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "event_status" "event_status" NOT NULL DEFAULT 'active';

-- CreateIndex
CREATE INDEX "idx_event_status" ON "Event"("event_status");
