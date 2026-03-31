// import { Request, Response } from "express";
// import status from "http-status";
// import { config } from "../../config/config";
// import { stripe } from "../../config/stripe";
// import api_error from "../../error-helper/api-error";
// import { payment_service } from "./payment.service";

// export const payment_controller = {
//   webhook: async (req: Request, res: Response) => {
//     console.log("🔥 WEBHOOK HIT");
//     const sig = req.headers["stripe-signature"];

//     if (!sig) {
//       throw new api_error(
//         status.BAD_REQUEST,
//         "Missing stripe-signature header",
//       );
//     }

//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(
//         req.body,
//         sig,
//         config.STRIPE_WEBHOOK_SECRET,
//       );
//     } catch (err: any) {
//       console.error("Stripe webhook signature error:", err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     try {
//       if (event.type === "checkout.session.completed") {
//         await payment_service.handle_checkout_completed(event.data.object);
//       }

//       if (event.type === "checkout.session.expired") {
//         await payment_service.handle_checkout_expired(event.data.object);
//       }

//       return res.status(200).json({ received: true });
//     } catch (error: any) {
//       console.error("Webhook processing failed:", error);
//       return res.status(500).json({
//         success: false,
//         message: error.message || "Webhook processing failed",
//       });
//     }
//   },
// };

import { Request, Response } from "express";
import { config } from "../../config/config";
import { stripe } from "../../config/stripe";
import { payment_service } from "./payment.service";

export const payment_controller = {
  webhook: async (req: Request, res: Response) => {
    console.log("🔥 STRIPE WEBHOOK HIT");
    console.log("👉 Is Buffer:", Buffer.isBuffer(req.body));
    console.log("👉 Signature:", req.headers["stripe-signature"]);

    const sig = req.headers["stripe-signature"];

    if (!sig) {
      console.error("❌ Missing stripe-signature header");
      return res.status(400).send("Missing stripe-signature header");
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.STRIPE_WEBHOOK_SECRET,
      );
      console.log("✅ Stripe Event Verified:", event.type);
    } catch (err: any) {
      console.error("❌ Stripe webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === "checkout.session.completed") {
        console.log("🎯 checkout.session.completed received");
        await payment_service.handle_checkout_completed(event.data.object);
      }

      if (event.type === "checkout.session.expired") {
        console.log("⚠️ checkout.session.expired received");
        await payment_service.handle_checkout_expired(event.data.object);
      }

      return res.status(200).json({ received: true });
    } catch (error: any) {
      console.error("❌ Webhook processing failed:");
      console.error("MESSAGE:", error?.message);
      console.error("STACK:", error?.stack);
      console.error("FULL ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Webhook processing failed",
      });
    }
  },
};
