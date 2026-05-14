import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://iactready.com"),
  title: {
    default: "iActReady — Compliance EU AI Act para PYMEs",
    template: "%s · iActReady",
  },
  description:
    "Cumple con el EU AI Act, GDPR y DSA sin contratar una consultora. SaaS de compliance autoservicio para PYMEs europeas que usan IA. Disponible verano 2026.",
  keywords: [
    "EU AI Act",
    "AI Act compliance",
    "Reglamento Europeo IA",
    "GDPR",
    "DSA",
    "compliance PYME",
    "AESIA",
    "AEPD",
    "inteligencia artificial",
    "AI literacy",
  ],
  authors: [{ name: "iActReady", url: "https://iactready.com" }],
  creator: "iActReady",
  publisher: "iActReady",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://iactready.com",
    title: "iActReady — Compliance EU AI Act para PYMEs",
    description:
      "Cumple con el EU AI Act, GDPR y DSA sin contratar una consultora. SaaS autoservicio. Verano 2026.",
    siteName: "iActReady",
  },
  twitter: {
    card: "summary_large_image",
    site: "@iactready",
    creator: "@iactready",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0b0d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
