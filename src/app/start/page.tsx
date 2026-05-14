"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type YesNoStep = {
  key: "content_creation" | "decisions_on_people" | "customer_chatbot" | "biometric_or_camera" | "other_advanced_tech";
  title: string;
  examples: string;
  yesPrompt: string;
  yesPlaceholder: string;
};

const STEPS: YesNoStep[] = [
  {
    key: "content_creation",
    title: "¿Usas alguna app o web para crear contenido?",
    examples: "Por ejemplo: descripciones de productos, posts de redes, correos, traducciones, imágenes para tu web, vídeos…",
    yesPrompt: "¿Cuáles usas y para qué? Cuéntalo con tus palabras.",
    yesPlaceholder: "Ej: Le pido a ChatGPT que me escriba descripciones de productos y posts para Instagram. También uso Canva con su IA para generar imágenes de fondo.",
  },
  {
    key: "decisions_on_people",
    title: "¿Hay algún programa que decida cosas sobre personas en tu negocio?",
    examples: "A quién contratar · A quién dar un préstamo · Qué precio mostrar a cada cliente · A quién mostrar qué publicidad · Qué CV pasa a la siguiente fase · A quién recomendar qué producto…",
    yesPrompt: "Cuéntame qué decide y cómo.",
    yesPlaceholder: "Ej: Tengo un sistema que puntúa los leads que llegan a la web y solo el comercial llama a los que tienen score alto.",
  },
  {
    key: "customer_chatbot",
    title: "¿Tienes chatbot o asistente automático que hable con clientes?",
    examples: "En tu web, WhatsApp, Instagram, Telegram, email, FAQ automático…",
    yesPrompt: "¿Dónde lo tienes y qué hace?",
    yesPlaceholder: "Ej: Un chatbot en mi web que responde dudas frecuentes y deriva al humano si no sabe. Está integrado con WhatsApp también.",
  },
  {
    key: "biometric_or_camera",
    title: "¿Usas reconocimiento de cara, voz, huella o cámaras inteligentes?",
    examples: "Control de acceso por huella o cara · Cámaras anti-robo con detección automática · Identificación facial en una app · Análisis de voz…",
    yesPrompt: "Cuéntamelo.",
    yesPlaceholder: "Ej: Cámaras en la tienda que avisan si alguien se acerca a la zona de cajas fuera de horario.",
  },
  {
    key: "other_advanced_tech",
    title: "¿Algo más con tecnología avanzada que uses y no encaje en lo anterior?",
    examples: "Análisis predictivo (qué cliente va a darse de baja, cuánto venderás el mes que viene), scoring de fraude, recomendadores, detección automática de patrones… Si no estás seguro, dilo y ya miramos.",
    yesPrompt: "Cuéntalo brevemente.",
    yesPlaceholder: "Ej: Uso un programa que predice qué clientes son más propensos a comprar en Black Friday y les envía cupones personalizados.",
  },
];

type Answers = {
  org: { name: string; country: string };
  business_description: string;
  content_creation: { uses: boolean; details: string };
  decisions_on_people: { uses: boolean; details: string };
  customer_chatbot: { uses: boolean; details: string };
  biometric_or_camera: { uses: boolean; details: string };
  other_advanced_tech: { uses: boolean; details: string };
};

