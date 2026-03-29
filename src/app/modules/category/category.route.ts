import express from "express";
// import { user_role } from "../../../generated/prisma/enums";
import { user_role } from "@prisma/client";
import { multer_upload } from "../../config/multer";
import { check_auth } from "../../middleware/check-auth";
import { validate_request } from "../../middleware/validate-request";
import { category_controller } from "./category.controller";
import {
  create_category_schema,
  update_category_schema,
} from "./category.validation";
const router = express.Router();
// !home
router
  .route("/home")
  .get(category_controller.home)


// ! get for admin
router
  .route("/admin")
  .get(
    check_auth(user_role.admin, user_role.super_admin),
    category_controller.get_admin,
  );

router
  .route("/")
  .get(category_controller.get)
  .post(
    check_auth(user_role.admin, user_role.super_admin),
    multer_upload.single("category_image"),
    validate_request(create_category_schema),
    category_controller.create,
  );

router
  .route("/:id")
  .patch(
    check_auth(user_role.admin, user_role.super_admin),
    multer_upload.single("category_image"),
    validate_request(update_category_schema),
    category_controller.update,
  )
  .delete(
    check_auth(user_role.admin, user_role.super_admin),
    category_controller.delete,
  );
export const category_routes = router;
