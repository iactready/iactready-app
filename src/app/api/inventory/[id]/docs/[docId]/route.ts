import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/inventory/[id]/docs/[docId]
 *
 * Returns the Markdown body + metadata for a single generated document.
 * Render to HTML in the UI; download as PDF via the separate /pdf route.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const { docId } = await params;
  const sb = await getSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: doc } = await sb
    .from("documents")
    .select("id, doc_type, title, content_md, content_hash, version, generated_at")
    .eq("id", docId)
    .maybeSingle();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(doc);
}
