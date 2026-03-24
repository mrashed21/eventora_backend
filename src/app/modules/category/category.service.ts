import status from "http-status";
import api_error from "../../error-helper/api-error";
import { prisma } from "../../lib/prisma";
import { calculatePagination } from "../../utils/pagination";
import { buildSearchConditions } from "../../utils/search";

export const category_service = {
  // ! create
  create: async (payload: any) => {
    const result = await prisma.categories.create({
      data: {
        category_type: payload.category_type,
        category_description: payload.category_description,
        category_status: payload.category_status,
        is_paid: payload.is_paid ?? true,
      },
    });

    return result;
  },

  // ! update
  update: async (id: string, payload: any) => {
    const category = await prisma.categories.findUnique({
      where: { id },
    });

    if (!category) {
      throw new api_error(status.NOT_FOUND, "Category not found");
    }
    const updateData: any = {};

    if (payload.category_type !== undefined) {
      updateData.category_type = payload.category_type;
    }

    if (payload.category_description !== undefined) {
      updateData.category_description = payload.category_description;
    }

    if (payload.category_status !== undefined) {
      updateData.category_status = payload.category_status;
    }

    if (payload.is_paid !== undefined) {
      updateData.is_paid = payload.is_paid;
    }

    const result = await prisma.categories.update({
      where: { id },
      data: updateData,
    });

    return result;
  },

  // ! delete
  delete: async (id: string) => {
    const category = await prisma.categories.findUnique({
      where: { id },
    });

    if (!category) {
      throw new api_error(status.NOT_FOUND, "Category not found");
    }

    const result = await prisma.categories.delete({
      where: { id },
    });

    return result;
  },

  // ! public
  get: async () => {
    return await prisma.categories.findMany({
      where: { category_status: "active" },
      orderBy: { created_at: "desc" },
    });
  },

  // ! admin
  get_admin: async (query: any) => {
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
      "category_type",
      "category_description",
    ]);

    const whereCondition: any = {
      ...searchCondition,
    };

    if (query.category_status !== undefined) {
      whereCondition.category_status = query.category_status;
    }

    const [data, total] = await Promise.all([
      prisma.categories.findMany({
        where: whereCondition,
        skip,
        take,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.categories.count({
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
