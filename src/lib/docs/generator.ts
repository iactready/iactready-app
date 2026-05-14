import Anthropic from "@anthropic-ai/sdk";
import crypto from "node:crypto";
import { serverEnv } from "../env";
import { DOC_CATALOG, type DocType } from "./catalog";
import type { RiskTier } from "../classifier";

let _client: Anthropic | null = null;
function getClient() {
  if (!serverEnv.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not configured");
  if (!_client) _client = new Anthropic({ apiKey: serverEnv.ANTHROPIC_API_KEY });
  return _client;
}

export interface DocGenInput {
  org: { name: string; legal_name?: string | null; country: string; sector?: string | null };
  system: {
    name: string;
    description: string;
    category?: string | null;
    provider?: string | null;
    in_house: boolean;
    operates_on_personal_data: boolean;
    affects_individuals: boolean;
    human_oversight?: string | null;
    risk_tier: RiskTier;
  };
}

export interface DocGenOutput {
  doc_type: DocType;
  title: string;
  content_md: string;
  content_hash: string;
}

const COMMON_INSTRUCTIONS = `INSTRUCCIONES GENERALES:

- Escribes en CASTELLANO formal pero claro. Sin jerga innecesaria.
- Cita los artículos relevantes del Reglamento (UE) 2024/1689 cuando proceda.
- El documento es para un negocio pequeño / autónomo / PYME española. NO es un white paper jurídico — es un documento operativo que puedan firmar y archivar.
- Usa Markdown bien estructurado: encabezados (#, ##), listas, tablas si ayuda.
- Incluye campos del tipo "[Nombre del responsable]", "[Fecha]", "[Firma]" donde el usuario tenga que rellenar a mano.
- Al final, incluye una sección "Histórico de versiones" con el formato:
  | Versión | Fecha | Cambios |
  |---|---|---|
  | 1 | {{TODAY}} | Versión inicial generada por iActReady |
- NO inventes datos. Si falta información del cliente, deja el campo en blanco como "[describir]".
- Devuelve SOLO el Markdown del documento. SIN texto introductorio, SIN " aquí va el documento ", SIN bloques de código.
`;

function systemPromptFor(docType: DocType): string {
  const spec = DOC_CATALOG[docType];
  switch (docType) {
    case "art4_literacy_policy":
      return `${COMMON_INSTRUCTIONS}

Vas a redactar una POLÍTICA INTERNA DE ALFABETIZACIÓN EN IA según el Art. 4 del AI Act.

Estructura obligatoria:
1. **Objeto y alcance** — qué cubre la política
2. **Sistema de IA cubierto** — nombre y descripción del sistema concreto del cliente
3. **Personal afectado** — qué roles tienen que estar formados
4. **Contenidos formativos mínimos** — qué tiene que saber cada rol (capacidades, limitaciones, riesgos)
5. **Modalidad y cadencia** — cómo se imparte la formación (presencial / e-learning), cada cuánto se renueva
6. **Evidencias** — qué prueba archiva la empresa de que ha formado al equipo
7. **Responsable** — quién es responsable de mantener esta política
8. **Histórico de versiones**`;

    case "internal_ai_policy":
      return `${COMMON_INSTRUCTIONS}

Vas a redactar una POLÍTICA GENERAL DE USO DE IA EN LA EMPRESA. Es el documento que firman los empleados al incorporarse.

Estructura obligatoria:
1. **Propósito** — por qué tenemos esta política
2. **Alcance** — a quién aplica
3. **Sistemas de IA autorizados** — lista de sistemas concretos del cliente
4. **Datos prohibidos** — qué NO se puede meter en una IA (datos personales sensibles, secretos comerciales, propiedad intelectual de terceros…)
5. **Decisiones que NO se pueden delegar a una IA** — sin supervisión humana
6. **Obligaciones del empleado** — verificar outputs, declarar uso, formación
7. **Régimen de incumplimiento** — qué pasa si se salta la política
8. **Histórico de versiones**`;

    case "art50_transparency_notice":
      return `${COMMON_INSTRUCTIONS}

Vas a redactar un AVISO DE TRANSPARENCIA conforme al Art. 50 del AI Act.

Si el sistema es un chatbot: produce el texto que el chatbot debe mostrar al iniciar la conversación.
Si el sistema genera contenido (texto, imagen, vídeo): produce el texto/etiqueta que se debe añadir al contenido generado.

Estructura:
1. **Identificación del sistema** — qué es y qué hace
2. **Texto visible para el usuario final** — en castellano claro, máximo 2 frases
3. **Texto adicional en sección "Sobre nosotros" / "Privacy notice"** — explicación más extensa
4. **Snippet HTML listo para pegar** — bloque de código con el HTML del aviso
5. **Snippet de prompt del sistema (si es chatbot)** — para que el chatbot mismo lo anuncie
6. **Histórico de versiones**`;

    case "art14_human_oversight":
      return `${COMMON_INSTRUCTIONS}

Vas a redactar un PLAN DE SUPERVISIÓN HUMANA conforme al Art. 14 del AI Act.

Estructura:
1. **Sistema cubierto** — nombre + descripción + por qué es de alto riesgo
2. **Decisiones que se supervisan** — qué outputs concretos requieren intervención humana
3. **Persona supervisora** — perfil y formación mínima
4. **Modelo de supervisión** — antes / durante / después de la decisión
5. **Umbrales de intervención** — qué dispara una revisión obligatoria
6. **Capacidades del supervisor** — interfaz, datos a los que accede, poderes (pausar el sistema, anular decisión)
7. **Registro y trazabilidad** — qué queda registrado de cada intervención
8. **Procedimiento de actualización** — cuándo se revisa este plan
9. **Histórico de versiones**`;

    default:
      return `${COMMON_INSTRUCTIONS}

Vas a redactar el documento: ${spec.title}. Sigue las mejores prácticas del Art. ${spec.citation} y produce un documento profesional listo para firmar.`;
  }
}

function userPromptFor(docType: DocType, input: DocGenInput): string {
  const today = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  return `Genera el documento ${DOC_CATALOG[docType].title} para el siguiente contexto:

**Empresa**: ${input.org.name}
${input.org.legal_name ? `**Razón social**: ${input.org.legal_name}` : ""}
**País**: ${input.org.country}
${input.org.sector ? `**Sector**: ${input.org.sector}` : ""}

**Sistema de IA**:
- **Nombre**: ${input.system.name}
- **Descripción**: ${input.system.description}
${input.system.category ? `- **Categoría**: ${input.system.category}` : ""}
${input.system.provider ? `- **Proveedor**: ${input.system.provider}` : ""}
- **Desarrollo**: ${input.system.in_house ? "Propio" : "De tercero"}
- **Datos personales**: ${input.system.operates_on_personal_data ? "Sí" : "No"}
- **Afecta a decisiones sobre personas**: ${input.system.affects_individuals ? "Sí" : "No"}
${input.system.human_oversight ? `- **Supervisión humana declarada**: ${input.system.human_oversight}` : ""}
- **Clasificación de riesgo AI Act**: ${input.system.risk_tier}

Reemplaza {{TODAY}} en el histórico de versiones por: ${today}

Devuelve SOLO el Markdown del documento.`;
}

export async function generateDocument(docType: DocType, input: DocGenInput): Promise<DocGenOutput> {
  const spec = DOC_CATALOG[docType];
  const client = getClient();
  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 4096,
    system: systemPromptFor(docType),
    messages: [{ role: "user", content: userPromptFor(docType, input) }],
  });
  const md = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim()
    // strip code fences if Claude wraps the output
    .replace(/^```(?:markdown)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const hash = crypto.createHash("sha256").update(md).digest("hex").slice(0, 16);
  return {
    doc_type: docType,
    title: spec.title,
    content_md: md,
    content_hash: hash,
  };
}
