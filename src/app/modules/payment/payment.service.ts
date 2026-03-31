// import status from "http-status";
// import api_error from "../../error-helper/api-error";
// import { prisma } from "../../lib/prisma";

// export const payment_service = {
//   handle_checkout_completed: async (session: any) => {
//     console.log("Stripe checkout.session.completed =>", {
//       id: session.id,
//       payment_intent: session.payment_intent,
//       metadata: session.metadata,
//     });

//     const event_id = session.metadata?.event_id;
//     const user_id = session.metadata?.user_id;
//     const payment_id = session.metadata?.payment_id;
//     const is_private = session.metadata?.is_private;

//     if (!event_id || !user_id || !payment_id) {
//       console.error("Missing Stripe metadata:", session.metadata);
//       throw new api_error(
//         status.BAD_REQUEST,
//         "Missing required Stripe metadata",
//       );
//     }

//     await prisma.$transaction(async (tx) => {
//       const payment = await tx.eventPayment.findUnique({
//         where: { id: payment_id },
//       });

//       if (!payment) {
//         throw new api_error(status.NOT_FOUND, "Payment record not found");
//       }

//       // payment update
//       await tx.eventPayment.update({
//         where: { id: payment_id },
//         data: {
//           payment_status: "paid",
//           stripe_payment_intent:
//             typeof session.payment_intent === "string"
//               ? session.payment_intent
//               : null,
//           stripe_session_id: session.id,
//           paid_at: new Date(),
//         },
//       });

//       const existingParticipant = await tx.eventParticipant.findUnique({
//         where: {
//           unique_event_participant: {
//             event_id,
//             participant_id: user_id,
//           },
//         },
//       });

//       if (!existingParticipant) {
//         await tx.eventParticipant.create({
//           data: {
//             event_id,
//             participant_id: user_id,
//             participation_status:
//               is_private === "true" ? "pending" : "approved",
//             payment_status: "paid",
//             payment_id,
//             stripe_session_id: session.id,
//             stripe_payment_intent:
//               typeof session.payment_intent === "string"
//                 ? session.payment_intent
//                 : null,
//             requested_at: new Date(),
//             approved_at: is_private !== "true" ? new Date() : null,
//             joined_at: is_private !== "true" ? new Date() : null,
//           },
//         });

//         console.log("Participant created successfully");
//       } else {
//         await tx.eventParticipant.update({
//           where: { id: existingParticipant.id },
//           data: {
//             payment_status: "paid",
//             payment_id,
//             stripe_session_id: session.id,
//             stripe_payment_intent:
//               typeof session.payment_intent === "string"
//                 ? session.payment_intent
//                 : null,
//             participation_status:
//               is_private === "true" ? "pending" : "approved",
//             approved_at:
//               is_private !== "true"
//                 ? existingParticipant.approved_at || new Date()
//                 : existingParticipant.approved_at,
//             joined_at:
//               is_private !== "true"
//                 ? existingParticipant.joined_at || new Date()
//                 : existingParticipant.joined_at,
//           },
//         });

//         console.log("Existing participant updated successfully");
//       }
//     });
//   },

//   handle_checkout_expired: async (session: any) => {
//     const payment_id = session.metadata?.payment_id;

//     if (!payment_id) return;

//     await prisma.eventPayment.update({
//       where: { id: payment_id },
//       data: {
//         payment_status: "cancelled",
//       },
//     });

//     console.log("Stripe checkout.session.expired => payment cancelled");
//   },
// };
import status from "http-status";
import api_error from "../../error-helper/api-error";
import { prisma } from "../../lib/prisma";

export const payment_service = {
  handle_checkout_completed: async (session: any) => {
    console.log("📦 SESSION OBJECT RECEIVED");
    console.log("SESSION ID:", session.id);
    console.log("PAYMENT STATUS:", session.payment_status);
    console.log("PAYMENT INTENT:", session.payment_intent);
    console.log("METADATA:", session.metadata);

    const event_id = session.metadata?.event_id;
    const user_id = session.metadata?.user_id;
    const payment_id = session.metadata?.payment_id;
    const is_private = session.metadata?.is_private;

    console.log("🔎 Extracted metadata =>", {
      event_id,
      user_id,
      payment_id,
      is_private,
    });

    if (!event_id || !user_id || !payment_id) {
      console.error("❌ Missing required Stripe metadata:", session.metadata);
      throw new api_error(
        status.BAD_REQUEST,
        "Missing required Stripe metadata",
      );
    }

    // 1) payment exists?
    const payment = await prisma.eventPayment.findUnique({
      where: { id: payment_id },
    });

    console.log("💳 Payment row found:", payment);

    if (!payment) {
      throw new api_error(status.NOT_FOUND, "Payment record not found");
    }

    // 2) already processed? (idempotency guard)
    if (payment.payment_status === "paid") {
      console.log("⚠️ Payment already processed, skipping duplicate webhook");
      return;
    }

    // 3) update payment
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

    console.log("✅ Payment updated successfully");

    // 4) check participant
    const existingParticipant = await prisma.eventParticipant.findUnique({
      where: {
        unique_event_participant: {
          event_id,
          participant_id: user_id,
        },
      },
    });

    console.log("👤 Existing participant:", existingParticipant);

    // 5) create or update participant
    if (!existingParticipant) {
      const created = await prisma.eventParticipant.create({
        data: {
          event_id,
          participant_id: user_id,
          participation_status: is_private === "true" ? "pending" : "approved",
          payment_status: "paid",
          payment_id,
          requested_at: new Date(),
          approved_at: is_private !== "true" ? new Date() : null,
          joined_at: is_private !== "true" ? new Date() : null,
        },
      });

      console.log("✅ Participant created successfully:", created.id);
    } else {
      const updated = await prisma.eventParticipant.update({
        where: { id: existingParticipant.id },
        data: {
          payment_status: "paid",
          payment_id,
          participation_status: is_private === "true" ? "pending" : "approved",
          approved_at:
            is_private !== "true"
              ? existingParticipant.approved_at || new Date()
              : existingParticipant.approved_at,
          joined_at:
            is_private !== "true"
              ? existingParticipant.joined_at || new Date()
              : existingParticipant.joined_at,
        },
      });

      console.log("✅ Existing participant updated successfully:", updated.id);
    }
  },

  handle_checkout_expired: async (session: any) => {
    console.log("⚠️ Expired session metadata:", session.metadata);

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

    console.log("✅ Expired payment marked cancelled");
  },
};
