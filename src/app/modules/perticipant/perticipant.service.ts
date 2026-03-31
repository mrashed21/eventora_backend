import status from "http-status";
import api_error from "../../error-helper/api-error";
import { prisma } from "../../lib/prisma";

export const perticipant_service = {
  create: async (paylod: any) => {
    const { event_id, participant_id } = paylod;
    const event = await prisma.event.findUnique({
      where: {
        id: event_id,
      },
    });

    if (!event) {
      throw new api_error(status.NOT_FOUND, "Event not found");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: participant_id,
      },
    });

    if (!user) {
      throw new api_error(status.NOT_FOUND, "Participant not found");
    }

    const perticipant = await prisma.eventParticipant.create({
      data: {
        event_id,
        participant_id,
      },
    });
    return perticipant;
  },
};
