"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StartPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<"starter" | "one_year" | "experienced">("starter");
  const [displayName, setDisplayName] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oposicion_id: "aux-admin-estado-c2",
          level_experience: level,
          daily_question_goal: 20,
          display_name: displayName || undefined,
          target_exam_date: targetDate || undefined,
        }),
      });
      if (res.status === 401) { window.location.href = "/login?next=/start"; return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      router.push("/study");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
    }
  }

  const STEPS = 3;
  const progress = ((step + 1) / STEPS) * 100;

  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-6 py-4 border-b border-white/5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid place-items-center h-7 w-7 rounded-md bg-gradient-to-br from-orange-500 to-amber-500 text-zinc-950 font-bold text-sm">i</div>
            <span className="font-bold">iActReady</span>
          </Link>
          <span className="text-xs text-zinc-500">Paso {step + 1} / {STEPS}</span>
        </div>
        <div className="max-w-2xl mx-auto mt-3 h-1 rounded-full bg-white/10">
          <div className="h-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl">
          {step === 0 && (
            <div className="fade-up text-center">
              <div className="text-5xl mb-6">👋</div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">¡Bienvenido/a!</h1>
              <p className="mt-3 text-zinc-300">Vamos a configurar tu plan en 60 segundos.</p>
              <div className="mt-8 inline-block rounded-xl border border-white/10 bg-white/[0.02] p-5 text-left text-sm text-zinc-300 max-w-md">
                <p className="font-medium text-zinc-100 mb-2">Lo que vas a obtener:</p>
                <ul className="space-y-1.5">
                  <li>✓ Tu nivel de partida diagnosticado</li>
                  <li>✓ 10 preguntas gratis cada día con explicación</li>
                  <li>✓ Tracking automático de tu progreso</li>
                </ul>
              </div>
              <div className="mt-8">
                <button onClick={() => setStep(1)} className="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-zinc-950 hover:bg-orange-400">Empezar →</button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="fade-up">
              <h1 className="text-3xl font-bold tracking-tight">¿Cómo te llamamos?</h1>
              <p className="mt-2 text-zinc-400 text-sm">Para personalizar tu experiencia. Solo lo verás tú.</p>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tu nombre"
                autoFocus
                className="mt-6 block w-full rounded-lg bg-white/[0.03] border border-white/10 px-4 py-3 text-lg placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
              />
              <div className="mt-6 flex gap-3">
                <button onClick={() => setStep(0)} className="rounded-lg border border-white/15 px-5 py-3 text-zinc-200 hover:bg-white/5">← Volver</button>
                <button onClick={() => setStep(2)} className="flex-1 rounded-lg bg-orange-500 px-5 py-3 font-semibold text-zinc-950 hover:bg-orange-400">Continuar →</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fade-up">
              <h1 className="text-3xl font-bold tracking-tight">¿En qué punto estás?</h1>
              <p className="mt-2 text-zinc-400 text-sm">Adaptamos tu plan diario según tu nivel actual.</p>
              <div className="mt-6 space-y-2">
                {[
                  { id: "starter", icon: "🌱", label: "Empiezo de cero", hint: "He decidido opositar pero todavía no he estudiado." },
                  { id: "one_year", icon: "📖", label: "Llevo un año o menos", hint: "Conozco parte del temario pero tengo temas flojos." },
                  { id: "experienced", icon: "🎯", label: "Llevo más de un año", hint: "Domino la mayoría. Refuerzo + simulacros." },
                ].map((opt) => (
                  <button key={opt.id} onClick={() => setLevel(opt.id as typeof level)}
                    className={`w-full text-left rounded-xl border p-4 transition-colors ${level === opt.id ? "border-orange-500 bg-orange-500/10" : "border-white/10 hover:border-white/30"}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{opt.icon}</span>
                      <div>
                        <div className="font-medium text-zinc-100">{opt.label}</div>
                        <div className="mt-0.5 text-xs text-zinc-400">{opt.hint}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <label className="block text-sm text-zinc-400 mb-2">Fecha aproximada del examen (opcional)</label>
                <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)}
                  className="block w-full rounded-lg bg-white/[0.03] border border-white/10 px-4 py-2.5 focus:border-orange-500 focus:outline-none" />
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={() => setStep(1)} className="rounded-lg border border-white/15 px-5 py-3 text-zinc-200 hover:bg-white/5">← Volver</button>
                <button onClick={submit} disabled={loading} className="flex-1 rounded-lg bg-orange-500 px-5 py-3 font-semibold text-zinc-950 hover:bg-orange-400 disabled:opacity-50">
                  {loading ? "Creando perfil..." : "Empezar a estudiar →"}
                </button>
              </div>
              {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
