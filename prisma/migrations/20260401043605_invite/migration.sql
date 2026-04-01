-- AlterEnum
ALTER TYPE "invitation_status" ADD VALUE 'cancelled';

-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_event_id_fkey";

-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN     "invited_by" TEXT,
ADD COLUMN     "responded_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Invitation_event_id_idx" ON "Invitation"("event_id");

-- CreateIndex
CREATE INDEX "Invitation_email_idx" ON "Invitation"("email");

-- CreateIndex
CREATE INDEX "Invitation_user_id_idx" ON "Invitation"("user_id");

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
