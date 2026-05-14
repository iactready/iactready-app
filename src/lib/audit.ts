import Anthropic from "@anthropic-ai/sdk";
import { serverEnv } from "./env";
import type { RiskTier, Obligation } from "./classifier";

let _client: Anthropic | null = null;
function getClient() {
  if (!serverEnv.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not configured");
  if (!_client) _client = new Anthropic({ apiKey: serverEnv.ANTHROPIC_API_KEY });
  return _client;
}

export interface InterviewAnswers {
  business_description: string;
  content_creation: { uses: boolean; details: string };
  decisions_on_people: { uses: boolean; details: string };
  customer_chatbot: { uses: boolean; details: string };
  biometric_or_camera: { uses: boolean; details: string };
  other_advanced_tech: { uses: boolean; details: string };
}

export interface OrgContext {
  name: string;
  country: string;
}

export interface DetectedSystem {
  name: string;
  description: string;
  category: string | null;
  provider: string | null;
  in_house: boolean;
  operates_on_personal_data: boolean;
  affects_individuals: boolean;
  human_oversight: string | null;
  countries_of_operation: string[];
  risk_tier: RiskTier;
  reasoning: string;
  obligations: Obligation[];
  flagged_concerns: string[];
}

export interface AuditResult {
  ai_systems: DetectedSystem[];
  summary: string;
  /** Set when ai_systems is empty: explains why we did not detect AI uses. */
  no_systems_found_explanation: string | null;
}

const SYSTEM_PROMPT = `Eres un consultor experto en EU AI Act (Reglamento (UE) 2024/1689), especializado en auditar PYMEs y autónomos españoles. Tu cliente NO sabe jerga técnica.

Tu tarea: analizar respuestas en lenguaje natural y extraer la lista de sistemas de IA que el negocio usa REALMENTE, clasificándolos bajo el AI Act.

REGLAS DE EXTRACCIÓN:

1. Identifica cada sistema de IA DISTINTO como una entrada independiente. Si el cliente menciona "uso ChatGPT para escribir correos y un chatbot en mi web", son DOS sistemas.

2. NO inventes sistemas. Si el cliente dice "no uso nada de eso", no metas nada.

3. Software tradicional NO es IA. Excel, Word, Photoshop básico, Mailchimp básico, Stripe, contabilidad NO cuentan. Solo cuenta si hay aprendizaje automático, generación de contenido, decisiones automáticas, o reconocimiento.

4. Cuando dudes, INCLUYE el sistema con flagged_concerns explicando qué hace falta confirmar. Mejor un falso positivo que dejar fuera una obligación legal.

5. Asígnale a cada sistema un nombre en CASTELLANO PLANO. NO uses jerga. USA "Asistente para redactar emails" o "Buscador inteligente de la web".

CLASIFICACIÓN BAJO AI ACT:

- prohibited (Art. 5): social scoring por administraciones, categorización biométrica por raza/religión/orientación, reconocimiento facial sin direccionar, inferencia de emociones en trabajo/escuela, identificación biométrica remota en tiempo real en espacios públicos, manipulación subliminal, predicción de criminalidad por perfilado.
- high (Art. 6 + Anexo III): RRHH y selección (CV screening, evaluación de empleados, decisiones de despido), scoring crediticio o de seguros que afecta a acceso a servicios, educación/admisión, infraestructura crítica, fuerzas del orden, migración, justicia, biometría de identificación.
- limited (Art. 50, transparencia): chatbots que hablan con personas, generación de contenido sintético (texto/imagen/audio/video) — deepfakes, reconocimiento de emociones no prohibido, categorización biométrica no prohibida.
- minimal: todo lo demás (filtros antispam, recomendadores de producto sin perfilado profundo, optimización operativa interna).

IMPORTANTE: El Art. 4 (alfabetización en IA) aplica SIEMPRE a TODO sistema de IA, vigente desde 2 feb 2025. Inclúyelo SIEMPRE en obligations.

FORMATO DE SALIDA — JSON ESTRICTAMENTE, sin markdown, sin texto adicional:

{
  "ai_systems": [
    {
      "name": "<nombre descriptivo en castellano plano>",
      "description": "<2-3 frases describiendo qué hace ESTE sistema en este negocio>",
      "category": "<categoría: generador de contenido | chatbot | recomendador | screening de personas | scoring | reconocimiento biométrico | análisis predictivo | otro>",
      "provider": "<si el cliente mencionó proveedor, ponlo; si no, null>",
      "in_house": false,
      "operates_on_personal_data": <true|false>,
      "affects_individuals": <true|false>,
      "human_oversight": "<texto si el cliente lo explicó, si no null>",
      "countries_of_operation": ["ES"],
      "risk_tier": "prohibited" | "high" | "limited" | "minimal",
      "reasoning": "<2 párrafos en español castellano explicando POR QUÉ esta clasificación con cita a artículos. Habla al dueño del negocio en plano.>",
      "obligations": [
        {"article": "Art. 4", "title": "Alfabetización en IA", "summary": "<frase concreta para ESTE negocio>", "deadline": "2 feb 2025"}
      ],
      "flagged_concerns": ["<preguntas o aspectos a revisar>"]
    }
  ],
  "summary": "<1 párrafo en castellano, 3-5 frases, resumen ejecutivo para el dueño del negocio. Habla en segunda persona. Sin jerga.>",
  "no_systems_found_explanation": "<solo si ai_systems vacío: explica por qué. Si hay sistemas, déjalo en null>"
}`;

export async function auditBusiness(org: OrgContext, answers: InterviewAnswers): Promise<AuditResult> {
  const userMessage = `Audita este negocio y devuelve el JSON.

**Negocio**: ${org.name} (${org.country})

**Pregunta 1 — ¿A qué te dedicas?**
${answers.business_description || "(sin responder)"}

**Pregunta 2 — ¿Usas apps para crear contenido (textos, imágenes, vídeos, posts)?**
${answers.content_creation.uses ? `Sí. ${answers.content_creation.details}` : "No."}

**Pregunta 3 — ¿Algún programa decide cosas sobre personas en tu negocio?**
${answers.decisions_on_people.uses ? `Sí. ${answers.decisions_on_people.details}` : "No."}

**Pregunta 4 — ¿Tienes chatbot o asistente automático que hable con clientes?**
${answers.customer_chatbot.uses ? `Sí. ${answers.customer_chatbot.details}` : "No."}

**Pregunta 5 — ¿Usas reconocimiento facial, biométrico o cámaras inteligentes?**
${answers.biometric_or_camera.uses ? `Sí. ${answers.biometric_or_camera.details}` : "No."}

**Pregunta 6 — ¿Algo más con tecnología avanzada?**
${answers.other_advanced_tech.uses ? `Sí. ${answers.other_advanced_tech.details}` : "No."}

Devuelve SOLO el JSON.`;

  const client = getClient();
  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  const stripped = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();

  let parsed: AuditResult;
  try {
    parsed = JSON.parse(stripped) as AuditResult;
  } catch (err) {
    throw new Error(`Audit returned non-JSON: ${stripped.slice(0, 300)}... (${err instanceof Error ? err.message : err})`);
  }
  if (!Array.isArray(parsed.ai_systems)) parsed.ai_systems = [];
  if (!parsed.summary) parsed.summary = "";
  if (parsed.no_systems_found_explanation === undefined) parsed.no_systems_found_explanation = null;
  return parsed;
}
