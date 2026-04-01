import status from "http-status";
import api_error from "../../error-helper/api-error";
import { prisma } from "../../lib/prisma";

export const payment_service = {
  // handle_checkout_completed: async (session: any) => {
  //   const event_id = session.metadata?.event_id;
  //   const user_id = session.metadata?.user_id;
  //   const payment_id = session.metadata?.payment_id;
  //   const is_private = session.metadata?.is_private;

  //   if (!event_id || !user_id || !payment_id) {
  //     throw new api_error(
  //       status.BAD_REQUEST,
  //       "Missing required Stripe metadata",
  //     );
  //   }

  //   const payment = await prisma.eventPayment.findUnique({
  //     where: { id: payment_id },
  //   });

  //   if (!payment) {
  //     throw new api_error(status.NOT_FOUND, "Payment record not found");
  //   }

  //   await prisma.eventPayment.update({
  //     where: { id: payment_id },
  //     data: {
  //       payment_status: "paid",
  //       stripe_payment_intent:
  //         typeof session.payment_intent === "string"
  //           ? session.payment_intent
  //           : null,
  //       stripe_session_id: session.id,
  //       paid_at: new Date(),
  //     },
  //   });

  //   const existingParticipant = await prisma.eventParticipant.findUnique({
  //     where: {
  //       unique_event_participant: {
  //         event_id,
  //         participant_id: user_id,
  //       },
  //     },
  //   });

  //   if (!existingParticipant) {
  //     const created = await prisma.eventParticipant.create({
  //       data: {
  //         event_id,
  //         participant_id: user_id,
  //         participation_status: is_private === "true" ? "pending" : "approved",
  //         payment_status: "paid",
  //         payment_id,
  //         requested_at: new Date(),
  //       },
  //     });
  //   } else {
  //     const updated = await prisma.eventParticipant.update({
  //       where: { id: existingParticipant.id },
  //       data: {
  //         payment_status: "paid",
  //         payment_id,
  //         participation_status: is_private === "true" ? "pending" : "approved",
  //       },
  //     });
  //   }
  // },

  handle_checkout_completed: async (session: any) => {
    const event_id = session.metadata?.event_id;
    const user_id = session.metadata?.user_id;
    const payment_id = session.metadata?.payment_id;
    const is_private = session.metadata?.is_private;
    const invitation_id = session.metadata?.invitation_id; 

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

    //!  Prevent duplicate webhook execution
    if (payment.payment_status === "paid") {
      console.log("⚠️ Payment already processed");
      return;
    }

    //! Transaction 
    await prisma.$transaction(async (tx) => {
      // 1. Update payment
      await tx.eventPayment.update({
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

      // 2. Check existing participant
      const existingParticipant = await tx.eventParticipant.findUnique({
        where: {
          unique_event_participant: {
            event_id,
            participant_id: user_id,
          },
        },
      });

      // 3. Create or update participant
      if (!existingParticipant) {
        await tx.eventParticipant.create({
          data: {
            event_id,
            participant_id: user_id,
            participation_status:
              is_private === "true" ? "pending" : "approved",
            payment_status: "paid",
            payment_id,
            requested_at: new Date(),
          },
        });
      } else {
        await tx.eventParticipant.update({
          where: { id: existingParticipant.id },
          data: {
            payment_status: "paid",
            payment_id,
            participation_status:
              is_private === "true" ? "pending" : "approved",
          },
        });
      }

      // 4. 🔥 Invitation flow handle (NEW)
      if (invitation_id) {
        await tx.invitation.update({
          where: { id: invitation_id },
          data: {
            status: "accepted",
            responded_at: new Date(),
            user_id: user_id,
          },
        });
      }
    });

    console.log("✅ Payment processed successfully");
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
