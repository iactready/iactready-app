"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DocItem {
  doc_type: string;
  title: string;
  description: string;
  citation: string;
  approx_pages: number;
  generated: boolean;
  version: number | null;
  generated_at: string | null;
  id: string | null;
}

interface ListResponse {
  can_download: boolean;
  docs: DocItem[];
}

export function DocumentsSection({ systemId }: { systemId: string }) {
  const [state, setState] = useState<ListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch(`/api/inventory/${systemId}/docs`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as ListResponse;
      setState(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  useEffect(() => {
    load();
  }, [systemId]);

  async function generate(docType: string) {
    setGenerating(docType);
    setError(null);
    try {
      const res = await fetch(`/api/inventory/${systemId}/docs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc_type: docType }),
      });
      if (res.status === 402) {
        window.location.href = "/pricing";
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setGenerating(null);
    }
  }

  if (!state) {
    return (
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Documentación legal</h2>
        <p className="mt-2 text-sm text-zinc-500">Cargando…</p>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Documentación legal</h2>
        {!state.can_download && (
          <Link href="/pricing" className="text-xs font-medium text-orange-400 hover:text-orange-300">
            Desbloquear con Autónomo →
          </Link>
        )}
      </div>
      <p className="mt-1 text-sm text-zinc-400">
        Documentos listos para firmar y archivar, generados específicamente para tu negocio y este sistema.
      </p>

      <ul className="mt-4 space-y-3">
        {state.docs.map((d) => (
          <li key={d.doc_type} className="rounded-lg border border-zinc-800 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-zinc-100">{d.title}</h3>
                <p className="mt-1 text-sm text-zinc-400">{d.description}</p>
                <p className="mt-2 text-xs text-zinc-500">
                  {d.citation} · ~{d.approx_pages} páginas
                  {d.generated && d.generated_at && (
                    <>
                      {" · "}
                      <span className="text-emerald-400">
                        v{d.version} · generado {new Date(d.generated_at).toLocaleDateString("es-ES")}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="shrink-0 flex flex-col gap-2 items-end">
                {d.generated && d.id ? (
                  <Link
                    href={`/inventory/${systemId}/docs/${d.id}`}
                    className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-900"
                  >
                    Ver
                  </Link>
                ) : null}
                <button
                  onClick={() => generate(d.doc_type)}
                  disabled={generating !== null}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
                    state.can_download
                      ? "bg-orange-500 text-zinc-950 hover:bg-orange-400"
                      : "border border-zinc-700 text-zinc-300 hover:bg-zinc-900"
                  }`}
                >
                  {generating === d.doc_type
                    ? "Generando…"
                    : !state.can_download
                    ? "🔒 Desbloquear"
                    : d.generated
                    ? "Regenerar"
                    : "Generar"}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </section>
  );
}
