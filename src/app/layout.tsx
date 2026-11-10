import type { Metadata } from "next";
// Inter is self-hosted (bundled from npm) rather than fetched from Google
// Fonts at build time: Google sometimes serves it from `/l/font?kit=…&skey=…`
// URLs, which Turbopack's next/font/google loader can't resolve, breaking
// `next dev`. Same typeface and weights, split by language like Google's.
import "@fontsource-variable/inter";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import AuthInterceptorProvider from "@/app/components/AuthInterceptorProvider";

export const metadata: Metadata = {
  title: "Cuentto",
  description: "Free your mind, Write your mind",
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
