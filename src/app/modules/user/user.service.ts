import { prisma } from "../../lib/prisma";
import { calculatePagination } from "../../utils/pagination";
import { buildSearchConditions } from "../../utils/search";

export const user_service = {
  // ! get all users for admin
  get: async (payload: any) => {
    const { page = 1, limit = 10, search_term } = payload;

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
      "name",
      "email",
    ]);

    const whereCondition: any = {
      AND: [
        {
          user_role: {
            notIn: ["admin", "super_admin"],
          },
        },
        searchCondition,
      ],
    };

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where: whereCondition,
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count({
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
};
