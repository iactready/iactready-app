import Anthropic from "@anthropic-ai/sdk";
import { serverEnv } from "./env";
import { classifyAiSystem, type RiskTier, type Obligation, type ClassifierInput } from "./classifier";

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

interface ExtractedSystem {
  name: string;
  description: string;
  category: string | null;
  provider: string | null;
  in_house: boolean;
  operates_on_personal_data: boolean;
  affects_individuals: boolean;
  human_oversight: string | null;
  countries_of_operation: string[];
}

interface ExtractResult {
  ai_systems: ExtractedSystem[];
  summary: string;
  no_systems_found_explanation: string | null;
}

export interface DetectedSystem extends ExtractedSystem {
  risk_tier: RiskTier;
  reasoning: string;
  obligations: Obligation[];
  flagged_concerns: string[];
}

export interface AuditResult {
  ai_systems: DetectedSystem[];
  summary: string;
  no_systems_found_explanation: string | null;
}

const EXTRACT_PROMPT = `Eres un consultor experto en EU AI Act, especializado en auditar PYMEs y autónomos españoles.

Tu tarea: leer las respuestas de un cuestionario en lenguaje natural y devolver SOLO la estructura de los sistemas de IA que el negocio usa. NO clasifiques, NO listes obligaciones. Solo identifica.

REGLAS:

1. Cada sistema de IA DISTINTO = una entrada. Si menciona "ChatGPT para descripciones y para emails", probablemente es 1 sistema (1 herramienta usada para múltiples cosas).

2. NO inventes. Si dice "no uso nada", no metas nada.

3. Software tradicional NO es IA: Excel, Word, Mailchimp básico, Stripe, contabilidad, Shopify base. Solo cuenta si hay aprendizaje automático, generación de contenido, decisiones automáticas, o reconocimiento.

4. Cuando dudes, INCLUYE el sistema (mejor falso positivo que dejar fuera una obligación legal).

5. Nombres en CASTELLANO PLANO. No jerga. "Asistente para escribir descripciones" en vez de "OpenAI GPT-4 inference endpoint".

6. \`provider\`: si el cliente nombró el servicio (ChatGPT, Claude, Canva, etc.), ponlo aquí literal. Si no, null.

FORMATO — JSON ESTRICTO, sin markdown:

{
  "ai_systems": [
    {
      "name": "<en castellano plano>",
      "description": "<1-2 frases qué hace en ESTE negocio>",
      "category": "<generador de contenido | chatbot | recomendador | screening de personas | scoring | reconocimiento biométrico | análisis predictivo | otro>",
      "provider": "<nombre del servicio si se mencionó, o null>",
      "in_house": false,
      "operates_on_personal_data": <true|false>,
      "affects_individuals": <true|false>,
      "human_oversight": "<si lo explicó, o null>",
      "countries_of_operation": ["ES"]
    }
  ],
  "summary": "<1 párrafo (3-5 frases) en castellano, segunda persona, sin jerga. Resumen ejecutivo de lo que tiene el negocio y qué nivel de exposición legal tiene de un vistazo.>",
  "no_systems_found_explanation": "<solo si ai_systems vacío: explica por qué. Si hay sistemas, null>"
}`;

async function extractSystems(org: OrgContext, answers: InterviewAnswers): Promise<ExtractResult> {
  const userMessage = `Extrae los sistemas de IA de este negocio. Devuelve SOLO el JSON.

**Negocio**: ${org.name} (${org.country})

**P1 — ¿A qué te dedicas?**
${answers.business_description || "(sin responder)"}

**P2 — ¿Apps para crear contenido?**
${answers.content_creation.uses ? `Sí. ${answers.content_creation.details}` : "No."}

**P3 — ¿Programas que decidan sobre personas?**
${answers.decisions_on_people.uses ? `Sí. ${answers.decisions_on_people.details}` : "No."}

**P4 — ¿Chatbot con clientes?**
${answers.customer_chatbot.uses ? `Sí. ${answers.customer_chatbot.details}` : "No."}

**P5 — ¿Reconocimiento biométrico o cámaras inteligentes?**
${answers.biometric_or_camera.uses ? `Sí. ${answers.biometric_or_camera.details}` : "No."}

**P6 — ¿Algo más con tecnología avanzada?**
${answers.other_advanced_tech.uses ? `Sí. ${answers.other_advanced_tech.details}` : "No."}`;

  const client = getClient();
  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 2048,
    system: EXTRACT_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  const stripped = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();

  let parsed: ExtractResult;
  try {
    parsed = JSON.parse(stripped) as ExtractResult;
  } catch (err) {
    throw new Error(`Extract returned non-JSON: ${stripped.slice(0, 300)}... (${err instanceof Error ? err.message : err})`);
  }
  if (!Array.isArray(parsed.ai_systems)) parsed.ai_systems = [];
  if (!parsed.summary) parsed.summary = "";
  if (parsed.no_systems_found_explanation === undefined) parsed.no_systems_found_explanation = null;
  return parsed;
}

/**
 * Two-stage audit:
 *  1) Extract the list of distinct AI systems from interview (fast call, ~5s).
 *  2) Classify each system in parallel (each ~5-10s; total bounded by slowest).
 *
 * This keeps each Netlify Lambda invocation well under the 26s function timeout
 * even when 4-6 systems are detected.
 */
export async function auditBusiness(org: OrgContext, answers: InterviewAnswers): Promise<AuditResult> {
  const extract = await extractSystems(org, answers);

  if (extract.ai_systems.length === 0) {
    return {
      ai_systems: [],
      summary: extract.summary,
      no_systems_found_explanation: extract.no_systems_found_explanation,
    };
  }

  const classified = await Promise.all(
    extract.ai_systems.map(async (s): Promise<DetectedSystem> => {
      const input: ClassifierInput = {
        name: s.name,
        description: s.description,
        category: s.category,
        provider: s.provider,
        in_house: s.in_house,
        operates_on_personal_data: s.operates_on_personal_data,
        affects_individuals: s.affects_individuals,
        human_oversight: s.human_oversight,
        countries_of_operation: s.countries_of_operation,
      };
      const result = await classifyAiSystem(input);
      return {
        ...s,
        risk_tier: result.risk_tier,
        reasoning: result.reasoning,
        obligations: result.obligations,
        flagged_concerns: result.flagged_concerns,
      };
    }),
  );

  return {
    ai_systems: classified,
    summary: extract.summary,
    no_systems_found_explanation: null,
  };
}
