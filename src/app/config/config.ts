import dotenv from "dotenv";
// import status from "http-status";
// import AppError from "../errorHelper/app-error";
dotenv.config();

interface IConfig {
  NODE_ENV: string;
  PORT: string;
  DATABASE_URL: string;
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  EMAIL_SENDER_SMTP_USER: string;
  EMAIL_SENDER_SMT_PASS: string;
  EMAIL_SENDER_SMTP_HOST: string;
  EMAIL_SENDER_SMTP_PORT: string;
  EMAIL_SENDER_SMTP_FROM: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CALLBACK_URL: string;
  FRONTEND_URL: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  SUPER_ADMIN_EMAIL: string;
  SUPER_ADMIN_PASSWORD: string;
}

// const requiredEnv = [
//   "NODE_ENV",
//   "PORT",
//   "DATABASE_URL",
//   "BETTER_AUTH_URL",
//   "BETTER_AUTH_SECRET",
//   "ACCESS_TOKEN_SECRET",
//   "REFRESH_TOKEN_SECRET",
//   "EMAIL_SENDER_SMTP_USER",
//   "EMAIL_SENDER_SMT_PASS",
//   "EMAIL_SENDER_SMTP_HOST",
//   "EMAIL_SENDER_SMTP_PORT",
//   "EMAIL_SENDER_SMTP_FROM",
//   "GOOGLE_CLIENT_ID",
//   "GOOGLE_CLIENT_SECRET",
//   "GOOGLE_CALLBACK_URL",
//   "FRONTEND_URL",
//   "CLOUDINARY_CLOUD_NAME",
//   "CLOUDINARY_API_KEY",
//   "CLOUDINARY_API_SECRET",
//   "STRIPE_SECRET_KEY",
//   "STRIPE_WEBHOOK_SECRET",
//   "SUPER_ADMIN_EMAIL",
//   "SUPER_ADMIN_PASSWORD",
// ];

// requiredEnv.forEach((variable) => {
//   if (!process.env[variable]) {
//     throw new AppError(
//       status.INTERNAL_SERVER_ERROR,
//       `Missing required environment variable: ${variable}`,
//     );
//   }
// });

export const config: IConfig = {
  NODE_ENV: process.env.NODE_ENV!,
  PORT: process.env.PORT!,
  DATABASE_URL: process.env.DATABASE_URL!,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL!,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
  EMAIL_SENDER_SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER!,
  EMAIL_SENDER_SMT_PASS: process.env.EMAIL_SENDER_SMT_PASS!,
  EMAIL_SENDER_SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST!,
  EMAIL_SENDER_SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT!,
  EMAIL_SENDER_SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM!,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL!,
  FRONTEND_URL: process.env.FRONTEND_URL!,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
  SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL!,
  SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD!,
};
