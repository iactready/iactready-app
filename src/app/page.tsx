import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <header className="px-6 py-4 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="font-bold text-lg">iActReady</span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/pricing" className="text-zinc-400 hover:text-zinc-100">Precios</Link>
            <Link href="/login" className="text-zinc-400 hover:text-zinc-100">Entrar</Link>
            <Link href="/start" className="rounded-md bg-orange-500 px-4 py-2 font-medium text-zinc-950 hover:bg-orange-400">
              Empezar gratis
            </Link>
          </nav>
        </div>
      </header>

      <section className="px-6 py-20 max-w-5xl mx-auto text-center">
        <div className="inline-block mb-4 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-300">
          ✨ La IA que estudia contigo
        </div>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
          Aprueba tu oposición<br />
          <span className="text-orange-400">en la mitad de tiempo.</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
          Plan de estudio personalizado, 20 preguntas al día con explicación, simulacros oficiales.
          Por 1/5 del precio de una academia.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link href="/start" className="rounded-md bg-orange-500 px-6 py-3 font-medium text-zinc-950 hover:bg-orange-400">
            Empezar gratis →
          </Link>
          <Link href="/pricing" className="rounded-md border border-zinc-700 px-6 py-3 font-medium text-zinc-200 hover:bg-zinc-900">
            Ver planes
          </Link>
        </div>
        <p className="mt-4 text-xs text-zinc-500">10 preguntas gratis cada día · Sin tarjeta</p>
      </section>

      <section className="px-6 py-16 border-t border-zinc-800">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <ValueProp icon="🎯" title="Plan adaptativo" description="Detectamos tus puntos débiles y reorganizamos tu estudio cada día. Sin estudiar de más en lo que ya dominas." />
          <ValueProp icon="📝" title="20 preguntas diarias" description="Cada una con explicación clara: por qué es correcta la respuesta y por qué no las otras." />
          <ValueProp icon="⏱️" title="Simulacros oficiales" description="100 preguntas cronometradas, formato del examen real. Llega listo el día D." />
        </div>
      </section>

      <section className="px-6 py-16 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold">Oposiciones soportadas</h2>
          <p className="mt-3 text-zinc-400">Empezamos con la más demandada. Más oposiciones cada mes.</p>
          <div className="mt-8 inline-flex flex-col gap-3">
            <div className="rounded-lg border border-zinc-700 px-6 py-4 text-left">
              <div className="flex items-baseline justify-between gap-8">
                <div>
                  <h3 className="font-semibold text-zinc-100">Auxiliar Administrativo del Estado</h3>
                  <p className="text-xs text-zinc-500">AGE · Cuerpo General · C2 · 60 temas</p>
                </div>
                <span className="text-emerald-400 text-xs">✓ Disponible</span>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-2">Próximamente: Auxilio Judicial · Tramitación Justicia · Maestros · Sanidad</p>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold">€19.99 al mes. Sin permanencia.</h2>
          <p className="mt-3 text-zinc-400">Academia presencial: €1.500-3.000/año. iActReady: €240/año.</p>
          <Link href="/pricing" className="mt-6 inline-block rounded-md bg-orange-500 px-6 py-3 font-medium text-zinc-950 hover:bg-orange-400">
            Ver planes →
          </Link>
        </div>
      </section>

      <footer className="border-t border-zinc-800 py-8 text-center text-xs text-zinc-500">
        © 2026 iActReady · <a href="mailto:hola@iactready.com" className="hover:text-zinc-300">hola@iactready.com</a>
      </footer>
    </main>
  );
}

function ValueProp({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 p-6">
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-3 font-semibold text-zinc-100">{title}</h3>
      <p className="mt-2 text-sm text-zinc-400">{description}</p>
    </div>
  );
}
