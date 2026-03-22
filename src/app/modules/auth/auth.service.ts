import status from "http-status";
import { user_role, user_status } from "../../../generated/prisma/enums";
import api_error from "../../error-helper/api-error";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { token_utils } from "../../utils/token";
import { Register_payload } from "./auth.interface";

export const auth_service = {
  // ! register user
  register: async (payload: Register_payload) => {
    const { user_name, user_email, user_password } = payload;

    const normalized_email = user_email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalized_email },
    });

    if (existingUser) {
      throw new api_error(status.BAD_REQUEST, "Email already exists");
    }
    const result = await auth.api.signUpEmail({
      body: {
        name: user_name,
        email: normalized_email,
        password: user_password,
      },
    });

    if (!result.user) {
      throw new api_error(status.BAD_REQUEST, "Failed to create user");
    }

    try {
      const participant = await prisma.$transaction(async (tx) => {
        const participant_tx = await tx.participants.create({
          data: {
            user_id: result.user.id,
            user_name: user_name,
            user_email: normalized_email,
          },
        });

        return participant_tx;
      });

      const access_token = token_utils.create.access({
        id: result.user.id,
        user_email: result.user.email,
        user_name: result.user.name,
        user_role: result.user.user_role as user_role,
        is_deleted: result.user.isDeleted,
        user_status: result.user.user_status as user_status,
        email_verified: result.user.emailVerified,
      });

      const refresh_token = token_utils.create.refresh({
        id: result.user.id,
        user_email: result.user.email,
        user_name: result.user.name,
        user_role: result.user.user_role as user_role,
        is_deleted: result.user.isDeleted,
        user_status: result.user.user_status as user_status,
        email_verified: result.user.emailVerified,
      });

      return {
        ...result.user,
        participant: participant,
        access_token,
        refresh_token,
        token: result.token,
      };
    } catch (error) {
      console.log("Transaction error : ", error);
      await prisma.participants.deleteMany({
        where: {
          user_id: result.user.id,
        },
      });
      throw error;
    }
  },

  //! verify email
  verify: async (email: string, otp: string) => {
    const result = await auth.api.verifyEmailOTP({
      body: {
        email,
        otp,
      },
    });

    if (result.status && !result.user.emailVerified) {
      await prisma.user.update({
        where: {
          email,
        },
        data: {
          emailVerified: true,
        },
      });
    }
  },

  //   ! login user
  login: async (payload: Register_payload) => {
    const { user_email, user_password } = payload;
    const result = await auth.api.signInEmail({
      body: {
        email: user_email,
        password: user_password,
      },
    });

    if (!result.user) {
      throw new api_error(status.BAD_REQUEST, "Failed to create user");
    }

    if (result.user.user_status === user_status.in_active) {
      throw new api_error(status.BAD_REQUEST, "User is inactive");
    }
    if (
      result.user.isDeleted ||
      result.user.user_status === user_status.deleted
    ) {
      throw new api_error(status.BAD_REQUEST, "User is deleted");
    }

    const access_token = token_utils.create.access({
      id: result.user.id,
      user_email: result.user.email,
      user_name: result.user.name,
      user_role: result.user.user_role as user_role,
      is_deleted: result.user.isDeleted,
      user_status: result.user.user_status as user_status,
      email_verified: result.user.emailVerified,
    });

    const refresh_token = token_utils.create.refresh({
      id: result.user.id,
      user_email: result.user.email,
      user_name: result.user.name,
      user_role: result.user.user_role as user_role,
      is_deleted: result.user.isDeleted,
      user_status: result.user.user_status as user_status,
      email_verified: result.user.emailVerified,
    });

    return {
      ...result.user,
      token: result.token,
      access_token,
      refresh_token,
    };
  },
};
