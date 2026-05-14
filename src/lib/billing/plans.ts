/**
 * Subscription plans. Stripe price IDs come from env vars so we can rotate
 * test → live without code changes.
 */

export type PlanId = "free" | "autonomo" | "pyme" | "business";

export type FeatureId =
  | "audit"                  // run the conversational audit
  | "view_classification"    // see risk tiers + reasoning
  | "download_docs"          // export PDF/DOCX of obligations
  | "regulatory_alerts"      // weekly digest of EU AI Act updates
  | "training_basic"         // single-user AI literacy course
  | "training_tracking"      // per-employee training certificates
  | "dpa_templates"          // DPA generator for vendors
  | "multi_user"             // invite colleagues to the org
  | "audit_log_export"       // CSV/JSON export of evidence trail
  | "human_support";         // chat + 1:1 review

export interface PlanDef {
  id: PlanId;
  name: string;
  tagline: string;
  price_eur_monthly: number;
  /** Stripe Price ID for the monthly recurring subscription. */
  stripe_price_id: string | null;
  features: FeatureId[];
  /** UI-only: short bullets shown on the pricing page. */
  bullets: string[];
  highlight?: boolean;
}

export const PLANS: Record<PlanId, PlanDef> = {
  free: {
    id: "free",
    name: "Gratis",
    tagline: "Audita tu negocio en 3 minutos. Mira qué obligaciones te aplican.",
    price_eur_monthly: 0,
    stripe_price_id: null,
    features: ["audit", "view_classification"],
    bullets: [
      "Auditoría IA de tu negocio",
      "Clasificación bajo AI Act (Anexo III, Art. 5, Art. 50)",
      "Lista de obligaciones legales que te aplican",
      "Sin tarjeta",
    ],
  },
  autonomo: {
    id: "autonomo",
    name: "Autónomo",
    tagline: "Para autónomos y micro-empresas (1-10 personas).",
    price_eur_monthly: 29,
    stripe_price_id: process.env.STRIPE_PRICE_AUTONOMO ?? null,
    features: [
      "audit",
      "view_classification",
      "download_docs",
      "training_basic",
      "regulatory_alerts",
    ],
    bullets: [
      "Todo lo de Gratis +",
      "Documentación legal descargable (PDF/DOCX)",
      "Curso AI literacy + certificado individual",
      "Alertas regulatorias semanales (AESIA, AEPD, EU)",
      "Re-clasifica nuevas IAs ilimitadas veces",
    ],
    highlight: true,
  },
  pyme: {
    id: "pyme",
    name: "PYME",
    tagline: "Para PYMEs (11-50 empleados).",
    price_eur_monthly: 99,
    stripe_price_id: process.env.STRIPE_PRICE_PYME ?? null,
    features: [
      "audit",
      "view_classification",
      "download_docs",
      "training_basic",
      "training_tracking",
      "regulatory_alerts",
      "dpa_templates",
      "multi_user",
    ],
    bullets: [
      "Todo lo de Autónomo +",
      "Tracking de formación por empleado (certificados)",
      "Plantilla DPA para tus proveedores IA",
      "Multi-usuario (invita a tu equipo)",
      "Generador de Registro de Tratamientos (RGPD Art. 30)",
    ],
  },
  business: {
    id: "business",
    name: "Business",
    tagline: "Para empresas con compliance crítico (50-250 empleados).",
    price_eur_monthly: 299,
    stripe_price_id: process.env.STRIPE_PRICE_BUSINESS ?? null,
    features: [
      "audit",
      "view_classification",
      "download_docs",
      "training_basic",
      "training_tracking",
      "regulatory_alerts",
      "dpa_templates",
      "multi_user",
      "audit_log_export",
      "human_support",
    ],
    bullets: [
      "Todo lo de PYME +",
      "Export del audit log (preparado para inspector)",
      "Soporte humano por chat + revisión 1:1 mensual",
      "Plantillas multi-jurisdicción (ES, PT, FR, IT, DE)",
      "Onboarding asistido",
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
