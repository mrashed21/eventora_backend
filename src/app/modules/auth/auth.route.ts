import express from "express";
import { user_role } from "../../../generated/prisma/enums";
import { check_auth } from "../../middleware/check-auth";
import { auth_controller } from "./auth.controller";

const router = express.Router();

router.route("/register").post(auth_controller.register);

router.route("/login").post(auth_controller.login);
router.route("/verify").post(auth_controller.verify);
router
  .route("/me")
  .get(
    check_auth(user_role.admin, user_role.super_admin, user_role.user),
    auth_controller.get_me,
  );

router.route("/new_token").post(
  // check_auth(user_role.admin, user_role.super_admin, user_role.user),
  auth_controller.new_token,
);
router
  .route("/logout")
  .post(
    check_auth(user_role.admin, user_role.super_admin, user_role.user),
    auth_controller.logout,
  );

router
  .route("/change_password")
  .post(
    check_auth(user_role.admin, user_role.super_admin, user_role.user),
    auth_controller.change_password,
  );

router.route("/forget_password").post(auth_controller.forget_password);
router.route("/reset_password").post(auth_controller.reset_password);

router.route("/login/google").get(auth_controller.google_login);

router.route("/google/success").get(auth_controller.google_login_success);

router.route("/oauth/error").get(auth_controller.handle_oAuth_error);

export const auth_routes = router;
