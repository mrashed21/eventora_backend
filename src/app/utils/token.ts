import { Response } from "express";
import { config } from "../config/config";
import { cookieUtils } from "./cookie";
import { IJwtPayload, jwt_token } from "./jwt";

export const token_utils = {
  //  ! create token
  create: {
    access: (payload: IJwtPayload) => {
      return jwt_token.create.access(payload, config.ACCESS_TOKEN_SECRET, "1d");
    },

    refresh: (payload: IJwtPayload) => {
      return jwt_token.create.refresh(
        payload,
        config.REFRESH_TOKEN_SECRET,
        "7d",
      );
    },
  },

  // ! set cookie
  setCookie: {
    access: (res: Response, token: string) => {
      cookieUtils.setCookie(res, "accessToken", token, {
        httpOnly: true,
        secure: false, // production e true
        sameSite: "lax",
        path: "/",
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      });
    },

    refresh: (res: Response, token: string) => {
      cookieUtils.setCookie(res, "refreshToken", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
    },

    betterAuth: (res: Response, token: string) => {
      cookieUtils.setCookie(res, "better-auth.session_token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 1000 * 60 * 60 * 24,
      });
    },
  },
};


/**
 * getAccessToken(payload) || token_utils.create.access(payload)
 * getRefreshToken(payload) || token_utils.create.refresh(payload)
 * createAccessTokenAndSetCookie(res, token) || token_utils.setCookie.access(res, token)
 * createRefreshTokenAndSetCookie(res, token) || token_utils.setCookie.refresh(res, token)
 * createBetterAuthTokenAndSetCookie(res, token) || token_utils.setCookie.betterAuth(res, token)
 */