import Stripe from "stripe";
import { serverEnv } from "../env";

let _client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!serverEnv.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY not configured");
  }
  if (!_client) {
    _client = new Stripe(serverEnv.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
      typescript: true,
      appInfo: { name: "iActReady", version: "0.1.0", url: "https://iactready.com" },
    });
  }
  return _client;
}

export function stripeConfigured(): boolean {
  return !!serverEnv.STRIPE_SECRET_KEY;
}
