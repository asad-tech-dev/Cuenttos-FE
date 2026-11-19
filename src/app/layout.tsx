import type { Metadata } from "next";
// Inter is self-hosted (bundled from npm) rather than fetched from Google
// Fonts at build time: Google sometimes serves it from `/l/font?kit=…&skey=…`
// URLs, which Turbopack's next/font/google loader can't resolve, breaking
// `next dev`. Same typeface and weights, split by language like Google's.
import "@fontsource-variable/inter";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import AuthInterceptorProvider from "@/app/components/AuthInterceptorProvider";
import { siteUrl } from "@/lib/og/siteUrl";

export const metadata: Metadata = {
  // Makes og:image / og:url absolute, which link-preview crawlers require.
  metadataBase: siteUrl(),
  title: "Cuentto",
  description: "Free your mind, Write your mind",
  // Defaults for any shared link; pages with their own preview (a public
  // Cuentto, a prompt) override these. The image is app/opengraph-image.tsx.
  openGraph: {
    type: "website",
    siteName: "Cuentto",
    title: "Cuentto",
    description: "Free your mind, Write your mind",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthInterceptorProvider />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
