import status from "http-status";
import api_error from "../../error-helper/api-error";
import { prisma } from "../../lib/prisma";
import { buildEventDateTime } from "../../utils/date-format";
import { calculatePagination } from "../../utils/pagination";
import { buildSearchConditions } from "../../utils/search";

export const event_service = {
  // ! create
  create: async (payload: any, user_id: string) => {
    const { event_type, event_date, event_time, ...rest } = payload;

    if (!payload.category_id) {
      throw new api_error(status.BAD_REQUEST, "Category ID is required");
    }

    const eventDateTime = buildEventDateTime(event_date, event_time);

    const result = await prisma.event.create({
      data: {
        ...rest,
        user_id,
        event_type: event_type ?? "public",
        event_date: eventDateTime,
        event_time: event_time,
      },
    });

    return result;
  },

  // ! update
  update: async (id: string, payload: any, user_id: string) => {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new api_error(status.NOT_FOUND, "Event not found");
    }

    if (event.user_id !== user_id) {
      throw new api_error(
        status.FORBIDDEN,
        "You are not the owner of this event",
      );
    }

    const { registration_fee, event_date, event_time, ...rest } = payload;

    const updateData: any = {
      ...rest,
    };

    if (event_date !== undefined || event_time !== undefined) {
      const finalDate =
        event_date !== undefined
          ? event_date
          : event.event_date.toISOString().split("T")[0];

      const finalTime = event_time ?? event.event_time;

      updateData.event_date = buildEventDateTime(finalDate, finalTime);
    }

    if (event_time !== undefined) {
      updateData.event_time = event_time;
    }
    if (registration_fee !== undefined) {
      updateData.registration_fee = registration_fee;
    }

    if (payload.category_id !== undefined) {
      updateData.category_id = payload.category_id;
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    return updatedEvent;
  },

  // ! delete
  delete: async (id: string, user_id: string) => {
    const [event, user] = await Promise.all([
      prisma.event.findUnique({
        where: { id },
      }),
      prisma.user.findUnique({
        where: { id: user_id },
        select: {
          id: true,
          user_role: true,
        },
      }),
    ]);

    if (!event) {
      throw new api_error(status.NOT_FOUND, "Event not found");
    }

    if (!user) {
      throw new api_error(status.NOT_FOUND, "User not found");
    }

    const isAdmin =
      user.user_role === "admin" || user.user_role === "super_admin";

    const isOwner = event.user_id === user_id;

    if (!isAdmin && !isOwner) {
      throw new api_error(
        status.FORBIDDEN,
        "You are not allowed to delete this event",
      );
    }

    await prisma.event.delete({
      where: { id },
    });

    return {
      message: "Event deleted successfully",
    };
  },

  // ! public get all
  get: async (query: any) => {
    const { search_term, page, limit } = query;

    const {
      skip,
      limit: take,
      sortBy,
      sortOrder,
    } = calculatePagination({
      page,
      limit,
    });

    const searchCondition = buildSearchConditions(search_term, [
      "event_title",
      "event_description",
      "event_venue",
      "category.category_title",
      "category.category_type",
    ]);

    const whereCondition: any = {
      ...searchCondition,
    };

    if (query.event_status !== undefined) {
      whereCondition.event_status = query.event_status;
    }

    if (query.event_type !== undefined) {
      whereCondition.event_type = query.event_type;
    }

    if (query.is_paid !== undefined) {
      whereCondition.is_paid = query.is_paid === "true";
    }

    const [data, total] = await Promise.all([
      prisma.event.findMany({
        where: whereCondition,
        skip,
        take,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          user: true,
          _count: {
            select: {
              participants: true,
            },
          },
        },
      }),
      prisma.event.count({
        where: whereCondition,
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

  // ! get details by id
  get_details: async (id: string) => {
    const result = await prisma.event.findUnique({
      where: { id },
      include: {
        user: true,
        category: true,
        participants: {
          include: {
            participant: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    if (!result) {
      throw new api_error(status.NOT_FOUND, "Event not found");
    }

    return result;
  },

  // ! get by user id
  get_by_user_id: async (user_id: string, query: any) => {
    const { page, limit, search_term } = query;

    const {
      skip,
      limit: take,
      sortBy,
      sortOrder,
    } = calculatePagination({
      page,
      limit,
    });

    const searchCondition = buildSearchConditions(search_term, [
      "event_title",
      "event_description",
      "event_venue",
      "category.category_title",
      "category.category_type",
    ]);

    const whereCondition: any = {
      user_id,
      ...searchCondition,
    };

    if (query.event_status !== undefined) {
      whereCondition.event_status = query.event_status;
    }

    if (query.event_type !== undefined) {
      whereCondition.event_type = query.event_type;
    }

    if (query.is_paid !== undefined) {
      whereCondition.is_paid = query.is_paid === "true";
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: whereCondition,
        skip,
        take,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          user: true,
          category: true,
          participants: {
            include: {
              participant: true,
            },
          },
          _count: {
            select: {
              participants: true,
            },
          },
        },
      }),
      prisma.event.count({
        where: whereCondition,
      }),
    ]);

    const data = events.map(({ participants, ...event }) => ({
      ...event,
      total_joined: participants.length,
      joined_participants: participants.map((item) => item.participant),
    }));

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

  // ! get for admin
  get_admin: async (query: any, user_id: string) => {
    const admin = await prisma.user.findUnique({
      where: { id: user_id },
      select: {
        user_role: true,
      },
    });

    if (!admin) {
      throw new api_error(
        status.FORBIDDEN,
        "You are not allowed to access this resource",
      );
    }

    const { search_term, page, limit } = query;

    const {
      skip,
      limit: take,
      sortBy,
      sortOrder,
    } = calculatePagination({
      page,
      limit,
    });

    const searchCondition = buildSearchConditions(search_term, [
      "event_title",
      "event_description",
      "event_venue",
      "category.category_title",
      "category.category_type",
    ]);

    const whereCondition: any = {
      ...searchCondition,
    };

    if (query.event_status !== undefined) {
      whereCondition.event_status = query.event_status;
    }

    if (query.event_type !== undefined) {
      whereCondition.event_type = query.event_type;
    }

    if (query.is_paid !== undefined) {
      whereCondition.is_paid = query.is_paid === "true";
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: whereCondition,
        skip,
        take,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          user: true,
          category: true,
          participants: {
            include: {
              participant: true,
            },
          },
          _count: {
            select: {
              participants: true,
            },
          },
        },
      }),
      prisma.event.count({
        where: whereCondition,
      }),
    ]);

    const data = events.map(({ participants, ...event }) => ({
      ...event,
      total_joined: participants.length,
      joined_participants: participants.map((item) => item.participant),
    }));

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

  // ! get feturead events
  get_featured: async () => {
    const result = await prisma.event.findMany({
      where: {
        is_featured: true,
      },
      include: {
        user: true,
        category: true,
        participants: {
          include: {
            participant: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    return result;
  },

  // ! upcoming events (9)
  get_upcoming: async () => {
    const now = new Date();

    const result = await prisma.event.findMany({
      where: {
        event_date: {
          gte: now,
        },
        event_status: "active",
      },
      orderBy: {
        event_date: "asc",
      },
      take: 9,
      include: {
        user: true,
        category: true,
        participants: {
          include: {
            participant: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    return result;
  },
};
