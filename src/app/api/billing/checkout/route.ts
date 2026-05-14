import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";
import { getStripe, stripeConfigured } from "@/lib/billing/stripe";
import { PLANS, type PlanId } from "@/lib/billing/plans";

const schema = z.object({
  plan: z.enum(["monthly", "annual"]),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/billing/checkout
 * Body: { plan: "monthly" | "annual" }
 *
 * Creates a Stripe Checkout Session for the user's Opositor subscription.
 */
export async function POST(request: Request) {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const sb = await getSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const planId: PlanId = parsed.data.plan;
  const plan = PLANS[planId];
  if (!plan.stripe_price_id) {
    return NextResponse.json({ error: `Plan ${planId} has no Stripe price configured` }, { status: 503 });
  }

  // Load opositor subscription (auto-created on signup by trigger).
  const { data: sub } = await sb
    .from("o_subscription")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const stripe = getStripe();
  const origin = new URL(request.url).origin;

  // Re-use existing Stripe customer if we have one.
  let customerId = sub?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { user_id: user.id, product: "iactready-opositor" },
    });
    customerId = customer.id;
    const admin = getSupabaseAdminClient();
    await admin.from("o_subscription").update({ stripe_customer_id: customerId }).eq("user_id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
    success_url: `${origin}/billing?session={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?canceled=1`,
    allow_promotion_codes: true,
    automatic_tax: { enabled: true },
    customer_update: { address: "auto", name: "auto" },
    tax_id_collection: { enabled: true },
    metadata: { user_id: user.id, plan: planId, product: "iactready-opositor" },
    subscription_data: { metadata: { user_id: user.id, plan: planId, product: "iactready-opositor" } },
  });

  return NextResponse.json({ url: session.url });
}
