import { Request, Response } from "express";
import status from "http-status";
import catch_async from "../../custom/catch-async";
import send_response from "../../custom/send-response";
import { user_service } from "./user.service";

export const user_controller = {
  get: catch_async(async (req: Request, res: Response) => {
    const result = await user_service.get(req.query);

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Users fetched successfully",
      data: result,
    });
  }),
};
