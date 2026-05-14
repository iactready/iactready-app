/**
 * Subscription plans for iActReady Opositor.
 *
 * Free: 10 questions/day, basic stats.
 * Monthly €19.99: unlimited questions, mock exams, full stats.
 * Annual €179: same as Monthly, -25% vs paying monthly.
 */

export type PlanId = "free" | "monthly" | "annual";

export type FeatureId =
  | "unlimited_questions"   // remove the daily cap
  | "mock_exams"            // weekly 100-question simulacros
  | "full_stats"            // per-topic, streak, time-spent charts
  | "explanations"          // AI explanations of correct + incorrect answers
  | "adaptive_plan";        // study plan that re-prioritizes weak topics

export interface PlanDef {
  id: PlanId;
  name: string;
  tagline: string;
  price_eur: number;
  /** "month" or "year" — used in the UI suffix. */
  interval: "month" | "year" | "trial";
  stripe_price_id: string | null;
  features: FeatureId[];
  bullets: string[];
  highlight?: boolean;
}

export const PLANS: Record<PlanId, PlanDef> = {
  free: {
    id: "free",
    name: "Gratis",
    tagline: "Prueba la herramienta. Sin tarjeta.",
    price_eur: 0,
    interval: "trial",
    stripe_price_id: null,
    features: ["explanations"],
    bullets: [
      "10 preguntas al día con explicación",
      "Tu progreso básico",
      "Sin tarjeta, sin compromiso",
    ],
  },
  monthly: {
    id: "monthly",
    name: "Mensual",
    tagline: "Para opositores que estudian todos los días.",
    price_eur: 19.99,
    interval: "month",
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY ?? null,
    features: ["unlimited_questions", "mock_exams", "full_stats", "explanations", "adaptive_plan"],
    bullets: [
      "Preguntas ilimitadas",
      "Plan de estudio personalizado adaptativo",
      "Simulacros tipo examen oficial (100 preguntas, cronometrado)",
      "Estadísticas por tema, racha, tiempo",
      "Explicación de cada pregunta",
      "Cancela cuando quieras",
    ],
    highlight: true,
  },
  annual: {
    id: "annual",
    name: "Anual",
    tagline: "Para los que se lo toman en serio. Ahorra 25%.",
    price_eur: 179,
    interval: "year",
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL ?? null,
    features: ["unlimited_questions", "mock_exams", "full_stats", "explanations", "adaptive_plan"],
    bullets: [
      "Todo lo del plan Mensual",
      "Equivalente a €14.92/mes (25% descuento)",
      "Pago único anual",
      "Compromiso con tu plaza",
    ],
  },
};

export function planAllowsFeature(plan: PlanId, feature: FeatureId): boolean {
  return PLANS[plan]?.features.includes(feature) ?? false;
}

export function getPlanByPriceId(priceId: string | null | undefined): PlanId | null {
  if (!priceId) return null;
  for (const p of Object.values(PLANS)) {
    if (p.stripe_price_id === priceId) return p.id;
  }
  return null;
}
