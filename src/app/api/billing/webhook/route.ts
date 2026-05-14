import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, stripeConfigured } from "@/lib/billing/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { getPlanByPriceId } from "@/lib/billing/plans";
import { serverEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HANDLED_TYPES = new Set<string>([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
]);

/**
 * POST /api/billing/webhook
 *
 * Stripe webhook receiver. Validates the signature, then upserts the
 * subscription row by org_id. Idempotent: we log every event in
 * billing_events and short-circuit if we have already processed the ID.
 */
export async function POST(request: Request) {
  if (!stripeConfigured() || !serverEnv.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const raw = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, serverEnv.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();

  // Idempotency: skip if we've already seen this event.
  const { data: existing } = await admin
    .from("billing_events")
    .select("id")
    .eq("stripe_event_id", event.id)
    .maybeSingle();
  if (existing) return NextResponse.json({ ok: true, duplicate: true });

  let orgId: string | null = null;
  try {
    if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
      orgId = await handleSubscriptionEvent(event.data.object as Stripe.Subscription, admin);
    } else if (event.type === "customer.subscription.deleted") {
      orgId = await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, admin);
    } else if (event.type === "checkout.session.completed") {
      orgId = await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, admin);
    }
  } catch (err) {
    console.error("[stripe webhook] handler threw:", event.type, err);
    // Still record the event so we don't loop, but return 500 so Stripe retries.
    await admin.from("billing_events").insert({
      stripe_event_id: event.id,
      type: event.type,
      org_id: orgId,
      payload: { error: err instanceof Error ? err.message : String(err), event: event as unknown as Record<string, unknown> },
    });
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  await admin.from("billing_events").insert({
    stripe_event_id: event.id,
    type: event.type,
    org_id: orgId,
    payload: event as unknown as Record<string, unknown>,
  });

  return NextResponse.json({ ok: true, handled: HANDLED_TYPES.has(event.type) });
}

type AdminClient = ReturnType<typeof getSupabaseAdminClient>;

async function handleSubscriptionEvent(sub: Stripe.Subscription, admin: AdminClient): Promise<string | null> {
  const orgId = (sub.metadata?.org_id as string | undefined) ?? null;
  if (!orgId) {
    console.error("[stripe webhook] subscription event without org_id metadata", sub.id);
    return null;
  }
  const priceId = sub.items.data[0]?.price.id ?? null;
  const plan = getPlanByPriceId(priceId) ?? "free";
  await admin.from("subscriptions").update({
    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    stripe_subscription_id: sub.id,
    plan,
    status: sub.status,
    current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    cancel_at_period_end: sub.cancel_at_period_end,
    trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
  }).eq("org_id", orgId);
  return orgId;
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription, admin: AdminClient): Promise<string | null> {
  const orgId = (sub.metadata?.org_id as string | undefined) ?? null;
  if (!orgId) return null;
  await admin.from("subscriptions").update({
    plan: "free",
    status: "canceled",
    stripe_subscription_id: null,
    cancel_at_period_end: false,
  }).eq("org_id", orgId);
  return orgId;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, admin: AdminClient): Promise<string | null> {
  const orgId = (session.metadata?.org_id as string | undefined) ?? null;
  if (!orgId) return null;
  // The subscription.created event will fire right after and do the heavy
  // lifting. We just make sure the customer_id is recorded.
  if (session.customer) {
    const customerId = typeof session.customer === "string" ? session.customer : session.customer.id;
    await admin.from("subscriptions").update({ stripe_customer_id: customerId }).eq("org_id", orgId);
  }
  return orgId;
}
