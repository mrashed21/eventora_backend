import status from "http-status";
import { JwtPayload } from "jsonwebtoken";
// import { user_role, user_status } from "../../../generated/prisma/enums";
import { config } from "../../config/config";
import api_error from "../../error-helper/api-error";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { jwt_token } from "../../utils/jwt";
import { token_utils } from "../../utils/token";
import { IChangePasswordPayload, Register_payload } from "./auth.interface";
import { user_role, user_status } from "@prisma/client";

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

    if (result?.status && result?.user && !result.user.emailVerified) {
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

  // ! get me
  get_me: async (user_id: string) => {
    const isUserExists = await prisma.user.findUnique({
      where: {
        id: user_id,
      },
      include: {
        participants: true,

        admin: true,
      },
    });

    if (!isUserExists) {
      throw new api_error(status.NOT_FOUND, "User not found");
    }

    return isUserExists;
  },

  // ! get new token
  new_token: async (refresh_token: string, session_token: string) => {
    const is_session_token = await prisma.session.findUnique({
      where: {
        token: session_token,
      },
      include: {
        user: true,
      },
    });

    if (!is_session_token) {
      throw new api_error(status.UNAUTHORIZED, "Invalid session token");
    }

    const verified_refresh_token = jwt_token.verify.refresh(
      refresh_token,
      config.REFRESH_TOKEN_SECRET,
    );

    if (!verified_refresh_token.success && verified_refresh_token.error) {
      throw new api_error(status.UNAUTHORIZED, "Invalid refresh token");
    }

    const data = verified_refresh_token.data as JwtPayload;

    const new_access_token = token_utils.create.access({
      id: data.id,
      user_email: data.user.email,
      user_name: data.user.name,
      user_role: data.user.user_role as user_role,
      is_deleted: data.user.isDeleted,
      user_status: data.user.user_status as user_status,
      email_verified: data.user.emailVerified,
    });

    const new_refresh_token = token_utils.create.refresh({
      id: data.id,
      user_email: data.user.email,
      user_name: data.user.name,
      user_role: data.user.user_role as user_role,
      is_deleted: data.user.isDeleted,
      user_status: data.user.user_status as user_status,
      email_verified: data.user.emailVerified,
    });

    const { token } = await prisma.session.update({
      where: {
        token: session_token,
      },
      data: {
        token: session_token,
        expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1000),
        updatedAt: new Date(),
      },
    });

    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token,
      session_token: token,
    };
  },

  // ! logout user
  logout: async (sessionToken: string) => {
    const result = await auth.api.signOut({
      headers: new Headers({
        Authorization: `Bearer ${sessionToken}`,
      }),
    });
    return result;
  },

  // ! change password
  change_password: async (
    payload: IChangePasswordPayload,
    sessionToken: string,
  ) => {
    const session = await auth.api.getSession({
      headers: new Headers({
        Authorization: `Bearer ${sessionToken}`,
      }),
    });

    if (!session) {
      throw new api_error(status.UNAUTHORIZED, "Invalid session token");
    }

    const { current_password, new_password } = payload;

    const result = await auth.api.changePassword({
      body: {
        currentPassword: current_password,
        newPassword: new_password,
        revokeOtherSessions: true,
      },
      headers: new Headers({
        Authorization: `Bearer ${sessionToken}`,
      }),
    });

    if (session.user.need_password_change) {
      await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          need_password_change: false,
        },
      });
    }

    const new_access_token = token_utils.create.access({
      id: session.user.id,
      user_email: session.user.email,
      user_name: session.user.name,
      user_role: session.user.user_role as user_role,
      is_deleted: session.user.isDeleted,
      user_status: session.user.user_status as user_status,
      email_verified: session.user.emailVerified,
    });

    const new_refresh_token = token_utils.create.refresh({
      id: session.user.id,
      user_email: session.user.email,
      user_name: session.user.name,
      user_role: session.user.user_role as user_role,
      is_deleted: session.user.isDeleted,
      user_status: session.user.user_status as user_status,
      email_verified: session.user.emailVerified,
    });

    return {
      ...result,
      access_token: new_access_token,
      refresh_token: new_refresh_token,
    };
  },

  // ! forget password

  forget_password: async (email: string) => {
    const is_user_exist = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!is_user_exist) {
      throw new api_error(status.NOT_FOUND, "User not found");
    }

    if (!is_user_exist.emailVerified) {
      throw new api_error(status.BAD_REQUEST, "Email not verified");
    }

    if (
      is_user_exist.isDeleted ||
      is_user_exist.user_status === user_status.deleted
    ) {
      throw new api_error(status.NOT_FOUND, "User not found");
    }

    await auth.api.requestPasswordResetEmailOTP({
      body: {
        email,
      },
    });
  },

  // ! reset password
  reset_password: async (email: string, otp: string, new_password: string) => {
    const is_user_exist = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!is_user_exist) {
      throw new api_error(status.NOT_FOUND, "User not found");
    }

    if (!is_user_exist.emailVerified) {
      throw new api_error(status.BAD_REQUEST, "Email not verified");
    }

    if (
      is_user_exist.isDeleted ||
      is_user_exist.user_status === user_status.deleted
    ) {
      throw new api_error(status.NOT_FOUND, "User not found");
    }

    await auth.api.resetPasswordEmailOTP({
      body: {
        email,
        otp,
        password: new_password,
      },
    });

    if (is_user_exist.need_password_change) {
      await prisma.user.update({
        where: {
          id: is_user_exist.id,
        },
        data: {
          need_password_change: false,
        },
      });
    }

    await prisma.session.deleteMany({
      where: {
        userId: is_user_exist.id,
      },
    });
  },

  // ! resend otp
  resend_otp: async (email: string) => {
    const normalized_email = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalized_email },
    });

    if (!user) {
      throw new api_error(status.NOT_FOUND, "User not found");
    }

    if (user.emailVerified) {
      throw new api_error(status.BAD_REQUEST, "Email already verified");
    }

    await auth.api.sendVerificationEmail({
      body: {
        email: normalized_email,
      },
    });

    return {
      message: "OTP sent successfully",
    };
  },

  // ! google login

  google_login: async (session: Record<string, any>) => {
    const is_participant = await prisma.participants.findUnique({
      where: {
        user_id: session.user.id,
      },
    });

    if (!is_participant) {
      await prisma.participants.create({
        data: {
          user_id: session.user.id,
          user_name: session.user.name,
          user_email: session.user.email,
        },
      });
    }

    // const access_token = token_utils.create.access({
    //   id: session.user.id,
    //   user_role: session.user.role,
    //   user_name: session.user.name,
    // });

    // const refresh_token = token_utils.create.refresh({
    //   userId: session.user.id,
    //   role: session.user.role,
    //   name: session.user.name,
    // });

    const access_token = token_utils.create.access({
      id: session.user.id,
      user_email: session.user.email,
      user_name: session.user.name,
      user_role: session.user.user_role as user_role,
      is_deleted: session.user.isDeleted,
      user_status: session.user.user_status as user_status,
      email_verified: session.user.emailVerified,
    });

    const refresh_token = token_utils.create.refresh({
      id: session.user.id,
      user_email: session.user.email,
      user_name: session.user.name,
      user_role: session.user.user_role as user_role,
      is_deleted: session.user.isDeleted,
      user_status: session.user.user_status as user_status,
      email_verified: session.user.emailVerified,
    });

    return {
      access_token,
      refresh_token,
    };
  },
};
