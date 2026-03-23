import status from "http-status";
import api_error from "../../error-helper/api-error";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { calculatePagination } from "../../utils/pagination";
import { buildSearchConditions } from "../../utils/search";

export const admin_service = {
  // ! create admin
  create: async (payload: any) => {
    const admin_exists = await prisma.user.findUnique({
      where: { email: payload.admin_email },
    });

    if (admin_exists) {
      throw new api_error(status.BAD_REQUEST, "Admin already exists");
    }

    const { admin_password, ...adminData } = payload;

    const userData = await auth.api.signUpEmail({
      body: {
        name: payload.admin_name,
        email: payload.admin_email,
        image: payload.profile_photo,
        password: payload.admin_password,
        user_role: payload.admin_role,
        need_password_change: true,
      },
    });

    try {
      const admin = await prisma.admin.create({
        data: {
          user_id: userData.user.id,
          admin_role: payload.admin_role,
          ...adminData,
        },
      });

      return admin;
    } catch (error) {
      await prisma.user.delete({
        where: { id: userData.user.id },
      });
      throw error;
    }
  },
  // !update admin
  update: async (id: string, payload: any) => {
    const result = await prisma.admin.update({
      where: {
        id,
      },
      data: payload,
    });
    return result;
  },
  // !delete admin
  delete: async (id: string, user_id: string) => {
    const admin = await prisma.admin.findUnique({
      where: {
        id,
      },
    });

    if (!admin) {
      throw new api_error(status.BAD_REQUEST, "Admin not found");
    }

    if (admin.id === user_id) {
      throw new api_error(status.BAD_REQUEST, "You can not delete yourself");
    }
    const result = await prisma.admin.update({
      where: {
        id,
      },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });
    return result;
  },
  // !get admin
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
      "admin_name",
      "admin_email",
    ]);

    const whereCondition: any = {
      ...searchCondition,
    };

    if (query.is_active !== undefined) {
      whereCondition.is_active = query.is_active === "true";
    }

    const [data, total] = await Promise.all([
      prisma.admin.findMany({
        where: whereCondition,
        skip,
        take,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.admin.count({
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
