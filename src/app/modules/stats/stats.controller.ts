import { Request, Response } from "express";
import catch_async from "../../custom/catch-async";
import send_response from "../../custom/send-response";
import { stats_service } from "./stats.service";

export const stats_controller = {
  admin: catch_async(async (req: Request, res: Response) => {
    const result = await stats_service.admin();

    send_response(res, {
      statusCode: 200,
      success: true,
      message: "Stats fetched successfully",
      data: result,
    });
  }),

  user: catch_async(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const result = await stats_service.user(userId);

    send_response(res, {
      statusCode: 200,
      success: true,
      message: "Stats fetched successfully",
      data: result,
    });
  }),
};
