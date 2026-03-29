import status from "http-status";
import api_error from "../../error-helper/api-error";
import { prisma } from "../../lib/prisma";
import { buildEventDateTime } from "../../utils/date-format";
import { calculatePagination } from "../../utils/pagination";
import { buildSearchConditions } from "../../utils/search";

export const event_service = {
  // ! create
  create: async (payload: any, user_id: string) => {
    const { event_date, event_time, ...rest } = payload;

    if (!payload.category_id) {
      throw new api_error(status.BAD_REQUEST, "Category ID is required");
    }

    const organizer = await prisma.organizer.findUnique({
      where: {
        user_id,
      },
    });

    if (!organizer) {
      throw new api_error(
        status.BAD_REQUEST,
        "Organizer profile not found for this user",
      );
    }

    const category = await prisma.categories.findUnique({
      where: {
        id: payload.category_id,
      },
    });

    if (!category) {
      throw new api_error(status.NOT_FOUND, "Category not found");
    }

    const eventDateTime = buildEventDateTime(event_date, event_time);

    const result = await prisma.event.create({
      data: {
        ...rest,
        userId: user_id,
        organizer_id: organizer.id,
        event_date: eventDateTime,
        event_time,
      },
      include: {
        category: true,
        organizer: true,
        user: true,
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    return result;
  },

  // ! update
  update: async (id: string, payload: any, user_id: string) => {
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

    const isOwner = event.userId === user_id;

    if (!isAdmin && !isOwner) {
      throw new api_error(
        status.FORBIDDEN,
        "You are not allowed to update this event",
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
      const category = await prisma.categories.findUnique({
        where: {
          id: payload.category_id,
        },
      });

      if (!category) {
        throw new api_error(status.NOT_FOUND, "Category not found");
      }

      updateData.category_id = payload.category_id;
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        organizer: true,
        user: true,
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

    const isOwner = event.userId === user_id;

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
    const { search_term, page, limit, category_id, event_status, is_featured } =
      query;

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

    const searchCondition = buildSearchConditions(search_term, [
      "event_title",
      "event_description",
      "event_venue",
    ]);

    const whereCondition: any = {
      ...searchCondition,
    };

    if (event_status !== undefined) {
      whereCondition.event_status = event_status;
    }

    if (category_id !== undefined) {
      whereCondition.category_id = category_id;
    }

    if (is_featured !== undefined) {
      whereCondition.is_featured = is_featured === "true";
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
          organizer: true,
          category: true,
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
        organizer: true,
        category: true,
        participants: {
          include: {
            user: true,
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

    return {
      ...result,
      total_joined: result.participants.length,
      joined_participants: result.participants.map((item) => item.user),
    };
  },

  // ! get by user id
  get_by_user_id: async (user_id: string, query: any) => {
    const { page, limit, search_term, event_status, category_id, is_featured } =
      query;

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

    const searchCondition = buildSearchConditions(search_term, [
      "event_title",
      "event_description",
      "event_venue",
    ]);

    const whereCondition: any = {
      userId: user_id,
      ...searchCondition,
    };

    if (event_status !== undefined) {
      whereCondition.event_status = event_status;
    }

    if (category_id !== undefined) {
      whereCondition.category_id = category_id;
    }

    if (is_featured !== undefined) {
      whereCondition.is_featured = is_featured === "true";
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
          organizer: true,
          category: true,
          participants: {
            include: {
              user: true,
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
      joined_participants: participants.map((item) => item.user),
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

    const { search_term, page, limit, category_id, event_status, is_featured } =
      query;

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

    const searchCondition = buildSearchConditions(search_term, [
      "event_title",
      "event_description",
      "event_venue",
    ]);

    const whereCondition: any = {
      ...searchCondition,
    };

    if (event_status !== undefined) {
      whereCondition.event_status = event_status;
    }

    if (category_id !== undefined) {
      whereCondition.category_id = category_id;
    }

    if (is_featured !== undefined) {
      whereCondition.is_featured = is_featured === "true";
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
          organizer: true,
          category: true,
          participants: {
            include: {
              user: true,
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
      joined_participants: participants.map((item) => item.user),
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

  // ! featured events
  get_featured: async () => {
    const result = await prisma.event.findMany({
      where: {
        is_featured: true,
        event_status: "active",
      },
      orderBy: {
        event_date: "asc",
      },
      include: {
        user: true,
        organizer: true,
        category: true,
        participants: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    return result.map(({ participants, ...event }) => ({
      ...event,
      total_joined: participants.length,
      joined_participants: participants.map((item) => item.user),
    }));
  },

  // ! upcoming events
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
        organizer: true,
        category: true,
        participants: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    return result.map(({ participants, ...event }) => ({
      ...event,
      total_joined: participants.length,
      joined_participants: participants.map((item) => item.user),
    }));
  },
};
