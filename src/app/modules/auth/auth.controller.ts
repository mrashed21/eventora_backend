import { Request, Response } from "express";
import status from "http-status";
import catch_async from "../../custom/catch-async";
import send_response from "../../custom/send-response";
import { token_utils } from "../../utils/token";
import { auth_service } from "./auth.service";

export const auth_controller = {
  register: catch_async(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await auth_service.register(payload);
    const { access_token, refresh_token, token, ...rest } = result;
    token_utils.setCookie.access(res, access_token);
    token_utils.setCookie.refresh(res, refresh_token);
    token_utils.setCookie.betterAuth(res, token as string);
    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "User registered successfully",
      data: {
        ...rest,
        access_token,
        refresh_token,
        token: token as string,
      },
    });
  }),
};
