import { z } from "zod";

/**
 * Runtime-validated environment variables.
 * Fail-fast on misconfiguration: if any required var is missing,
 * the app refuses to start instead of failing at the first request.
 */

const serverSchema = z.object({
  // Supabase (server-only — service_role bypasses RLS)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Resend (transactional email)
  RESEND_API_KEY: z.string().startsWith("re_").optional(),
  RESEND_FROM_DEFAULT: z.string().email().default("hola@iactready.com"),

  // LLM
  ANTHROPIC_API_KEY: z.string().startsWith("sk-ant-").optional(),

  // Cloudflare (DNS automation)
  CLOUDFLARE_API_TOKEN: z.string().optional(),
  CLOUDFLARE_ZONE_ID: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("https://iactready.com"),
});

// Parse server vars (only on server)
export const serverEnv =
  typeof window === "undefined" ? serverSchema.parse(process.env) : ({} as z.infer<typeof serverSchema>);

// Parse public vars (available both sides)
export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
