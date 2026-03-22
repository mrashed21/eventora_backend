/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { user_role, user_status } from "../../generated/prisma/enums";
import { config } from "../config/config";
import api_error from "../error-helper/api-error";
import { prisma } from "../lib/prisma";
import { cookie_utils } from "../utils/cookie";
import { jwt_token } from "../utils/jwt";

export const check_auth =
  (...authRoles: user_role[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //! Session Token Verification
      const session_token = cookie_utils.get(req, "better-auth.session_token");

      if (!session_token) {
        throw new Error("Unauthorized access! No session token provided.");
      }

      if (session_token) {
        const sessionExists = await prisma.session.findFirst({
          where: {
            token: session_token,
            expiresAt: {
              gt: new Date(),
            },
          },
          include: {
            user: true,
          },
        });

        if (sessionExists && sessionExists.user) {
          const user = sessionExists.user;

          const now = new Date();
          const expiresAt = new Date(sessionExists.expiresAt);
          const createdAt = new Date(sessionExists.createdAt);

          const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
          const timeRemaining = expiresAt.getTime() - now.getTime();
          const percentRemaining = (timeRemaining / sessionLifeTime) * 100;

          if (percentRemaining < 20) {
            res.setHeader("X-Session-Refresh", "true");
            res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
            res.setHeader("X-Time-Remaining", timeRemaining.toString());
          }

          if (
            user.user_status === user_status.banned ||
            user.user_status === user_status.deleted
          ) {
            throw new api_error(
              status.UNAUTHORIZED,
              "Unauthorized access! User is not active.",
            );
          }

          if (user.isDeleted) {
            throw new api_error(
              status.UNAUTHORIZED,
              "Unauthorized access! User is deleted.",
            );
          }

          if (
            authRoles.length > 0 &&
            !authRoles.includes(user.user_role as user_role)
          ) {
            throw new api_error(
              status.FORBIDDEN,
              "Forbidden access! You do not have permission to access this resource.",
            );
          }

          req.user = {
            id: user.id,
            user_role: user.user_role,
            user_email: user.email,
          };
        }

        const access_token = cookie_utils.get(req, "access_token");

        if (!access_token) {
          throw new api_error(
            status.UNAUTHORIZED,
            "Unauthorized access! No access token provided.",
          );
        }
      }

      //Access Token Verification
      const access_token = cookie_utils.get(req, "access_token");

      if (!access_token) {
        throw new api_error(
          status.UNAUTHORIZED,
          "Unauthorized access! No access token provided.",
        );
      }

      const verifiedToken = jwt_token.verify.access(
        access_token,
        config.ACCESS_TOKEN_SECRET,
      );
      if (!verifiedToken.success) {
        throw new api_error(
          status.UNAUTHORIZED,
          "Unauthorized access! Invalid access token.",
        );
      }

      if (
        authRoles.length > 0 &&
        !authRoles.includes(verifiedToken.data!.user_role as user_role)
      ) {
        throw new api_error(
          status.FORBIDDEN,
          "Forbidden access! You do not have permission to access this resource.",
        );
      }

      next();
    } catch (error: any) {
      next(error);
    }
  };
