import { user_role } from "@prisma/client";
import express from "express";
import { check_auth } from "../../middleware/check-auth";
import { validate_request } from "../../middleware/validate-request";
import { review_controller } from "./review.controller";
import { createReviewSchema, updateReviewSchema } from "./review.validation";

const router = express.Router();

// USER
router.post(
  "/",
  check_auth(user_role.user),
  validate_request(createReviewSchema),
  review_controller.create,
);

router.get("/my", check_auth(user_role.user), review_controller.get_my_reviews);

router.patch(
  "/:id",
  check_auth(user_role.user),
  validate_request(updateReviewSchema),
  review_controller.update_my_review,
);

router.delete(
  "/:id",
  check_auth(user_role.user),
  review_controller.delete_my_review,
);

// PUBLIC / EVENT
router.get("/event/:eventId", review_controller.get_reviews_by_event);

// OWNER / PUBLISHER
router.get(
  "/owner/events",
  check_auth(user_role.user),
  review_controller.get_owner_all_event_reviews,
);



// ADMIN
router.get(
  "/admin/all",
  check_auth(user_role.admin , user_role.super_admin),
  review_controller.get_all_reviews_admin,
);

router.delete(
  "/admin/:id",
  check_auth(user_role.admin),
  review_controller.delete_review_admin,
);

export const review_routes = router;
