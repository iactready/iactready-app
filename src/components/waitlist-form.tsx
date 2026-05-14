"use client";

import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  email: z.email("Introduce un email válido"),
});

type Status = "idle" | "submitting" | "success" | "error";

export function WaitlistForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    const result = schema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Email inválido");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: result.data.email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Error ${res.status}`);
      }
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo ha fallado");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
        <strong className="text-emerald-200">¡Gracias!</strong> Te avisaremos cuando abramos la beta. Mientras tanto,
        revisa tu bandeja de entrada para confirmar.
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="my-6 flex max-w-[540px] flex-wrap gap-2">
        <input
          type="email"
          name="email"
          placeholder="tu@empresa.com"
          required
          aria-label="Email"
          disabled={status === "submitting"}
          className="min-w-[240px] flex-1 rounded-xl border border-white/10 bg-[#131318] px-[18px] py-3.5 text-[15px] text-[#f4f4f5] outline-none transition-colors focus:border-orange-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="cursor-pointer rounded-xl border-0 bg-orange-500 px-[22px] py-3.5 text-[15px] font-semibold text-[#1a0f00] transition hover:bg-orange-400 active:scale-[0.97] disabled:opacity-50"
        >
          {status === "submitting" ? "Enviando..." : "Unirme a la beta"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      <p className="mt-3 text-sm text-[#a0a0a8]">Sin spam. Solo te escribimos cuando abramos la beta.</p>
    </>
  );
}
