import Anthropic from "@anthropic-ai/sdk";
import { serverEnv } from "./env";

let _client: Anthropic | null = null;
function getClient() {
  if (!serverEnv.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not configured");
  if (!_client) _client = new Anthropic({ apiKey: serverEnv.ANTHROPIC_API_KEY });
  return _client;
}

export type RiskTier = "prohibited" | "high" | "limited" | "minimal";

export interface Obligation {
  article: string; // e.g. "Art. 9", "Anexo IV", "Art. 50.1.a"
  title: string;
  summary: string;
  deadline?: string; // e.g. "2 ago 2026"
}

export interface ClassifierInput {
  name: string;
  description: string;
  category?: string | null;
  provider?: string | null;
  in_house: boolean;
  operates_on_personal_data: boolean;
  affects_individuals: boolean;
  human_oversight?: string | null;
  countries_of_operation?: string[] | null;
}

export interface ClassifierOutput {
  risk_tier: RiskTier;
  reasoning: string;
  obligations: Obligation[];
  flagged_concerns: string[];
}

const SYSTEM_PROMPT = `Eres un experto en compliance del Reglamento (UE) 2024/1689 (EU AI Act).

Tu tarea: clasificar un sistema de IA descrito por el usuario en uno de estos niveles de riesgo, según el AI Act:

1. **prohibited** — usos prohibidos del Art. 5 (vigente desde 2 feb 2025):
   - Manipulación subliminal o explotación de vulnerabilidades.
   - Social scoring por autoridades públicas.
   - Categorización biométrica basada en atributos sensibles (raza, religión, orientación sexual, política, sindical).
   - Reconocimiento facial sin direccionar (face scraping).
   - Inferencia de emociones en lugares de trabajo o centros educativos.
   - Identificación biométrica remota en tiempo real en espacios públicos por fuerzas del orden (salvo excepciones tasadas).
   - Predicción de criminalidad basada en perfilado de personas.

2. **high** — sistemas de alto riesgo del Art. 6 + Anexo III (aplicación 2 ago 2026):
   - Biometría (identificación, categorización no prohibida, inferencia emociones fuera de Art. 5).
   - Infraestructuras críticas.
   - Educación y formación profesional (admisión, evaluación, asignación).
   - Empleo / RRHH (selección de personal, screening de CV, evaluación, asignación de tareas, monitorización, decisiones de despido).
   - Acceso a servicios esenciales privados o públicos (scoring crediticio, scoring de seguros de vida/salud, priorización de servicios de emergencia).
   - Fuerzas del orden, migración, asilo, control fronterizo.
   - Administración de justicia y procesos democráticos.

3. **limited** — riesgo limitado / obligación de transparencia (Art. 50, aplicación 2 ago 2026):
   - Chatbots y asistentes conversacionales que interactúan con humanos.
   - Sistemas de reconocimiento de emociones (no prohibidos).
   - Sistemas de categorización biométrica (no prohibidos).
   - Generación de contenido sintético (texto, imagen, audio, vídeo) — deepfakes.
   - Sistemas que generan o manipulan contenido público sobre asuntos de interés público.

4. **minimal** — todo lo demás (filtros antispam, recomendadores de producto, optimización de operativa interna sin afectar a personas).

**Importante**: el Art. 4 (alfabetización en IA) aplica a CUALQUIER organización que use IA, vigente desde 2 feb 2025. SIEMPRE añade esta obligación.

Devuelve JSON ESTRICTAMENTE con esta estructura — sin texto adicional, sin markdown:

{
  "risk_tier": "prohibited" | "high" | "limited" | "minimal",
  "reasoning": "<2-3 párrafos en español explicando POR QUÉ esta clasificación, citando artículos concretos del AI Act. Sé honesto si hay ambigüedad y di qué pregunta hace falta para confirmar.>",
  "obligations": [
    { "article": "Art. 4", "title": "Alfabetización en IA", "summary": "<2-3 frases con la obligación concreta para este sistema>", "deadline": "2 feb 2025" },
    ...
  ],
  "flagged_concerns": ["<lista de banderas rojas o preguntas que harían reconsiderar la clasificación>"]
}`;

export async function classifyAiSystem(input: ClassifierInput): Promise<ClassifierOutput> {
  const userMessage = `Clasifica este sistema de IA:

**Nombre**: ${input.name}
**Descripción**: ${input.description}
**Categoría declarada**: ${input.category || "(no especificada)"}
**Proveedor**: ${input.provider || "(no especificado)"} ${input.in_house ? "(desarrollo propio)" : "(de tercero)"}
**Opera sobre datos personales**: ${input.operates_on_personal_data ? "sí" : "no"}
**Afecta a decisiones sobre personas**: ${input.affects_individuals ? "sí" : "no"}
**Supervisión humana declarada**: ${input.human_oversight || "(no especificada)"}
**Países de operación**: ${(input.countries_of_operation || []).join(", ") || "(no especificados)"}

Devuelve solo el JSON.`;

  const client = getClient();
  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  // Concatenate any text blocks; strip code fences if Claude wraps the JSON.
  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  const stripped = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();

  let parsed: ClassifierOutput;
  try {
    parsed = JSON.parse(stripped) as ClassifierOutput;
  } catch (err) {
    throw new Error(`Classifier returned non-JSON: ${stripped.slice(0, 200)}... (${err instanceof Error ? err.message : err})`);
  }
  const validTiers: RiskTier[] = ["prohibited", "high", "limited", "minimal"];
  if (!validTiers.includes(parsed.risk_tier)) {
    throw new Error(`Classifier returned invalid risk_tier: ${parsed.risk_tier}`);
  }
  if (!Array.isArray(parsed.obligations)) parsed.obligations = [];
  if (!Array.isArray(parsed.flagged_concerns)) parsed.flagged_concerns = [];
  return parsed;
}
