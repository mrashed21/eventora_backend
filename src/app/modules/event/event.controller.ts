import { Request, Response } from "express";
import status from "http-status";
import catch_async from "../../custom/catch-async";
import send_response from "../../custom/send-response";
import { event_service } from "./event.service";

export const event_controller = {
  // ! create
  create: catch_async(async (req: Request, res: Response) => {
    const payload = {
      ...req.body,
      event_image: req.file?.path,
    };
    const user_id = req.user.id;
    const result = await event_service.create(payload, user_id as string);
    send_response(res, {
      statusCode: status.CREATED,
      success: true,
      message: "Event created successfully",
      data: result,
    });
  }),

  // !update
  update: catch_async(async (req: Request, res: Response) => {
    const user_id = req.user.id;
    const id = req.params.id;
    const payload = {
      ...req.body,
      event_image: req.file?.path,
    };
    const result = await event_service.update(
      id as string,
      payload,
      user_id as string,
    );
    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Event updated successfully",
      data: result,
    });
  }),

  //   !delete
  delete: catch_async(async (req: Request, res: Response) => {
    const user_id = req.user.id;
    const id = req.params.id;
    await event_service.delete(id as string, user_id as string);
    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Event deleted successfully",
      data: null,
    });
  }),

  //   ! public
  get: catch_async(async (req: Request, res: Response) => {
    const result = await event_service.get(req.query);
    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Events fetched successfully",
      data: result,
    });
  }),

  // ! get by id
  get_by_id: catch_async(async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await event_service.get_details(id as string);
    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Event fetched successfully",
      data: result,
    });
  }),

  // ! get by user id
  get_by_user_id: catch_async(async (req: Request, res: Response) => {
    const user_id = req.user.id;
    const result = await event_service.get_by_user_id(
      user_id as string,
      req.query,
    );
    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Events fetched successfully",
      data: result,
    });
  }),

  //   !admin get
  get_admin: catch_async(async (req: Request, res: Response) => {
    const user_id = req.user.id;
    const result = await event_service.get_admin(req.query, user_id as string);

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Events fetched successfully",
      data: result,
    });
  }),

  // ! featured events for home page
  get_featured: catch_async(async (req: Request, res: Response) => {
    const result = await event_service.get_featured();
    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Featured events fetched successfully",
      data: result,
    });
  }),

  // !upcoming events for home page
  get_upcoming: catch_async(async (req: Request, res: Response) => {
    const result = await event_service.get_upcoming();
    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Upcoming events fetched successfully",
      data: result,
    });
  }),
};
