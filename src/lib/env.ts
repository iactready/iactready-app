import { z } from "zod";

/**
 * Runtime-validated environment variables.
 * Fail-fast on misconfiguration.
 */

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().startsWith("re_").optional(),
  RESEND_FROM_DEFAULT: z.email().default("hola@iactready.com"),
  ANTHROPIC_API_KEY: z.string().startsWith("sk-ant-").optional(),
  CLOUDFLARE_API_TOKEN: z.string().optional(),
  CLOUDFLARE_ZONE_ID: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.url().default("https://iactready.com"),
});

export const serverEnv =
  typeof window === "undefined" ? serverSchema.parse(process.env) : ({} as z.infer<typeof serverSchema>);

export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
