import type { RiskTier } from "../classifier";

/** Identifier for each document we know how to generate. */
export type DocType =
  | "art4_literacy_policy"
  | "internal_ai_policy"
  | "registro_actividades_ia"
  | "art50_transparency_notice"
  | "art14_human_oversight"
  | "art9_risk_management"
  | "art10_data_governance"
  | "art13_information_to_persons"
  | "art19_fria"
  | "dpa_ai_vendor";

export interface DocSpec {
  id: DocType;
  title: string;
  /** One-line description used in the UI. */
  description: string;
  /** Which AI Act article(s) it covers (for the badge/tooltip). */
  citation: string;
  /** Approximate page count (used for the UI value prop). */
  approx_pages: number;
  /** When this doc applies. "any" = always. "tier:X" = only when system is in tier X. */
  applies_when: { tier?: RiskTier[]; conditions?: ("third_party_vendor" | "personal_data")[] };
  /** Order shown in UI (lower = earlier). */
  order: number;
}

/**
 * Catalog of compliance documents iActReady can generate.
 * Ordered roughly by universality (Art. 4 is for everyone, FRIA only for high-risk).
 */
export const DOC_CATALOG: Record<DocType, DocSpec> = {
  art4_literacy_policy: {
    id: "art4_literacy_policy",
    title: "Política interna de alfabetización en IA (Art. 4)",
    description: "Documento que define qué formación reciben tus empleados sobre cada IA que usáis. Obligatorio desde el 2 de febrero de 2025 para CUALQUIER organización que use IA.",
    citation: "Art. 4 — vigente desde 2 feb 2025",
    approx_pages: 5,
    applies_when: { tier: ["prohibited", "high", "limited", "minimal"] },
    order: 10,
  },
  internal_ai_policy: {
    id: "internal_ai_policy",
    title: "Política general de uso de IA en la empresa",
    description: "Reglas internas para tus empleados: qué pueden usar, qué datos pueden meter, qué decisiones pueden delegar en una IA. La auditoría AESIA mira esto.",
    citation: "Art. 4 + Art. 26 (deployer obligations)",
    approx_pages: 6,
    applies_when: { tier: ["prohibited", "high", "limited", "minimal"] },
    order: 20,
  },
  registro_actividades_ia: {
    id: "registro_actividades_ia",
    title: "Entrada en el Registro de Actividades de Tratamiento (RGPD Art. 30)",
    description: "Si tu IA procesa datos personales, tienes que tenerla anotada en tu RAT. Te genero el bloque listo para pegar en tu registro.",
    citation: "RGPD Art. 30 + AI Act Art. 26",
    approx_pages: 2,
    applies_when: { tier: ["prohibited", "high", "limited", "minimal"], conditions: ["personal_data"] },
    order: 30,
  },
  art50_transparency_notice: {
    id: "art50_transparency_notice",
    title: "Aviso de transparencia para usuarios finales (Art. 50)",
    description: "Texto + snippet HTML para tu web/app que comunica al usuario que está interactuando con una IA, o que el contenido lo ha generado una IA. Obligatorio para chatbots, generadores de contenido, deepfakes.",
    citation: "Art. 50 — aplicación 2 ago 2026",
    approx_pages: 3,
    applies_when: { tier: ["limited"] },
    order: 40,
  },
  art14_human_oversight: {
    id: "art14_human_oversight",
    title: "Plan de supervisión humana (Art. 14)",
    description: "Describe quién revisa las decisiones de la IA, con qué frecuencia, qué umbral activa la revisión, y qué pasa si la persona supervisora detecta un error. Específico para sistemas de alto riesgo.",
    citation: "Art. 14 — aplicación 2 ago 2026",
    approx_pages: 5,
    applies_when: { tier: ["high"] },
    order: 50,
  },
  art9_risk_management: {
    id: "art9_risk_management",
    title: "Sistema de gestión de riesgos (Art. 9)",
    description: "Análisis sistemático de los riesgos del sistema IA (a quién daña si falla, cuál es el peor caso, cómo lo mitigas). Documento vivo que actualizas cuando cambia el sistema.",
    citation: "Art. 9 — aplicación 2 ago 2026",
    approx_pages: 10,
    applies_when: { tier: ["high"] },
    order: 60,
  },
  art10_data_governance: {
    id: "art10_data_governance",
    title: "Gobernanza de datos (Art. 10)",
    description: "Origen de los datos de entrenamiento, sesgos detectados, medidas de calidad, cobertura geográfica/demográfica. Si tu IA es de tercero (ChatGPT, etc.), redirige al proveedor.",
    citation: "Art. 10 — aplicación 2 ago 2026",
    approx_pages: 5,
    applies_when: { tier: ["high"] },
    order: 70,
  },
  art13_information_to_persons: {
    id: "art13_information_to_persons",
    title: "Información a personas afectadas (Art. 13)",
    description: "Texto formal en lenguaje claro que tienes que entregar a la persona sobre la que la IA decide algo (un candidato, un solicitante de crédito…). Su derecho a entenderlo.",
    citation: "Art. 13 — aplicación 2 ago 2026",
    approx_pages: 3,
    applies_when: { tier: ["high"] },
    order: 80,
  },
  art19_fria: {
    id: "art19_fria",
    title: "Evaluación de impacto en derechos fundamentales (FRIA, Art. 19)",
    description: "Análisis previo al despliegue de qué derechos fundamentales puede vulnerar tu sistema (no discriminación, privacidad, dignidad). Obligatorio en sectores como crédito, RRHH, justicia.",
    citation: "Art. 19 — aplicación 2 ago 2026",
    approx_pages: 8,
    applies_when: { tier: ["high"] },
    order: 90,
  },
  dpa_ai_vendor: {
    id: "dpa_ai_vendor",
    title: "Acuerdo de Encargo de Tratamiento (DPA) para proveedor IA",
    description: "Plantilla DPA específica para servicios de IA (OpenAI, Anthropic, etc.) que te permite controlar qué hace tu proveedor con los datos personales que le mandas.",
    citation: "RGPD Art. 28 + AI Act Art. 26.5",
    approx_pages: 6,
    applies_when: { tier: ["high", "limited"], conditions: ["third_party_vendor", "personal_data"] },
    order: 100,
  },
};

export interface SystemContext {
  risk_tier: RiskTier;
  in_house: boolean;
  operates_on_personal_data: boolean;
}

/** Filter the catalog to the docs that apply to a given AI system. */
export function applicableDocs(ctx: SystemContext): DocSpec[] {
  return Object.values(DOC_CATALOG)
    .filter((doc) => {
      // Tier check
      if (doc.applies_when.tier && !doc.applies_when.tier.includes(ctx.risk_tier)) return false;
      // Conditions
      const conditions = doc.applies_when.conditions || [];
      if (conditions.includes("personal_data") && !ctx.operates_on_personal_data) return false;
      if (conditions.includes("third_party_vendor") && ctx.in_house) return false;
      return true;
    })
    .sort((a, b) => a.order - b.order);
}
