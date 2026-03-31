/*
  Warnings:

  - You are about to drop the column `approval_note` on the `event_participants` table. All the data in the column will be lost.
  - You are about to drop the column `approved_at` on the `event_participants` table. All the data in the column will be lost.
  - You are about to drop the column `cancelled_at` on the `event_participants` table. All the data in the column will be lost.
  - You are about to drop the column `joined_at` on the `event_participants` table. All the data in the column will be lost.
  - You are about to drop the column `rejected_at` on the `event_participants` table. All the data in the column will be lost.
  - You are about to drop the column `rejection_reason` on the `event_participants` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "event_participants" DROP COLUMN "approval_note",
DROP COLUMN "approved_at",
DROP COLUMN "cancelled_at",
DROP COLUMN "joined_at",
DROP COLUMN "rejected_at",
DROP COLUMN "rejection_reason",
ADD COLUMN     "replay_note" TEXT;
