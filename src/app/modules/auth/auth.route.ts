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

// router
//   .route("/merchant")
//   .get(
//     verify("merchant_withdraw_show", "merchant"),
//     MerchantWithdrowController.get,
//   )
//   .patch(
//     verify("merchant_withdraw_update", "merchant"),
//     FileUploadHelper.ImageUpload.any(),
//     MerchantWithdrowController.update,
//   )
//   .delete(
//     verify("merchant_withdraw_delete", "merchant"),
//     MerchantWithdrowController.delete,
//   );

export const auth_routes = router;
