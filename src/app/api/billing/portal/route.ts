import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getStripe, stripeConfigured } from "@/lib/billing/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!stripeConfigured()) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  const sb = await getSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: sub } = await sb.from("o_subscription").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
  if (!sub?.stripe_customer_id) return NextResponse.json({ error: "No Stripe customer; subscribe first" }, { status: 409 });

  const stripe = getStripe();
  const origin = new URL(request.url).origin;
  const portal = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${origin}/billing`,
  });
  return NextResponse.json({ url: portal.url });
}
