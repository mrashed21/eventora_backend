import status from "http-status";
import api_error from "../../error-helper/api-error";
import { prisma } from "../../lib/prisma";

export const event_service = {
  // ! create
  create: async (payload: any) => {
    const result = await prisma.event.create({
      data: payload,
    });
    return result;
  },
  //   ! update
  update: async (id: string, payload: any) => {
    const event = await prisma.event.findUnique({
      where: { id },
    });
    if (!event) {
      throw new api_error(status.NOT_FOUND, "Event not found");
    }
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: payload,
    });
    return updatedEvent;
  },

  // ! delete
  delete: async (id: string) => {
    const event = await prisma.event.findUnique({
      where: { id },
    });
    if (!event) {
      throw new api_error(status.NOT_FOUND, "Event not found");
    }
    await prisma.event.delete({
      where: { id },
    });
    return { message: "Event deleted successfully" };
  },
  //   ! public
  get: async () => {
    return await prisma.event.findMany({
      where: { event_status: "active" },
      orderBy: { created_at: "desc" },
    });
  },
  // ! get by id
  get_details: async (id: string) => {
    const result = await prisma.event.findUnique({
      where: { id },
    });
    if (!result) {
      throw new api_error(status.NOT_FOUND, "Event not found");
    }
    return result;
  },

  // ! get by user id
  get_by_user_id: async (user_id: string) => {
    return await prisma.event.findMany({
      where: { user_id },
      orderBy: { created_at: "desc" },
    });
  },

  // ! get for admin
  get_for_admin: async () => {
    return await prisma.event.findMany({
      orderBy: { created_at: "desc" },
    });
  },
};
