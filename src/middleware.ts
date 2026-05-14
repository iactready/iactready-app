import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

// Skip middleware on static assets and on public/unauthenticated endpoints
// (waitlist, classify, and the Stripe webhook which validates its own signature).
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api/waitlist|api/classify|api/billing/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
