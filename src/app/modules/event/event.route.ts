import { user_role } from "@prisma/client";
import express from "express";
import { multer_upload } from "../../config/multer";
import { check_auth } from "../../middleware/check-auth";
import { validate_request } from "../../middleware/validate-request";
import { event_controller } from "./event.controller";
import { create_event_schema, update_event_schema } from "./event.validation";
const router = express.Router();

// ! public

router
  .route("/")
  .get(event_controller.get_admin)
  .post(
    check_auth(user_role.user, user_role.admin, user_role.super_admin),
    multer_upload.single("file"),
    validate_request(create_event_schema),
    event_controller.create,
  );

//   !admin get
router
  .route("/admin")
  .get(
    check_auth(user_role.admin, user_role.super_admin),
    event_controller.get_admin,
  );

// !get for user
router
  .route("/user")
  .get(
    check_auth(user_role.user, user_role.admin, user_role.super_admin),
    event_controller.get_admin,
  );

router
  .route("/:id")
  .get(event_controller.create)
  .patch(
    check_auth(user_role.user, user_role.admin, user_role.super_admin),
    multer_upload.single("file"),
    validate_request(update_event_schema),
    event_controller.update,
  )
  .delete(
    check_auth(user_role.user, user_role.admin, user_role.super_admin),
    event_controller.delete,
  );

export const event_routes = router;
