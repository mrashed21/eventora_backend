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

router.get(
  "/my/:event_id",
  check_auth(user_role.user),
  perticipant_controller.get_my_participation_status,
);

// organizer approve / reject
router.get(
  "/pending",
  check_auth(user_role.user),
  perticipant_controller.get_pending_participants,
);

router.patch(
  "/event/:event_id/:participant_id/approve",
  check_auth(user_role.user),
  perticipant_controller.approve_participant,
);

router.patch(
  "/event/:event_id/:participant_id/reject",
  check_auth(user_role.user),
  perticipant_controller.reject_participant,
);

export const perticipant_routes = router;
