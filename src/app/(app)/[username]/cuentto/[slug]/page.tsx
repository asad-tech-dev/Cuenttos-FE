import type { Metadata } from "next";
import CuenttoBySlugClient from "./CuenttoBySlugClient";
import {
  cuenttoMetadata,
  fetchPublicCuenttoBySlug,
} from "@/lib/og/cuenttoShareMeta";

interface CuenttoPageProps {
  params: Promise<{ username: string; slug: string }>;
}

// Server wrapper so a shared link carries the Cuentto's own title, excerpt
// and preview image (opengraph-image.tsx) for Facebook, WhatsApp, X, etc.
// The page itself is unchanged: it still loads in the browser, with the
// viewer's token, exactly as before.
export async function generateMetadata({
  params,
}: CuenttoPageProps): Promise<Metadata> {
  const { username, slug } = await params;
  const cuentto = await fetchPublicCuenttoBySlug(username, slug);
  // Not public (or not found): keep the site-wide defaults, so nothing about
  // a private Cuentto ends up in the tags.
  return cuentto ? cuenttoMetadata(cuentto) : {};
}

export default function CuenttoBySlugPage() {
  return <CuenttoBySlugClient />;
}
