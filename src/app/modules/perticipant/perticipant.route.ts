import { user_role } from "@prisma/client";
import express from "express";
import { check_auth } from "../../middleware/check-auth";
import { perticipant_controller } from "./participant.controller";

const router = express.Router();

router.post("/", check_auth(user_role.user), perticipant_controller.register);

// user own
router.get(
  "/my",
  check_auth(user_role.user),
  perticipant_controller.get_my_participations,
);

// organizer approve / reject
router
  .route("/pending")
  .get(
    check_auth(user_role.user),
    perticipant_controller.get_pending_participants,
  );
router
  .route("/pending/:event_id")
  .patch(
    check_auth(user_role.user),
    perticipant_controller.approve_participant,
  );

export const perticipant_routes = router;
