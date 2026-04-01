import { status } from "http-status";

import api_error from "../../error-helper/api-error";
import { prisma } from "../../lib/prisma";
import { CreateReviewPayload, UpdateReviewPayload } from "./review.interface";

export const review_service = {
  create: async (userId: string, payload: CreateReviewPayload) => {
    const { eventId, rating, comment } = payload;

    // event exists?
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        participants: true, // assuming Event -> participants relation exists
      },
    });

    if (!event) {
      throw new api_error(status.NOT_FOUND, "Event not found");
    }

    // Optional: event must be completed / passed
    if (new Date(event.event_date) > new Date()) {
      throw new api_error(
        status.BAD_REQUEST,
        "You can review only after the event date",
      );
    }

    // user participated?
    const isParticipant = event.participants?.some(
      (p: any) => p.userId === userId && p.status === "APPROVED",
    );

    if (!isParticipant) {
      throw new api_error(
        status.FORBIDDEN,
        "You can only review events you joined",
      );
    }

    // already reviewed?
    const existingReview = await prisma.review.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existingReview) {
      throw new api_error(
        status.BAD_REQUEST,
        "You already reviewed this event",
      );
    }

    const result = await prisma.review.create({
      data: {
        eventId,
        userId,
        rating,
        comment,
      },
      include: {
        user: true,
        event: true,
      },
    });

    return result;
  },

  get_my_reviews: async (userId: string) => {
    const result = await prisma.review.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            event_title: true,
            event_image: true,
            event_date: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return result;
  },
  update_my_review: async (
    userId: string,
    reviewId: string,
    payload: UpdateReviewPayload,
  ) => {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new api_error(status.NOT_FOUND, "Review not found");
    }

    if (review.userId !== userId) {
      throw new api_error(
        status.FORBIDDEN,
        "You can only update your own review",
      );
    }

    const result = await prisma.review.update({
      where: { id: reviewId },
      data: payload,
      include: {
        user: true,
        event: true,
      },
    });

    return result;
  },

  delete_my_review: async (userId: string, reviewId: string) => {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new api_error(status.NOT_FOUND, "Review not found");
    }

    if (review.userId !== userId) {
      throw new api_error(
        status.FORBIDDEN,
        "You can only delete your own review",
      );
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return null;
  },

  get_reviews_by_event: async (eventId: string) => {
    const result = await prisma.review.findMany({
      where: { eventId },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = result.length;
    const avg =
      total > 0
        ? Number(
            (
              result.reduce((sum, item) => sum + item.rating, 0) / total
            ).toFixed(1),
          )
        : 0;

    return {
      total,
      averageRating: avg,
      reviews: result,
    };
  },

  get_owner_event_reviews: async (ownerId: string, eventId: string) => {
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        userId: ownerId,
      },
    });

    if (!event) {
      throw new api_error(
        status.FORBIDDEN,
        "You are not authorized to view these reviews",
      );
    }

    const reviews = await prisma.review.findMany({
      where: { eventId },
      include: {
        user: true,
        event: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return reviews;
  },

  get_owner_all_event_reviews: async (ownerId: string) => {
    const reviews = await prisma.review.findMany({
      where: {
        event: {
          userId: ownerId,
        },
      },
      include: {
        user: true,
        event: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return reviews;
  },

  get_all_reviews_admin: async () => {
    const result = await prisma.review.findMany({
      include: {
        user: true,
        event: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return result;
  },

  delete_review_admin: async (reviewId: string) => {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new api_error(status.NOT_FOUND, "Review not found");
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return null;
  },
};
