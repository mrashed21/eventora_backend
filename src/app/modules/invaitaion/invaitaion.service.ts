import status from "http-status";
import { config } from "../../config/config";
import { stripe } from "../../config/stripe";
import api_error from "../../error-helper/api-error";
import { prisma } from "../../lib/prisma";
import { sendEmail } from "../../utils/email";

export const invaitation_service = {
  // ! create invitation by event owner
  create: async (payload: any) => {
    const { event_id, email, user_id } = payload;

    if (!event_id || !email) {
      throw new api_error(
        status.BAD_REQUEST,
        "event_id and email are required",
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: event_id },
      include: {
        category: true,
        organizer: true,
      },
    });

    if (!event) {
      throw new api_error(status.NOT_FOUND, "Event not found");
    }

    if (event.userId !== user_id) {
      throw new api_error(
        status.FORBIDDEN,
        "You are not allowed to invite users",
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser?.id === user_id) {
      throw new api_error(
        status.BAD_REQUEST,
        "You cannot invite yourself to your own event",
      );
    }

    const existingParticipant = existingUser
      ? await prisma.eventParticipant.findUnique({
          where: {
            unique_event_participant: {
              event_id,
              participant_id: existingUser.id,
            },
          },
        })
      : null;

    if (existingParticipant) {
      throw new api_error(status.BAD_REQUEST, "User already joined/requested");
    }

    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        event_id,
        email,
        status: "pending",
      },
    });

    if (existingInvitation) {
      throw new api_error(status.BAD_REQUEST, "Invitation already sent");
    }

    const invitation = await prisma.invitation.create({
      data: {
        event_id,
        email,
        user_id: existingUser?.id || null,
        invited_by: user_id,
      },
      include: {
        event: true,
        user: true,
      },
    });

    await sendEmail({
      to: email,
      subject: "You're invited to an event",
      templateName: "invaitaion",
      templateData: {
        eventName: event.event_title,
        eventDate: event.event_date,
        eventLocation: event.event_venue,
        eventFee: event.registration_fee,
        inviteLink: `${config.FRONTEND_URL}/invitations`,
        email,
      },
    });

    return invitation;
  },
  // ! receiver side - get my invitations (both email and registered user)
  get_my_invitations: async (user_id: string) => {
    const user = await prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      throw new api_error(status.NOT_FOUND, "User not found");
    }

    const result = await prisma.invitation.findMany({
      where: {
        OR: [{ user_id: user_id }, { email: user.email }],
      },
      include: {
        event: {
          include: {
            category: true,
            organizer: true,
          },
        },
        user: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return result;
  },
  // ! sender side - get sent invitations
  get_sent_invitations: async (user_id: string) => {
    const result = await prisma.invitation.findMany({
      where: {
        invited_by: user_id,
      },
      include: {
        event: {
          include: {
            category: true,
            organizer: true,
          },
        },
        user: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return result;
  },
  // ! owner side - get specific event invitations
  get_event_invitations: async (event_id: string, user_id: string) => {
    const event = await prisma.event.findUnique({
      where: { id: event_id },
    });

    if (!event) {
      throw new api_error(status.NOT_FOUND, "Event not found");
    }

    if (event.userId !== user_id) {
      throw new api_error(status.FORBIDDEN, "Unauthorized");
    }

    return await prisma.invitation.findMany({
      where: {
        event_id,
      },
      include: {
        user: true,
        event: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
  },
  // ! receiver side - accept / reject invitation
  respond: async (payload: any) => {
    const { invitation_id, action, user_id } = payload;

    if (!invitation_id || !action) {
      throw new api_error(
        status.BAD_REQUEST,
        "invitation_id and action are required",
      );
    }

    if (!["ACCEPT", "REJECT"].includes(action)) {
      throw new api_error(status.BAD_REQUEST, "Invalid action");
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: invitation_id },
      include: {
        event: {
          include: {
            category: true,
            organizer: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new api_error(status.NOT_FOUND, "Invitation not found");
    }

    const user = await prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      throw new api_error(status.NOT_FOUND, "User not found");
    }

    // Only invited user can respond
    if (invitation.email !== user.email && invitation.user_id !== user_id) {
      throw new api_error(status.FORBIDDEN, "This invitation is not for you");
    }

    if (invitation.status !== "pending") {
      throw new api_error(status.BAD_REQUEST, "Invitation already responded");
    }
    // reject invitation
    if (action === "REJECT") {
      const rejected = await prisma.invitation.update({
        where: { id: invitation_id },
        data: {
          status: "rejected",
          responded_at: new Date(),
          user_id: user_id,
        },
        include: {
          event: true,
          user: true,
        },
      });

      return {
        requiresPayment: false,
        type: "REJECTED",
        invitation: rejected,
      };
    }

    const event = invitation.event;
    const isPrivate = event.category.category_type === "private";
    const isPaid =
      event.category.is_paid || Number(event.registration_fee || 0) > 0;

    const existingParticipant = await prisma.eventParticipant.findUnique({
      where: {
        unique_event_participant: {
          event_id: event.id,
          participant_id: user_id,
        },
      },
    });

    if (existingParticipant) {
      throw new api_error(status.BAD_REQUEST, "Already joined/requested");
    }

    // invitation accepted mark
    await prisma.invitation.update({
      where: { id: invitation_id },
      data: {
        status: "accepted",
        responded_at: new Date(),
        user_id: user_id,
      },
    });

    //  free event
    if (!isPaid) {
      const participant = await prisma.eventParticipant.create({
        data: {
          event_id: event.id,
          participant_id: user_id,
          participation_status: isPrivate ? "pending" : "approved",
          payment_status: "not_required",
          requested_at: new Date(),
        },
        include: {
          event: true,
          user: true,
          payment: true,
        },
      });

      return {
        requiresPayment: false,
        type: "FREE_ACCEPTED",
        action: isPrivate ? "accept_and_request" : "accept_and_join",
        participant,
      };
    }
    // paid event - create payment and return checkout url
    const amount = Number(event.registration_fee || 0);

    if (!amount) {
      throw new api_error(status.BAD_REQUEST, "Invalid registration fee");
    }

    const payment = await prisma.eventPayment.create({
      data: {
        event_id: event.id,
        user_id: user_id,
        amount,
        currency: "usd",
        payment_status: "pending",
        payment_provider: "stripe",
        metadata: {
          invitation_id,
          source: "invitation",
        },
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: event.event_title,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        event_id: event.id,
        user_id: user_id,
        payment_id: payment.id,
        invitation_id: invitation_id,
        source: "invitation",
        is_private: isPrivate ? "true" : "false",
      },
      success_url: `${config.FRONTEND_URL}/payment/success`,
      cancel_url: `${config.FRONTEND_URL}/payment/cancel`,
    });

    await prisma.eventPayment.update({
      where: { id: payment.id },
      data: {
        stripe_session_id: session.id,
      },
    });

    return {
      requiresPayment: true,
      type: "PAID_ACCEPTED",
      action: isPrivate ? "accept_and_pay_request" : "accept_and_pay_join",
      checkoutUrl: session.url,
      payment_id: payment.id,
      invitation_id,
    };
  },
};
