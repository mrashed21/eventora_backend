import status from "http-status";
import api_error from "../../error-helper/api-error";
import { prisma } from "../../lib/prisma";

export const payment_service = {
  handle_checkout_completed: async (session: any) => {
    const event_id = session.metadata?.event_id;
    const user_id = session.metadata?.user_id;
    const payment_id = session.metadata?.payment_id;
    const is_private = session.metadata?.is_private;

    if (!event_id || !user_id || !payment_id) {
      throw new api_error(
        status.BAD_REQUEST,
        "Missing required Stripe metadata",
      );
    }

    const payment = await prisma.eventPayment.findUnique({
      where: { id: payment_id },
    });

    if (!payment) {
      throw new api_error(status.NOT_FOUND, "Payment record not found");
    }

    await prisma.eventPayment.update({
      where: { id: payment_id },
      data: {
        payment_status: "paid",
        stripe_payment_intent:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
        stripe_session_id: session.id,
        paid_at: new Date(),
      },
    });

    const existingParticipant = await prisma.eventParticipant.findUnique({
      where: {
        unique_event_participant: {
          event_id,
          participant_id: user_id,
        },
      },
    });

    if (!existingParticipant) {
      const created = await prisma.eventParticipant.create({
        data: {
          event_id,
          participant_id: user_id,
          participation_status: is_private === "true" ? "pending" : "approved",
          payment_status: "paid",
          payment_id,
          requested_at: new Date(),
        },
      });
    } else {
      const updated = await prisma.eventParticipant.update({
        where: { id: existingParticipant.id },
        data: {
          payment_status: "paid",
          payment_id,
          participation_status: is_private === "true" ? "pending" : "approved",
        },
      });
    }
  },

  handle_checkout_expired: async (session: any) => {
    const payment_id = session.metadata?.payment_id;

    if (!payment_id) {
      console.log("No payment_id found in expired session");
      return;
    }

    await prisma.eventPayment.update({
      where: { id: payment_id },
      data: {
        payment_status: "cancelled",
      },
    });
  },
};
