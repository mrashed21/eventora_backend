/*
  Warnings:

  - The values [cancelled] on the enum `event_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `category_id` on the `Event` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "event_type" AS ENUM ('public', 'private');

-- AlterEnum
BEGIN;
CREATE TYPE "event_status_new" AS ENUM ('active', 'in_active');
ALTER TABLE "public"."Event" ALTER COLUMN "event_status" DROP DEFAULT;
ALTER TABLE "Event" ALTER COLUMN "event_status" TYPE "event_status_new" USING ("event_status"::text::"event_status_new");
ALTER TYPE "event_status" RENAME TO "event_status_old";
ALTER TYPE "event_status_new" RENAME TO "event_status";
DROP TYPE "public"."event_status_old";
ALTER TABLE "Event" ALTER COLUMN "event_status" SET DEFAULT 'active';
COMMIT;

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_category_id_fkey";

-- DropIndex
DROP INDEX "idx_event_category_id";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "category_id",
ADD COLUMN     "event_type" "event_type" NOT NULL DEFAULT 'public',
ADD COLUMN     "is_paid" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "idx_event_venue" ON "Event"("event_venue");

-- CreateIndex
CREATE INDEX "idx_event_is_paid" ON "Event"("is_paid");

-- CreateIndex
CREATE INDEX "idx_event_type" ON "Event"("event_type");
