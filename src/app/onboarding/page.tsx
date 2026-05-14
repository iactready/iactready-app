"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    legal_name: "",
    tax_id: "",
    country: "ES",
    sector: "",
    employee_range: "11-50" as "1-10" | "11-50" | "51-250" | "251-1000" | "1000+",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.status === 409) {
        router.push("/inventory");
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error creando organización");
      }
      router.push("/inventory");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold">Cuéntanos de tu empresa</h1>
        <p className="mt-2 text-zinc-400">2 minutos. Lo necesitamos para generar tu documentación con los datos correctos.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Field label="Nombre comercial" required>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={fieldCls} />
          </Field>
          <Field label="Razón social">
            <input type="text" value={form.legal_name} onChange={(e) => setForm({ ...form, legal_name: e.target.value })} className={fieldCls} />
          </Field>
          <Field label="CIF / NIF">
            <input type="text" value={form.tax_id} onChange={(e) => setForm({ ...form, tax_id: e.target.value })} className={fieldCls} />
          </Field>
          <Field label="País principal de operación">
            <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={fieldCls}>
              <option value="ES">España</option><option value="PT">Portugal</option><option value="FR">Francia</option>
              <option value="IT">Italia</option><option value="DE">Alemania</option><option value="NL">Países Bajos</option>
              <option value="BE">Bélgica</option><option value="IE">Irlanda</option>
            </select>
          </Field>
          <Field label="Sector">
            <input type="text" placeholder="ej. Ecommerce, SaaS, salud, finanzas, RRHH" value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} className={fieldCls} />
          </Field>
          <Field label="Tamaño (empleados)">
            <select value={form.employee_range} onChange={(e) => setForm({ ...form, employee_range: e.target.value as typeof form.employee_range })} className={fieldCls}>
              <option value="1-10">1-10</option><option value="11-50">11-50</option>
              <option value="51-250">51-250</option><option value="251-1000">251-1000</option><option value="1000+">1000+</option>
            </select>
          </Field>
          <button type="submit" disabled={submitting} className="w-full rounded-md bg-orange-500 px-4 py-2 font-medium text-zinc-950 hover:bg-orange-400 disabled:opacity-50">
            {submitting ? "Guardando…" : "Continuar al inventario IA"}
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
      </div>
    </main>
  );
}

const fieldCls = "mt-1 block w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300">
        {label} {required && <span className="text-orange-400">*</span>}
      </label>
      {children}
    </div>
  );
}
