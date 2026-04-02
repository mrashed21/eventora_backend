import { user_role, user_status } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import { config } from "../config/config";
import { sendEmail } from "../utils/email";
import { prisma } from "./prisma";

export const auth = betterAuth({
  baseURL: config.BETTER_AUTH_URL,
  secret: config.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  socialProviders: {
    google: {
      clientId: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      // callbackUrl: envVars.GOOGLE_CALLBACK_URL,
      mapProfileToUser: () => {
        return {
          user_role: user_role.user,
          user_status: user_status.active,
          need_password_change: false,
          emailVerified: true,
          is_deleted: false,
          deletedAt: null,
        };
      },
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },

  user: {
    additionalFields: {
      user_role: {
        type: "string",
        required: true,
        defaultValue: user_role.user,
      },
      user_status: {
        type: "string",
        required: true,
        defaultValue: user_status.active,
      },
      need_password_change: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      is_deleted: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null,
      },
    },
  },

  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          if (!user) {
            console.error(
              `User with email ${email} not found. Cannot send verification OTP.`,
            );
            return;
          }

          if (user && user.user_role === user_role.super_admin) {
            console.log(
              `User with email ${email} is a super admin. Skipping sending verification OTP.`,
            );
            return;
          }

          if (user && !user.emailVerified) {
            sendEmail({
              to: email,
              subject: "Verify your email",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp,
              },
            });
          }
        } else if (type === "forget-password") {
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          if (user) {
            sendEmail({
              to: email,
              subject: "Password Reset OTP",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp,
              },
            });
          }
        }
      },
      expiresIn: 60 * 60, // 60 minutes in seconds
      otpLength: 6,
    }),
  ],

  session: {
    expiresIn: 60 * 60 * 24, // 1 day (seconds)
    updateAge: 60 * 60 * 24, // 1 day (seconds)
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24, // 1 day (seconds)
    },
  },

  trustedOrigins: [
    config.BETTER_AUTH_URL! || "http://localhost:5000" || config.FRONTEND_URL,
  ],
  redirectURLs: {
    signIn: `${config.BETTER_AUTH_URL}/api/v1/auth/google/success`,
  },

  advanced: {
    // disableCSRFCheck: true,
    useSecureCookies: true,
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/",
        },
      },
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/",
        },
      },
    },
  },
});
