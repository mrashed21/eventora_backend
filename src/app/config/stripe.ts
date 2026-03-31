import Stripe from "stripe";
import { config } from "./config";

export const stripe = new Stripe(config.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-02-25.clover",
});
