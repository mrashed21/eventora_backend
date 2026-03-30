import status from "http-status";
import api_error from "../../error-helper/api-error";
import { prisma } from "../../lib/prisma";
import { sendEmail } from "../../utils/email";

export const invaitation_service = {
  create: async () => {
    //   create: async (payload: any) => {
    // const { event_id, email } = payload;
    const event_id = "019d3af2-2d80-778e-87c5-b6f7a8ba43f6";
    const email = "rashedclassicit@gmail.com";
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
};
invaitation_service.create();
