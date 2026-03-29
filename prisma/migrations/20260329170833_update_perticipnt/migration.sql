-- DropForeignKey
ALTER TABLE "event_participants" DROP CONSTRAINT "event_participants_participant_id_fkey";

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
