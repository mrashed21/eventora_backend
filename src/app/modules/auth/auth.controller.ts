import { Request, Response } from "express";
import status from "http-status";
import { config } from "../../config/config";
import catch_async from "../../custom/catch-async";
import send_response from "../../custom/send-response";
import api_error from "../../error-helper/api-error";
import { auth } from "../../lib/auth";
import { cookie_utils } from "../../utils/cookie";
import { token_utils } from "../../utils/token";
import { auth_service } from "./auth.service";

export const auth_controller = {
  // ! register user
  register: catch_async(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await auth_service.register(payload);
    const { access_token, refresh_token, token, ...rest } = result;
    token_utils.set_cookie.access(res, access_token);
    token_utils.set_cookie.refresh(res, refresh_token);
    token_utils.set_cookie.betterAuth(res, token as string);
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

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Verified successfully! You can now log in.",
    });
  }),

  // ! login user
  login: catch_async(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await auth_service.login(payload);

    const { access_token, refresh_token, token, ...rest } = result;
    token_utils.set_cookie.access(res, access_token);
    token_utils.set_cookie.refresh(res, refresh_token);
    token_utils.set_cookie.betterAuth(res, token as string);
    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "User logged in successfully",
      data: {
        ...rest,
        // access_token,
        // refresh_token,
        // token: token as string,
      },
    });
  }),

  // ! get me
  get_me: catch_async(async (req: Request, res: Response) => {
    const result = await auth_service.get_me(req.user.id);
    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "User fetched successfully",
      data: result,
    });
  }),

  // ! get new token
  new_token: catch_async(async (req: Request, res: Response) => {
    const refresh_token = req.cookies.refresh_token;
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    if (!refresh_token) {
      throw new api_error(status.UNAUTHORIZED, "Refresh token is missing");
    }
    const result = await auth_service.new_token(
      refresh_token,
      betterAuthSessionToken,
    );

    const {
      access_token,
      refresh_token: new_refresh_token,
      session_token,
    } = result;

    token_utils.set_cookie.access(res, access_token);
    token_utils.set_cookie.refresh(res, new_refresh_token);
    token_utils.set_cookie.betterAuth(res, session_token);

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "New tokens generated successfully",
      data: {
        access_token,
        refresh_token: new_refresh_token,
        session_token,
      },
    });
  }),

  // ! logout user
  logout: catch_async(async (req: Request, res: Response) => {
    const better_auth_session = req.cookies["better-auth.session_token"];
    const result = await auth_service.logout(better_auth_session);
    cookie_utils.clear(res, "access_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    cookie_utils.clear(res, "refresh_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    cookie_utils.clear(res, "better-auth.session_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "User logged out successfully",
      data: result,
    });
  }),

  // ! change password

  change_password: catch_async(async (req: Request, res: Response) => {
    const payload = req.body;
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];

    const result = await auth_service.change_password(
      payload,
      betterAuthSessionToken,
    );

    const { access_token, refresh_token, token } = result;

    token_utils.set_cookie.access(res, access_token);
    token_utils.set_cookie.refresh(res, refresh_token);
    token_utils.set_cookie.betterAuth(res, token as string);

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Password changed successfully",
      data: result,
    });
  }),

  // ! forget password
  forget_password: catch_async(async (req: Request, res: Response) => {
    const { email } = req.body;
    await auth_service.forget_password(email);

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Password reset OTP sent to email successfully",
    });
  }),

  // ! reset password
  reset_password: catch_async(async (req: Request, res: Response) => {
    const { email, otp, new_password } = req.body;
    await auth_service.reset_password(email, otp, new_password);

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "Password reset successfully",
    });
  }),

  // ! resend otp
  resend_otp: catch_async(async (req: Request, res: Response) => {
    const { email } = req.body;
    await auth_service.resend_otp(email);

    send_response(res, {
      statusCode: status.OK,
      success: true,
      message: "OTP sent successfully",
    });
  }),

  // ! google login

  // /api/v1/auth/login/google?redirect=/profile
  google_login: catch_async((req: Request, res: Response) => {
    const redirectPath = (req.query.redirect as string) || "/";

    const isValidRedirectPath =
      redirectPath.startsWith("/") && !redirectPath.startsWith("//");

    const finalRedirectPath = isValidRedirectPath ? redirectPath : "/";

    const callbackURL = `${config.FRONTEND_URL}/auth/callback?redirect=${encodeURIComponent(finalRedirectPath)}`;

    const googleAuthURL = `${config.BETTER_AUTH_URL}/api/auth/sign-in/social?provider=google&callbackURL=${encodeURIComponent(callbackURL)}`;

    res.redirect(googleAuthURL);
  }),

  // ! google login success
  google_login_success: catch_async(async (req: Request, res: Response) => {
    const redirectPath = (req.query.redirect as string) || "/";

    const sessionToken = req.cookies["better-auth.session_token"];

    if (!sessionToken) {
      return res.redirect(`${config.FRONTEND_URL}/login?error=oauth_failed`);
    }

    const session = await auth.api.getSession({
      headers: {
        Cookie: `better-auth.session_token=${sessionToken}`,
      },
    });

    if (!session) {
      return res.redirect(
        `${config.FRONTEND_URL}/login?error=no_session_found`,
      );
    }

    if (session && !session.user) {
      return res.redirect(`${config.FRONTEND_URL}/login?error=no_user_found`);
    }

    const result = await auth_service.google_login(session);

    const { access_token, refresh_token } = result;

    token_utils.set_cookie.access(res, access_token);
    token_utils.set_cookie.refresh(res, refresh_token);
    // ?redirect=//profile -> /profile
    const isValidRedirectPath =
      redirectPath.startsWith("/") && !redirectPath.startsWith("//");
    const finalRedirectPath = isValidRedirectPath ? redirectPath : "/";

    res.redirect(`${config.FRONTEND_URL}${finalRedirectPath}`);
  }),

  google_exchange: catch_async(async (req: Request, res: Response) => {
    const sessionToken = req.cookies["better-auth.session_token"];
    const session = await auth.api.getSession({
      headers: {
        Cookie: `better-auth.session_token=${sessionToken}`,
      },
    });

    if (!session || !session.user) {
      throw new api_error(status.UNAUTHORIZED, "No active session found");
    }

    const result = await auth_service.google_login(session);

    const { access_token, refresh_token } = result;

    token_utils.set_cookie.access(res, access_token);
    token_utils.set_cookie.refresh(res, refresh_token);

    res.status(200).json({
      success: true,
      message: "Google login successful",
    });
  }),
  // ! handle OAuth error
  handle_oAuth_error: catch_async((req: Request, res: Response) => {
    const error = (req.query.error as string) || "oauth_failed";
    res.redirect(`${config.FRONTEND_URL}/login?error=${error}`);
  }),
};
