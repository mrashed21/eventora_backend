import express from "express";
import { user_role } from "../../../generated/prisma/enums";
import { check_auth } from "../../middleware/check-auth";
import { validate_request } from "../../middleware/validate-request";
import { admin_controller } from "./admin.controller";
import { create_admin_schema, update_admin_schema } from "./admin.validation";
const router = express.Router();

// ! get for admin

router
  .route("/")
  .get(admin_controller.get_admin)
  .post(
    check_auth(user_role.admin, user_role.super_admin),
    validate_request(create_admin_schema),
    admin_controller.create,
  );

router
  .route("/:id")
  .patch(
    check_auth(user_role.admin, user_role.super_admin),
    validate_request(update_admin_schema),
    admin_controller.update,
  )
  .put(
    check_auth(user_role.admin, user_role.super_admin),
    admin_controller.delete,
  );
export const admin_routes = router;
