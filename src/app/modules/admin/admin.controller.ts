import { Request, Response } from "express";
import status from "http-status";
import catch_async from "../../custom/catch-async";
import send_response from "../../custom/send-response";
import { admin_service } from "./admin.service";

export const admin_controller = {
  // ! create admin
  create: catch_async(async (req: Request, res: Response) => {
    const payload = {
      ...req.body,
      profile_photo: req.file?.path,
    };
    const result = await admin_service.create(payload);
    send_response(res, {
      statusCode: status.CREATED,
      success: true,
      message: "Admin created successfully",
      data: result,
    });
  }),
  // !update admin
  update: catch_async(async (req: Request, res: Response) => {
    const id = req.params.id;
    const payload = req.body;
    const result = await admin_service.update(id as string, payload);
    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Admin updated successfully",
      data: result,
    });
  }),

  //   !delete admin
  delete: catch_async(async (req: Request, res: Response) => {
    const id = req.params.id;
    const user_id = req.user.id;
    await admin_service.delete(id as string, user_id as string);
    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Admin deleted successfully",
      data: null,
    });
  }),

  get_admin: catch_async(async (req: Request, res: Response) => {
    const result = await admin_service.get_admin(req.query);

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Admins fetched successfully",
      data: result,
    });
  }),
};
