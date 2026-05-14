"use client";

import { useState } from "react";

export function ManagePortalButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Error abriendo el portal");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={open}
        disabled={loading}
        className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-900 disabled:opacity-50"
      >
        {loading ? "Abriendo..." : "Gestionar suscripción"}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </>
  );
}
