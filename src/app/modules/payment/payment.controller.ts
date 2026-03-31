import { Request, Response } from "express";
import { config } from "../../config/config";
import { stripe } from "../../config/stripe";
import { payment_service } from "./payment.service";

export const payment_controller = {
  webhook: async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];

    if (!sig) {
      return res.status(400).send("Missing stripe-signature header");
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === "checkout.session.completed") {
        await payment_service.handle_checkout_completed(event.data.object);
      }

      if (event.type === "checkout.session.expired") {
        await payment_service.handle_checkout_expired(event.data.object);
      }

      return res.status(200).json({ received: true });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Webhook processing failed",
      });
    }
  },
};
