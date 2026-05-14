import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({ stage: "got_body", body_keys: Object.keys(body || {}) });
  } catch (err) {
    return NextResponse.json({ stage: "POST_outer_catch", err: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ stage: "GET_works" });
}
