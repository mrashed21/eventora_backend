import status from "http-status";
import api_error from "../../error-helper/api-error";
import { prisma } from "../../lib/prisma";
import { calculatePagination } from "../../utils/pagination";
import { buildSearchConditions } from "../../utils/search";

export const category_service = {
  // ! create
  create: async (payload: any) => {
    const exists = await prisma.categories.findUnique({
      where: { category_name: payload.category_name },
    });

    if (exists) {
      throw new api_error(status.BAD_REQUEST, "Category already exists");
    }

    const result = await prisma.categories.create({
      data: {
        category_name: payload.category_name,
        category_description: payload.category_description,
        is_active: payload.is_active ?? true,
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

    if (payload.category_name !== undefined) {
      const exists = await prisma.categories.findFirst({
        where: {
          category_name: payload.category_name,
          NOT: { id },
        },
      });

      if (exists) {
        throw new api_error(status.BAD_REQUEST, "Category name already exists");
      }

      updateData.category_name = payload.category_name;
    }

    if (payload.category_description !== undefined) {
      updateData.category_description = payload.category_description;
    }

    if (payload.is_active !== undefined) {
      updateData.is_active = payload.is_active;
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
      where: { is_active: true },
      orderBy: { created_at: "desc" },
    });
  },

  // ! admin
  get_admin: async (query: any) => {
    const { searchTerm, page, limit } = query;

    const {
      skip,
      limit: take,
      sortBy,
      sortOrder,
    } = calculatePagination({
      page,
      limit,
    });

    const searchCondition = buildSearchConditions(searchTerm, [
      "category_name",
      "category_description",
    ]);

    const whereCondition: any = {
      ...searchCondition,
    };

    if (query.is_active !== undefined) {
      whereCondition.is_active = query.is_active === "true";
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
