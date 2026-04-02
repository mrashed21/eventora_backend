import { prisma } from "../../lib/prisma";

export const stats_service = {
  // admin stats
  admin: async () => {
    // total users ,events, reviews, average rating, total revenue,  event this month, revenue this month, perticipant this month todays events, todays revenue, todays participants
    const totalUsers = await prisma.user.count();
    const totalEvents = await prisma.event.count();
    const totalReviews = await prisma.review.count();
    const averageRating = await prisma.review.aggregate({
      _avg: {
        rating: true,
      },
    });
    const totalRevenue = await prisma.eventPayment.aggregate({
      _sum: {
        amount: true,
      },
    });
    const eventThisMonth = await prisma.event.count({
      where: {
        created_at: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        },
      },
    });
    const revenueThisMonth = await prisma.eventPayment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        created_at: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        },
      },
    });
    const participantThisMonth = await prisma.eventParticipant.count({
      where: {
        created_at: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        },
      },
    });
    const todaysEvents = await prisma.event.count({
      where: {
        created_at: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(24, 0, 0, 0)),
        },
      },
    });
    const todaysRevenue = await prisma.eventPayment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        created_at: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(24, 0, 0, 0)),
        },
      },
    });
    const todaysParticipants = await prisma.eventParticipant.count({
      where: {
        created_at: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(24, 0, 0, 0)),
        },
      },
    });

    return {
      totalUsers,
      totalEvents,
      totalReviews,
      averageRating: averageRating._avg.rating
        ? averageRating._avg.rating.toFixed(1)
        : 0,
      totalRevenue: totalRevenue._sum.amount || 0,
      eventThisMonth,
      revenueThisMonth: revenueThisMonth._sum.amount || 0,
      participantThisMonth,
      todaysEvents,
      todaysRevenue: todaysRevenue._sum.amount || 0,
      todaysParticipants,
    };
  },

  //   user stats, my reviews, my average rating, my total reviews , my events reviews, my events average rating, my events total reviews , my events total revenue, my events this month, my events revenue this month, my events participants this month
  user: async (userId: string) => {
    // =========================
    // MY REVIEWS (USER SIDE)
    // =========================

    const totalReviews = await prisma.review.count({
      where: { userId },
    });

    const avgRatingResult = await prisma.review.aggregate({
      where: { userId },
      _avg: { rating: true },
    });

    const averageRating = avgRatingResult._avg.rating
      ? Number(avgRatingResult._avg.rating.toFixed(1))
      : 0;

    // =========================
    // MY EVENTS (OWNER SIDE)
    // =========================

    const myEvents = await prisma.event.findMany({
      where: { userId },
      select: { id: true },
    });

    const eventIds = myEvents.map((e) => e.id);

    // total events
    const totalEvents = eventIds.length;

    // =========================
    // REVIEWS ON MY EVENTS
    // =========================

    const totalEventReviews = await prisma.review.count({
      where: {
        eventId: { in: eventIds },
      },
    });

    const eventAvgRatingResult = await prisma.review.aggregate({
      where: {
        eventId: { in: eventIds },
      },
      _avg: { rating: true },
    });

    const eventAverageRating = eventAvgRatingResult._avg.rating
      ? Number(eventAvgRatingResult._avg.rating.toFixed(1))
      : 0;

    // =========================
    // REVENUE (MY EVENTS)
    // =========================

    const totalRevenueResult = await prisma.eventPayment.aggregate({
      where: {
        event_id: { in: eventIds },
      },
      _sum: { amount: true },
    });

    const totalRevenue = totalRevenueResult._sum.amount || 0;

    // =========================
    // THIS MONTH RANGE
    // =========================

    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    const endOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      1,
    );

    // =========================
    // EVENTS THIS MONTH
    // =========================

    const eventsThisMonth = await prisma.event.count({
      where: {
        userId,
        created_at: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
    });

    // =========================
    // REVENUE THIS MONTH
    // =========================

    const revenueThisMonthResult = await prisma.eventPayment.aggregate({
      where: {
        event_id: { in: eventIds },
        created_at: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
      _sum: { amount: true },
    });

    const revenueThisMonth = revenueThisMonthResult._sum.amount || 0;

    // =========================
    // PARTICIPANTS THIS MONTH
    // =========================

    const participantsThisMonth = await prisma.eventParticipant.count({
      where: {
        event_id: { in: eventIds },
        created_at: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
    });

    // =========================
    // FINAL RETURN
    // =========================

    return {
      // 🔹 user review stats
      totalReviews,
      averageRating,

      // 🔹 my events stats
      totalEvents,
      totalEventReviews,
      eventAverageRating,
      totalRevenue,

      // 🔹 this month stats
      eventsThisMonth,
      revenueThisMonth,
      participantsThisMonth,
    };
  },
};
