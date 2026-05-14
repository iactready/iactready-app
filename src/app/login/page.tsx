"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setStatus("sending");
    setError(null);
    try {
      const sb = getSupabaseBrowserClient();
      const { error } = await sb.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/inventory` },
      });
      if (error) throw error;
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200">← iActReady</Link>
        <h1 className="mt-6 text-3xl font-bold">Inicia sesión</h1>
        <p className="mt-2 text-zinc-400">Te enviamos un enlace al correo. Sin contraseñas.</p>

        {status === "sent" ? (
          <div className="mt-8 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-emerald-200">
            <p className="font-medium">Revisa tu bandeja de entrada.</p>
            <p className="mt-1 text-sm text-emerald-300/80">Enviamos un enlace a <strong>{email}</strong>. Caduca en una hora.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">Email corporativo</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@empresa.com"
                className="mt-1 block w-full rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
                disabled={status === "sending"}
              />
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-md bg-orange-500 px-4 py-2 font-medium text-zinc-950 hover:bg-orange-400 disabled:opacity-50"
            >
              {status === "sending" ? "Enviando…" : "Enviar enlace mágico"}
            </button>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </form>
        )}
      </div>
    </main>
  );
}
