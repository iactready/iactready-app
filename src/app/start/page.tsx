"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StartPage() {
  const router = useRouter();
  const [level, setLevel] = useState<"starter" | "one_year" | "experienced">("starter");
  const [displayName, setDisplayName] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      if (!res.ok) throw new Error(data.error || "Error creando perfil");
      router.push("/study");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-100">← iActReady</Link>
      <h1 className="mt-6 text-3xl font-bold">Vamos a configurar tu plan</h1>
      <p className="mt-2 text-zinc-400">2 preguntas. Luego empiezas a estudiar.</p>

      <div className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">¿Cómo te llamamos?</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Tu nombre (opcional)"
            className="block w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">¿En qué punto estás?</label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: "starter", label: "Empiezo de cero", hint: "He decidido opositar pero todavía no he estudiado." },
              { id: "one_year", label: "Llevo un año o menos", hint: "Conozco parte del temario pero hay temas flojos." },
              { id: "experienced", label: "Llevo más de un año", hint: "Domino la mayoría. Refuerzo + simulacros." },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setLevel(opt.id as typeof level)}
                className={`text-left rounded-md border p-3 transition-colors ${
                  level === opt.id ? "border-orange-500 bg-orange-500/10" : "border-zinc-700 hover:border-zinc-500"
                }`}
              >
                <div className="font-medium">{opt.label}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{opt.hint}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">¿Fecha aproximada del examen? (opcional)</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="block w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2"
          />
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-md bg-orange-500 px-4 py-3 font-medium text-zinc-950 hover:bg-orange-400 disabled:opacity-50"
        >
          {loading ? "Creando..." : "Empezar a estudiar →"}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </main>
  );
}
