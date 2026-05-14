import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, stripeConfigured } from "@/lib/billing/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { getPlanByPriceId, type PlanId } from "@/lib/billing/plans";
import { serverEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    console.error("[stripe webhook] signature failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  const { data: existing } = await admin
    .from("o_billing_event")
    .select("id")
    .eq("stripe_event_id", event.id)
    .maybeSingle();
  if (existing) return NextResponse.json({ ok: true, duplicate: true });

  let userId: string | null = null;
  try {
    if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
      userId = await handleSub(event.data.object as Stripe.Subscription, admin);
    } else if (event.type === "customer.subscription.deleted") {
      userId = await handleSubDeleted(event.data.object as Stripe.Subscription, admin);
    } else if (event.type === "checkout.session.completed") {
      userId = await handleCheckout(event.data.object as Stripe.Checkout.Session, admin);
    }
  } catch (err) {
    console.error("[stripe webhook] handler threw:", event.type, err);
    await admin.from("o_billing_event").insert({
      stripe_event_id: event.id, type: event.type, user_id: userId,
      payload: { error: err instanceof Error ? err.message : String(err) },
    });
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  await admin.from("o_billing_event").insert({
    stripe_event_id: event.id, type: event.type, user_id: userId,
    payload: event as unknown as Record<string, unknown>,
  });
  return NextResponse.json({ ok: true });
}

type AdminClient = ReturnType<typeof getSupabaseAdminClient>;

async function handleSub(sub: Stripe.Subscription, admin: AdminClient): Promise<string | null> {
  const userId = (sub.metadata?.user_id as string | undefined) ?? null;
  if (!userId) return null;
  const priceId = sub.items.data[0]?.price.id ?? null;
  const plan = (getPlanByPriceId(priceId) ?? "free") as PlanId;
  await admin.from("o_subscription").update({
    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    stripe_subscription_id: sub.id,
    plan,
    status: sub.status,
    current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    cancel_at_period_end: sub.cancel_at_period_end,
    trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
  }).eq("user_id", userId);
  return userId;
}

async function handleSubDeleted(sub: Stripe.Subscription, admin: AdminClient): Promise<string | null> {
  const userId = (sub.metadata?.user_id as string | undefined) ?? null;
  if (!userId) return null;
  await admin.from("o_subscription").update({
    plan: "free", status: "canceled", stripe_subscription_id: null, cancel_at_period_end: false,
  }).eq("user_id", userId);
  return userId;
}

async function handleCheckout(session: Stripe.Checkout.Session, admin: AdminClient): Promise<string | null> {
  const userId = (session.metadata?.user_id as string | undefined) ?? null;
  if (!userId) return null;
  if (session.customer) {
    const customerId = typeof session.customer === "string" ? session.customer : session.customer.id;
    await admin.from("o_subscription").update({ stripe_customer_id: customerId }).eq("user_id", userId);
  }
  return userId;
}
