import status from "http-status";
import api_error from "../../error-helper/api-error";
import { prisma } from "../../lib/prisma";
import { sendEmail } from "../../utils/email";

export const invaitation_service = {
  create: async (payload: any) => {
    const { event_id, email } = payload;

    const event = await prisma.event.findUnique({
      where: {
        id: event_id,
      },
    });

    if (!event) {
      throw new api_error(status.NOT_FOUND, "Event not found");
    }

    const invitation = await prisma.invitation.create({
      data: {
        event_id,
        email,
      },
    });
    if (invitation) {
      await sendEmail({
        to: email,
        subject: "You're invited to an event",
        templateName: "invaitaion",
        templateData: {
          eventName: event.event_title,
        },
      });

      console.log("invaitaion send");
      return invitation;
    }
  },

  update: async (payload: any) => {
    const { id, status } = payload;
    const invitation = await prisma.invitation.findUnique({
      where: {
        id,
      },
    });
    if (!invitation) {
      throw new api_error(status.NOT_FOUND, "Invitation not found");
    }

    const result = await prisma.invitation.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
    return result;
  },
  
};
