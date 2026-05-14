import Anthropic from "@anthropic-ai/sdk";
import { serverEnv } from "../env";

let _client: Anthropic | null = null;
function getClient() {
  if (!serverEnv.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not configured");
  if (!_client) _client = new Anthropic({ apiKey: serverEnv.ANTHROPIC_API_KEY });
  return _client;
}

export interface TopicSeed {
  number: number;
  title: string;
  subject_area: string;
  brief_summary: string;
}

export interface QuestionSeed {
  question_text: string;
  options: Array<{ letter: "a" | "b" | "c" | "d"; text: string }>;
  correct_letter: "a" | "b" | "c" | "d";
  explanation: string;
  difficulty: "facil" | "media" | "dificil";
}

/**
 * Generate the syllabus (temario) for a given oposición.
 * Returns the official-style list of topics (Claude knows the standard BOE syllabi).
 */
export async function generateSyllabus(
  oposicionName: string,
  body: string,
  level: string,
): Promise<TopicSeed[]> {
  const client = getClient();
  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
    system: `Eres un experto en oposiciones públicas españolas. Conoces los temarios oficiales publicados en el BOE.

Tu tarea: devolver el TEMARIO COMPLETO de una oposición concreta, fielmente al oficial. Si no conoces el temario exacto al 100%, devuelve uno realista basado en convocatorias recientes.

Cada tema tiene:
- number: int, 1-indexed
- title: el título oficial (formal, en español)
- subject_area: área temática general (ej. "Derecho Constitucional", "Organización del Estado", "Función Pública", "Procedimiento Administrativo Común", "Ofimática y Tecnología", "Atención al Ciudadano", etc.)
- brief_summary: 1-2 frases describiendo qué incluye

FORMATO — JSON estricto, sin markdown:

{"topics": [{ "number": 1, "title": "...", "subject_area": "...", "brief_summary": "..." }, ...]}`,
    messages: [
      {
        role: "user",
        content: `Genera el temario completo (todos los temas, sin abreviar) de:

**Oposición**: ${oposicionName}
**Cuerpo**: ${body}
**Nivel**: ${level}

Devuelve SOLO el JSON.`,
      },
    ],
  });
  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  const parsed = JSON.parse(text) as { topics: TopicSeed[] };
  return parsed.topics;
}

/** Generate N questions for a given topic. */
export async function generateQuestionsForTopic(
  topic: TopicSeed,
  oposicionName: string,
  count = 5,
): Promise<QuestionSeed[]> {
  const client = getClient();
  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
    system: `Eres autor experto de preguntas tipo test para oposiciones españolas. Imitas el estilo de los exámenes oficiales.

REGLAS:
- 4 opciones (a, b, c, d) en cada pregunta. Una sola correcta.
- Distractores plausibles, no obvios.
- Lenguaje formal, técnico, idéntico al de los exámenes reales.
- Cubre la mezcla normal del temario: conceptos, definiciones, plazos, requisitos, excepciones, casuística.
- Distribución de dificultad: ~40% fácil, 40% media, 20% difícil.
- Cada pregunta incluye una EXPLICACIÓN clara de por qué la correcta es correcta y por qué cada incorrecta no lo es (2-4 frases).

FORMATO — JSON estricto, sin markdown:

{
  "questions": [
    {
      "question_text": "...",
      "options": [
        { "letter": "a", "text": "..." },
        { "letter": "b", "text": "..." },
        { "letter": "c", "text": "..." },
        { "letter": "d", "text": "..." }
      ],
      "correct_letter": "a"|"b"|"c"|"d",
      "explanation": "...",
      "difficulty": "facil"|"media"|"dificil"
    }
  ]
}`,
    messages: [
      {
        role: "user",
        content: `Genera ${count} preguntas tipo test sobre este tema:

**Oposición**: ${oposicionName}
**Tema ${topic.number}**: ${topic.title}
**Área**: ${topic.subject_area}
**Contenido**: ${topic.brief_summary}

Devuelve SOLO el JSON con ${count} preguntas.`,
      },
    ],
  });
  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  const parsed = JSON.parse(text) as { questions: QuestionSeed[] };
  return parsed.questions;
}
