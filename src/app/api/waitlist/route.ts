import { NextResponse } from "next/server";
import { FROM_DEFAULT } from "@/lib/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ from: FROM_DEFAULT });
}
