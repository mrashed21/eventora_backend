import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import path from "path";
import qs from "qs";
import { config } from "./app/config/config";
import { global_error_handler } from "./app/middleware/globar-error";
import { not_found } from "./app/middleware/not-found";
import router from "./app/routers/router";

const app: Application = express();

app.set("query parser", (str: string) => qs.parse(str));

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),

  // PaymentController.handleStripeWebhookEvent
);

app.use(
  cors({
    origin: [
      config.FRONTEND_URL,
      config.BETTER_AUTH_URL,
      "http://localhost:3000",
      "http://localhost:5000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

//! Mount the auth routes using better-auth's toNodeHandler
// app.use("/api/auth", toNodeHandler(auth));

//! Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

//! Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

// ! all routes with version
app.use("/api/v1", router);

//! Basic route
app.get("/", async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "event ora server is working",
  });
});

app.use(global_error_handler);
app.use(not_found);

export default app;
