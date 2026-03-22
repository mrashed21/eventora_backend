import { Request, Response } from "express";
import status from "http-status";
import catch_async from "../../custom/catch-async";
import {
  default as send_response,
  default as sendResponse,
} from "../../custom/send-response";
import { token_utils } from "../../utils/token";
import { auth_service } from "./auth.service";
import { get } from "node:http";

export const auth_controller = {
  // ! register user
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

  //! verify email
  verify: catch_async(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    await auth_service.verify(email, otp);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Email verified successfully",
    });
  }),

  // ! login user
  login: catch_async(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await auth_service.login(payload);

    const { access_token, refresh_token, token, ...rest } = result;
    token_utils.setCookie.access(res, access_token);
    token_utils.setCookie.refresh(res, refresh_token);
    token_utils.setCookie.betterAuth(res, token as string);
    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "User logged in successfully",
      data: {
        ...rest,
        access_token,
        refresh_token,
        token: token as string,
      },
    });
  }),

  // ! get me
  get_me: catch_async(async (req: Request, res: Response) => {
  const result = await auth_service.get_me(req.user.id);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
}),
};
