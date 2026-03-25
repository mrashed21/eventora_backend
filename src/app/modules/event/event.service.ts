import status from "http-status";
import api_error from "../../error-helper/api-error";
import { prisma } from "../../lib/prisma";
import { calculatePagination } from "../../utils/pagination";
import { buildSearchConditions } from "../../utils/search";

export const event_service = {
  // ! create
  create: async (payload: any) => {
    const result = await prisma.event.create({
      data: payload,
    });
    return result;
  },
  //   ! update
  update: async (id: string, payload: any, user_id: string) => {
    const event = await prisma.event.findUnique({
      where: { id },
    });
    if (!event) {
      throw new api_error(status.NOT_FOUND, "Event not found");
    }
    // Check if the user is the owner of the event
    if (event.user_id !== user_id) {
      throw new api_error(
        status.FORBIDDEN,
        "You are not the owner of this event",
      );
    }
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: payload,
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

  //   ! public
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
    ]);

    const whereCondition: any = {
      ...searchCondition,
    };

    if (query.event_status !== undefined) {
      whereCondition.event_status = query.event_status;
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

  // ! get by id
  get_details: async (id: string) => {
    const result = await prisma.event.findUnique({
      where: { id },
      include: {
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
    ]);

    const whereCondition: any = {
      user_id,
      ...searchCondition,
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: whereCondition,
        skip,
        take,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          participants: {
            include: {
              participant: true,
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
    ]);

    const whereCondition: any = {
      ...searchCondition,
    };

    if (query.event_status !== undefined) {
      whereCondition.event_status = query.event_status;
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
          participants: {
            include: {
              participant: true,
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
};
