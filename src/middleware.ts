import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

// Run on all routes EXCEPT static assets, images, favicon, and the public API.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api/waitlist|api/classify|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
