import { getSupabaseServerClient } from "../supabase/server";
import { PLANS, planAllowsFeature, type FeatureId, type PlanId } from "./plans";

export interface CurrentSubscription {
  plan: PlanId;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

/**
 * Resolve the current user's subscription. Returns null if no org (user must
 * complete onboarding first).
 */
export async function getCurrentSubscription(): Promise<CurrentSubscription | null> {
  const sb = await getSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: org } = await sb.from("organizations").select("id").eq("owner_id", user.id).maybeSingle();
  if (!org) return null;
  const { data: sub } = await sb
    .from("subscriptions")
    .select("plan, status, stripe_customer_id, stripe_subscription_id, current_period_end, cancel_at_period_end")
    .eq("org_id", org.id)
    .maybeSingle();
  if (!sub) {
    // The DB trigger creates a free subscription on org insert; if it's still
    // missing we fall back to free.
    return { plan: "free", status: "active", stripe_customer_id: null, stripe_subscription_id: null, current_period_end: null, cancel_at_period_end: false };
  }
  return sub as CurrentSubscription;
}

/** True when the user can use this feature given their current plan + status. */
export async function userHasFeature(feature: FeatureId): Promise<boolean> {
  const sub = await getCurrentSubscription();
  if (!sub) return false;
  // Only active/trialing subs grant paid features; past_due/canceled keep free
  // tier only (still let them audit + view).
  const isPaidActive = ["active", "trialing"].includes(sub.status);
  if (!isPaidActive && sub.plan !== "free") {
    // Subscription lapsed → treat as free for gating.
    return planAllowsFeature("free", feature);
  }
  return planAllowsFeature(sub.plan, feature);
}

export { PLANS, planAllowsFeature };
export type { FeatureId, PlanId };
