"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EU_COUNTRIES = ["ES","PT","FR","IT","DE","NL","BE","IE","AT","SE","FI","DK","PL","GR","CZ","HU","RO"];

export default function NewSystemPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    provider: "",
    in_house: false,
    operates_on_personal_data: false,
    affects_individuals: false,
    human_oversight: "",
    countries_of_operation: ["ES"] as string[],
  });

  function toggleCountry(c: string) {
    setForm((f) => ({
      ...f,
      countries_of_operation: f.countries_of_operation.includes(c)
        ? f.countries_of_operation.filter((x) => x !== c)
        : [...f.countries_of_operation, c],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error guardando sistema");
      router.push(`/inventory/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">Añadir sistema IA</h1>
      <p className="mt-2 text-zinc-400">Tras guardar, Claude clasifica el sistema según el AI Act y genera la lista de obligaciones. Tarda unos segundos.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Field label="Nombre del sistema" required>
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={fieldCls} placeholder="ej. Chatbot atención al cliente" />
        </Field>

        <Field label="Descripción breve" required hint="¿Qué hace? ¿Qué decide? ¿Para qué se usa?">
          <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={fieldCls} placeholder="Sistema basado en GPT-4 que responde a preguntas de soporte de los clientes en el chat web. Si no sabe la respuesta, escala a un humano." />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Categoría">
            <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={fieldCls} placeholder="Chatbot, RRHH, recomendador, scoring…" />
          </Field>
          <Field label="Proveedor">
            <input type="text" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} className={fieldCls} placeholder="OpenAI, Anthropic, Vendor X…" />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Toggle label="Desarrollo propio" checked={form.in_house} onChange={(v) => setForm({ ...form, in_house: v })} />
          <Toggle label="Opera con datos personales" checked={form.operates_on_personal_data} onChange={(v) => setForm({ ...form, operates_on_personal_data: v })} />
          <Toggle label="Afecta a decisiones sobre personas" checked={form.affects_individuals} onChange={(v) => setForm({ ...form, affects_individuals: v })} />
        </div>

        <Field label="Supervisión humana" hint="¿Quién revisa los outputs y cómo?">
          <textarea rows={2} value={form.human_oversight} onChange={(e) => setForm({ ...form, human_oversight: e.target.value })} className={fieldCls} placeholder="ej. Un humano valida cada decisión antes de aplicarla / Solo se revisa una muestra aleatoria semanal" />
        </Field>

        <Field label="Países de operación" hint="Múltiple selección">
          <div className="mt-2 flex flex-wrap gap-2">
            {EU_COUNTRIES.map((c) => {
              const on = form.countries_of_operation.includes(c);
              return (
                <button type="button" key={c} onClick={() => toggleCountry(c)} className={`rounded-md border px-3 py-1 text-sm transition-colors ${on ? "border-orange-500 bg-orange-500/15 text-orange-200" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                  {c}
                </button>
              );
            })}
          </div>
        </Field>

        <button type="submit" disabled={submitting} className="w-full rounded-md bg-orange-500 px-4 py-3 font-medium text-zinc-950 hover:bg-orange-400 disabled:opacity-50">
          {submitting ? "Clasificando con Claude (10-20s)…" : "Guardar y clasificar"}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>
    </main>
  );
}

const fieldCls = "mt-1 block w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300">
        {label} {required && <span className="text-orange-400">*</span>}
      </label>
      {hint && <p className="text-xs text-zinc-500 mt-0.5">{hint}</p>}
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors ${checked ? "border-orange-500 bg-orange-500/10" : "border-zinc-700 hover:border-zinc-500"}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span className={`h-4 w-4 shrink-0 rounded border ${checked ? "border-orange-500 bg-orange-500" : "border-zinc-600"}`} />
      <span className="text-sm text-zinc-200">{label}</span>
    </label>
  );
}