export default function StartPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [a, setA] = useState<Answers>({
    org: { name: "", country: "ES" },
    business_description: "",
    content_creation: { uses: false, details: "" },
    decisions_on_people: { uses: false, details: "" },
    customer_chatbot: { uses: false, details: "" },
    biometric_or_camera: { uses: false, details: "" },
    other_advanced_tech: { uses: false, details: "" },
  });

  // Step 0: org basics
  // Step 1: business description
  // Steps 2-6: 5 yes/no questions (STEPS[0..4])
  // Step 7: confirm & submit
  // Step 8: loading

  const TOTAL_STEPS = 8;
  const progress = Math.min(100, ((step + 1) / TOTAL_STEPS) * 100);

  async function submitAudit() {
    setRunning(true);
    setError(null);
    setStep(TOTAL_STEPS); // loading screen
    try {
      const payload = {
        org: a.org,
        interview: {
          business_description: a.business_description,
          content_creation: a.content_creation,
          decisions_on_people: a.decisions_on_people,
          customer_chatbot: a.customer_chatbot,
          biometric_or_camera: a.biometric_or_camera,
          other_advanced_tech: a.other_advanced_tech,
        },
      };
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error generando la auditoría");
      router.push("/inventory?audit=done");
    } catch (err) {
      setRunning(false);
      setStep(7); // back to confirm
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200">iActReady</Link>
          {step < TOTAL_STEPS && (
            <span className="text-xs text-zinc-500">
              Paso {Math.min(step + 1, TOTAL_STEPS)} de {TOTAL_STEPS}
            </span>
          )}
        </div>
        <div className="max-w-2xl mx-auto mt-3 h-1 rounded-full bg-zinc-800">
          <div className="h-1 rounded-full bg-orange-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Step 0: org basics */}
          {step === 0 && (
            <Slide
              title="Vamos a auditar tu negocio."
              subtitle="6 preguntas en castellano plano. Te lleva 3 minutos. Al final tienes un informe de qué obligaciones del AI Act te aplican."
            >
              <div className="space-y-4">
                <Field label="¿Cómo se llama tu negocio?">
                  <input
                    type="text"
                    autoFocus
                    value={a.org.name}
                    onChange={(e) => setA({ ...a, org: { ...a.org, name: e.target.value } })}
                    className={fieldCls}
                    placeholder="Ej: Cosmética Marta · Marta García (autónoma) · Acme S.L."
                  />
                </Field>
                <Field label="¿En qué país operas principalmente?">
                  <select
                    value={a.org.country}
                    onChange={(e) => setA({ ...a, org: { ...a.org, country: e.target.value } })}
                    className={fieldCls}
                  >
                    <option value="ES">España</option>
                    <option value="PT">Portugal</option>
                    <option value="FR">Francia</option>
                    <option value="IT">Italia</option>
                    <option value="DE">Alemania</option>
                    <option value="NL">Países Bajos</option>
                    <option value="BE">Bélgica</option>
                    <option value="IE">Irlanda</option>
                  </select>
                </Field>
              </div>
              <NextButton disabled={!a.org.name.trim()} onClick={() => setStep(1)} />
            </Slide>
          )}

          {/* Step 1: business description */}
          {step === 1 && (
            <Slide
              title="¿A qué te dedicas?"
              subtitle="Cuéntalo como se lo contarías a un amigo, en una o dos frases."
            >
              <textarea
                autoFocus
                rows={4}
                value={a.business_description}
                onChange={(e) => setA({ ...a, business_description: e.target.value })}
                className={fieldCls}
                placeholder="Ej: Vendo cosméticos naturales por internet a clientes en España y Portugal. Soy autónoma."
              />
              <div className="mt-6 flex gap-2">
                <BackButton onClick={() => setStep(0)} />
                <NextButton disabled={!a.business_description.trim()} onClick={() => setStep(2)} />
              </div>
            </Slide>
          )}

          {/* Steps 2-6: yes/no + details */}
          {step >= 2 && step <= 6 && (() => {
            const s = STEPS[step - 2];
            const v = a[s.key];
            return (
              <Slide title={s.title} subtitle={s.examples}>
                <div className="flex gap-3">
                  <Choice
                    selected={v.uses === true}
                    onClick={() => setA({ ...a, [s.key]: { ...v, uses: true } })}
                    label="Sí"
                  />
                  <Choice
                    selected={v.uses === false && !v.details}
                    onClick={() => setA({ ...a, [s.key]: { uses: false, details: "" } })}
                    label="No"
                  />
                </div>

                {v.uses && (
                  <div className="mt-4">
                    <label className="block text-sm text-zinc-400 mb-2">{s.yesPrompt}</label>
                    <textarea
                      rows={4}
                      value={v.details}
                      onChange={(e) => setA({ ...a, [s.key]: { ...v, details: e.target.value } })}
                      className={fieldCls}
                      placeholder={s.yesPlaceholder}
                    />
                  </div>
                )}

                <div className="mt-6 flex gap-2">
                  <BackButton onClick={() => setStep(step - 1)} />
                  <NextButton
                    disabled={v.uses && !v.details.trim()}
                    onClick={() => setStep(step + 1)}
                  />
                </div>
              </Slide>
            );
          })()}

          {/* Step 7: confirm & submit */}
          {step === 7 && (
            <Slide
              title="¿Lo lanzamos?"
              subtitle="Vamos a procesar tus respuestas con Claude y generarte el informe. Tarda 1-2 minutos."
            >
              <ul className="text-sm text-zinc-300 space-y-1.5">
                <li>· Negocio: <strong>{a.org.name}</strong> ({a.org.country})</li>
                <li>· Actividad: {a.business_description.slice(0, 100)}{a.business_description.length > 100 && "…"}</li>
                {STEPS.map((s) => {
                  const v = a[s.key];
                  return <li key={s.key}>· {s.title.replace("¿", "").replace("?", "")}: <strong>{v.uses ? "Sí" : "No"}</strong></li>;
                })}
              </ul>
              <div className="mt-6 flex gap-2">
                <BackButton onClick={() => setStep(6)} />
                <button onClick={submitAudit} disabled={running} className="flex-1 rounded-md bg-orange-500 px-4 py-3 font-medium text-zinc-950 hover:bg-orange-400 disabled:opacity-50">
                  Generar mi informe
                </button>
              </div>
              {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            </Slide>
          )}

          {/* Step 8: loading */}
          {step === TOTAL_STEPS && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin" />
              <h2 className="mt-6 text-2xl font-semibold">Generando tu informe…</h2>
              <p className="mt-3 text-zinc-400">Claude está leyendo tus respuestas, identificando tus sistemas de IA y mapeando las obligaciones legales que te aplican. Tarda 1-2 minutos.</p>
              <ul className="mt-8 inline-flex flex-col items-start gap-2 text-sm text-zinc-500">
                <li>✓ Respuestas guardadas</li>
                <li className="text-orange-300">→ Identificando tus sistemas de IA…</li>
                <li>· Clasificando bajo el AI Act</li>
                <li>· Listando obligaciones por sistema</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

const fieldCls = "block w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none";

function Slide({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-3xl font-bold leading-tight">{title}</h1>
      <p className="mt-3 text-zinc-400">{subtitle}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-1">{label}</label>
      {children}
    </div>
  );
}

function NextButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-6 flex-1 rounded-md bg-orange-500 px-4 py-3 font-medium text-zinc-950 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      Continuar →
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md border border-zinc-700 px-4 py-3 text-zinc-300 hover:bg-zinc-900"
    >
      ← Volver
    </button>
  );
}

function Choice({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-md border px-6 py-3 font-medium transition-colors ${
        selected
          ? "border-orange-500 bg-orange-500/15 text-orange-200"
          : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
      }`}
    >
      {label}
    </button>
  );
}
