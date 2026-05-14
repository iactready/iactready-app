import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Tiny Markdown → HTML converter — covers headings, lists, tables, code, links, bold/italic.
 *  Avoids adding `marked` as a dep just for this. */
function renderMarkdown(md: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lines = md.split("\n");
  const out: string[] = [];
  let inTable = false;
  let tableHeaderDone = false;
  let inUl = false;
  let inOl = false;
  let inCode = false;
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length) {
      const text = paragraphBuffer.join(" ").trim();
      if (text) out.push(`<p>${inline(text)}</p>`);
      paragraphBuffer = [];
    }
  };
  const closeLists = () => {
    if (inUl) { out.push("</ul>"); inUl = false; }
    if (inOl) { out.push("</ol>"); inOl = false; }
  };
  const closeTable = () => {
    if (inTable) { out.push("</tbody></table>"); inTable = false; tableHeaderDone = false; }
  };

  const inline = (s: string) =>
    s
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.startsWith("```")) {
      flushParagraph(); closeLists(); closeTable();
      if (!inCode) { out.push("<pre><code>"); inCode = true; }
      else { out.push("</code></pre>"); inCode = false; }
      continue;
    }
    if (inCode) { out.push(escape(line)); continue; }

    if (line.startsWith("# ")) { flushParagraph(); closeLists(); closeTable(); out.push(`<h1>${inline(escape(line.slice(2)))}</h1>`); continue; }
    if (line.startsWith("## ")) { flushParagraph(); closeLists(); closeTable(); out.push(`<h2>${inline(escape(line.slice(3)))}</h2>`); continue; }
    if (line.startsWith("### ")) { flushParagraph(); closeLists(); closeTable(); out.push(`<h3>${inline(escape(line.slice(4)))}</h3>`); continue; }

    if (line.startsWith("| ")) {
      flushParagraph(); closeLists();
      const cells = line.slice(1, line.endsWith("|") ? -1 : undefined).split("|").map((c) => c.trim());
      // skip separator row
      if (cells.every((c) => /^[-:]+$/.test(c))) continue;
      if (!inTable) { out.push("<table><thead>"); inTable = true; }
      if (!tableHeaderDone) {
        out.push("<tr>" + cells.map((c) => `<th>${inline(escape(c))}</th>`).join("") + "</tr>");
        out.push("</thead><tbody>");
        tableHeaderDone = true;
      } else {
        out.push("<tr>" + cells.map((c) => `<td>${inline(escape(c))}</td>`).join("") + "</tr>");
      }
      continue;
    } else if (inTable) { closeTable(); }

    const ulMatch = line.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      flushParagraph();
      if (inOl) { out.push("</ol>"); inOl = false; }
      if (!inUl) { out.push("<ul>"); inUl = true; }
      out.push(`<li>${inline(escape(ulMatch[1]))}</li>`);
      continue;
    }
    const olMatch = line.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      flushParagraph();
      if (inUl) { out.push("</ul>"); inUl = false; }
      if (!inOl) { out.push("<ol>"); inOl = true; }
      out.push(`<li>${inline(escape(olMatch[1]))}</li>`);
      continue;
    }

    if (line === "") { flushParagraph(); closeLists(); continue; }

    paragraphBuffer.push(escape(line));
  }
  flushParagraph();
  closeLists();
  closeTable();
  if (inCode) out.push("</code></pre>");
  return out.join("\n");
}

interface DocRecord {
  id: string;
  doc_type: string;
  title: string;
  content_md: string;
  version: number;
  generated_at: string;
}

export default async function DocViewPage({ params }: { params: Promise<{ id: string; docId: string }> }) {
  const { id, docId } = await params;
  const sb = await getSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await sb
    .from("documents")
    .select("id, doc_type, title, content_md, version, generated_at, ai_system_id")
    .eq("id", docId)
    .maybeSingle();
  if (!data) notFound();
  const doc = data as DocRecord & { ai_system_id: string };

  const html = renderMarkdown(doc.content_md);

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      <Link href={`/inventory/${id}`} className="text-sm text-zinc-400 hover:text-zinc-200">← Volver al sistema</Link>
      <header className="mt-4 flex items-baseline justify-between gap-4">
        <h1 className="text-3xl font-bold">{doc.title}</h1>
        <span className="shrink-0 text-xs text-zinc-500">
          v{doc.version} · {new Date(doc.generated_at).toLocaleDateString("es-ES")}
        </span>
      </header>

      <article
        className="mt-8 prose prose-invert prose-zinc max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_table]:w-full [&_table]:my-4 [&_table]:border-collapse [&_th]:border [&_th]:border-zinc-700 [&_th]:p-2 [&_th]:bg-zinc-900 [&_th]:text-left [&_td]:border [&_td]:border-zinc-800 [&_td]:p-2 [&_strong]:text-zinc-100 [&_code]:bg-zinc-900 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_pre]:bg-zinc-900 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto [&_a]:text-orange-300 [&_a]:underline"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div className="mt-12 rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-400">
        <p>
          Este documento fue generado por iActReady específicamente para tu negocio.
          Es responsabilidad tuya revisarlo, completarlo en los campos marcados con corchetes
          (ej. <code className="bg-zinc-900 px-1 rounded">[Firma]</code>) y archivarlo firmado.
        </p>
      </div>
    </main>
  );
}
