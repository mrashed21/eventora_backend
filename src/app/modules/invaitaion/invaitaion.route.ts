import { user_role } from "@prisma/client";
import express from "express";
import { check_auth } from "../../middleware/check-auth";
import { invaitation_controller } from "./invaitaion.controller";

const router = express.Router();

// owner invite create
router.post("/", check_auth(user_role.user), invaitation_controller.create);

// receiver own invitations
router.get(
  "/my",
  check_auth(user_role.user),
  invaitation_controller.get_my_invitations,
);

// sender own sent invitations
router.get(
  "/sent",
  check_auth(user_role.user),
  invaitation_controller.get_sent,
);

// specific event  invitation list (owner only)
router.get(
  "/event/:eventId",
  check_auth(user_role.user),
  invaitation_controller.get_event_invitations,
);

// receiver accept / reject
router.patch(
  "/:id/",
  check_auth(user_role.user),
  invaitation_controller.respond,
);

export const invitation_routes = router;
