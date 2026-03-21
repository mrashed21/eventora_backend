import express from "express";

const router = express.Router();

router.route("/");

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
