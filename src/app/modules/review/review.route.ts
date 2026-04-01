import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { review_controller } from "./review.controller";
import { createReviewSchema, updateReviewSchema } from "./review.validation";

const router = express.Router();

// USER
router.post(
  "/",
  auth("USER"),
  validateRequest(createReviewSchema),
  review_controller.createReview,
);

router.get("/my", auth("USER"), review_controller.getMyReviews);

router.patch(
  "/:id",
  auth("USER"),
  validateRequest(updateReviewSchema),
  review_controller.updateMyReview,
);

router.delete("/:id", auth("USER"), review_controller.deleteMyReview);

// PUBLIC / EVENT
router.get("/event/:eventId", review_controller.getReviewsByEvent);

// OWNER / PUBLISHER
router.get(
  "/owner/events",
  auth("ADMIN", "MERCHANT", "USER"),
  review_controller.getOwnerAllEventReviews,
);

router.get(
  "/owner/event/:eventId",
  auth("ADMIN", "MERCHANT", "USER"),
  review_controller.getOwnerEventReviews,
);

// ADMIN
router.get("/admin/all", auth("ADMIN"), review_controller.getAllReviewsAdmin);

router.delete("/admin/:id", auth("ADMIN"), review_controller.deleteReviewAdmin);

export const review_routes = router;
