import { user_role } from "@prisma/client";
import express from "express";
import { check_auth } from "../../middleware/check-auth";
import { stats_controller } from "./stats.controller";

const router = express.Router();

// other payment routes (if any)
router.get(
  "/admin",
  check_auth(user_role.admin, user_role.super_admin),
  stats_controller.admin,
);
router.get("/user", check_auth(user_role.user), stats_controller.user);

export const stats_routes = router;
