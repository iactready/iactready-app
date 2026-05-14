import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output: smaller Docker image + bundled node_modules. Used by
  // the NAS self-hosted runtime (Cloudflare Tunnel fronts it).
  output: "standalone",
  // Strict mode for React 19
  reactStrictMode: true,
  // Allow Server Actions from production + Vercel preview domains
  experimental: {
    serverActions: {
      allowedOrigins: ["iactready.com", "*.vercel.app"],
    },
  },
  // Disable telemetry phone-home to keep stack 100% EU
  // (also set via env NEXT_TELEMETRY_DISABLED=1)
  poweredByHeader: false,
};

export default nextConfig;
