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

export async function getCurrentSubscription(): Promise<CurrentSubscription | null> {
  const sb = await getSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: sub } = await sb
    .from("o_subscription")
    .select("plan, status, stripe_customer_id, stripe_subscription_id, current_period_end, cancel_at_period_end")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!sub) return { plan: "free", status: "active", stripe_customer_id: null, stripe_subscription_id: null, current_period_end: null, cancel_at_period_end: false };
  return sub as CurrentSubscription;
}

export async function userHasFeature(feature: FeatureId): Promise<boolean> {
  const sub = await getCurrentSubscription();
  if (!sub) return false;
  const active = ["active", "trialing"].includes(sub.status);
  if (!active && sub.plan !== "free") return planAllowsFeature("free", feature);
  return planAllowsFeature(sub.plan, feature);
}

export { PLANS, planAllowsFeature };
export type { FeatureId, PlanId };
