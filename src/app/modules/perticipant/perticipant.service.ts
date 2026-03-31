import status from "http-status";
import { config } from "../../config/config";
import { stripe } from "../../config/stripe";
import api_error from "../../error-helper/api-error";
import { prisma } from "../../lib/prisma";
import { calculatePagination } from "../../utils/pagination";

export const participant_service = {
  register: async (payload: any) => {
    const { event_id, user_id } = payload;

    const event = await prisma.event.findUnique({
      where: { id: event_id },
      include: {
        category: true,
      },
    });

    if (!event) {
      throw new api_error(status.NOT_FOUND, "Event not found");
    }

    const user = await prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      throw new api_error(status.NOT_FOUND, "User not found");
    }

    if (new Date(event.event_date) < new Date()) {
      throw new api_error(status.BAD_REQUEST, "Event already ended");
    }

    //! prevent duplicate
    const existing = await prisma.eventParticipant.findUnique({
      where: {
        unique_event_participant: {
          event_id,
          participant_id: user.id,
        },
      },
    });

    if (existing) {
      throw new api_error(
        status.BAD_REQUEST,
        "You already registered/requested",
      );
    }

    const isPrivate = event.category.category_type === "private";
    const isPaid =
      event.category.is_paid || Number(event.registration_fee || 0) > 0;

    //! FREE EVENT
    if (!isPaid) {
      const participant = await prisma.eventParticipant.create({
        data: {
          event_id,
          participant_id: user.id,
          participation_status: isPrivate ? "pending" : "approved",
          payment_status: "not_required",
          requested_at: new Date(),
          approved_at: !isPrivate ? new Date() : null,
          joined_at: !isPrivate ? new Date() : null,
        },
      });

      return {
        requiresPayment: false,
        action: isPrivate ? "request_join" : "direct_join",
        participant,
      };
    }

    //! PAID EVENT

    const amount = Number(event.registration_fee || 0);

    if (!amount) {
      throw new api_error(status.BAD_REQUEST, "Invalid fee");
    }

    const payment = await prisma.eventPayment.create({
      data: {
        event_id,
        user_id: user.id,
        amount,
        currency: "usd",
        payment_status: "pending",
        payment_provider: "stripe",
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
        event_id,
        user_id: user.id,
        payment_id: payment.id,
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
      action: isPrivate ? "pay_and_request" : "pay_and_join",
      checkoutUrl: session.url,
    };
  },

  get_my_participations: async (user_id: string) => {
    const result = await prisma.eventParticipant.findMany({
      where: {
        participant_id: user_id,
      },
      include: {
        event: {
          include: {
            category: true,
            organizer: true,
          },
        },
        payment: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return result;
  },

  get_my_participation_status: async (event_id: string, user_id: string) => {
    const result = await prisma.eventParticipant.findUnique({
      where: {
        unique_event_participant: {
          event_id,
          participant_id: user_id,
        },
      },
      include: {
        event: {
          include: {
            category: true,
            organizer: true,
          },
        },
        payment: true,
      },
    });

    return result;
  },

  get_pending_participants: async (query: any, user_id: string) => {
    const { page, limit } = query;
    const {
      skip,
      limit: take,
      sortBy,
      sortOrder,
    } = calculatePagination({
      page,
      limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    const organizer = await prisma.organizer.findUnique({
      where: { user_id: user_id },
    });

    if (!organizer) {
      throw new api_error(status.NOT_FOUND, "Organizer not found");
    }
    const event = await prisma.event.findMany({
      where: { organizer_id: organizer.id },
    });

    if (!event) {
      throw new api_error(status.NOT_FOUND, "Event not found");
    }

    const [data, total] = await Promise.all([
      prisma.eventParticipant.findMany({
        where: {
          event_id: { in: event.map((e) => e.id) },
          participation_status: "pending",
        },
        skip,
        take,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          user: true,
          payment: true,
          event: true,
        },
      }),
      prisma.eventParticipant.count({
        where: {
          event_id: { in: event.map((e) => e.id) },
          participation_status: "pending",
        },
      }),
    ]);

    return {
      meta: {
        page: Number(page) || 1,
        limit: take,
        total,
        totalPage: Math.ceil(total / take),
      },
      data,
    };
  },

  approve_participant: async (
    event_id: string,
    participant_id: string,
    user_id: string,
    note?: string,
  ) => {
    const event = await prisma.event.findUnique({
      where: { id: event_id },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!event) {
      throw new api_error(status.NOT_FOUND, "Event not found");
    }

    if (event.userId !== user_id) {
      throw new api_error(
        status.FORBIDDEN,
        "You are not allowed to approve participants for this event",
      );
    }

    const participant = await prisma.eventParticipant.findUnique({
      where: {
        unique_event_participant: {
          event_id,
          participant_id,
        },
      },
    });

    if (!participant) {
      throw new api_error(status.NOT_FOUND, "Participant not found");
    }

    if (participant.participation_status === "approved") {
      throw new api_error(status.BAD_REQUEST, "Participant already approved");
    }

    const result = await prisma.eventParticipant.update({
      where: {
        unique_event_participant: {
          event_id,
          participant_id,
        },
      },
      data: {
        participation_status: "approved",
        approval_note: note,
        approved_at: new Date(),
        joined_at: new Date(),
      },
      include: {
        user: true,
        event: true,
        payment: true,
      },
    });

    return result;
  },

  reject_participant: async (
    event_id: string,
    participant_id: string,
    user_id: string,
    reason?: string,
  ) => {
    const event = await prisma.event.findUnique({
      where: { id: event_id },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!event) {
      throw new api_error(status.NOT_FOUND, "Event not found");
    }

    if (event.userId !== user_id) {
      throw new api_error(
        status.FORBIDDEN,
        "You are not allowed to reject participants for this event",
      );
    }

    const participant = await prisma.eventParticipant.findUnique({
      where: {
        unique_event_participant: {
          event_id,
          participant_id,
        },
      },
    });

    if (!participant) {
      throw new api_error(status.NOT_FOUND, "Participant not found");
    }

    if (participant.participation_status === "rejected") {
      throw new api_error(status.BAD_REQUEST, "Participant already rejected");
    }

    const result = await prisma.eventParticipant.update({
      where: {
        unique_event_participant: {
          event_id,
          participant_id,
        },
      },
      data: {
        participation_status: "rejected",
        rejection_reason: reason,
        rejected_at: new Date(),
      },
      include: {
        user: true,
        event: true,
        payment: true,
      },
    });

    return result;
  },
};
