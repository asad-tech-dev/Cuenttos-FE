import type { Metadata } from "next";
import CuenttoByIdClient from "./CuenttoByIdClient";
import {
  cuenttoMetadata,
  fetchPublicCuenttoById,
} from "@/lib/og/cuenttoShareMeta";

interface CuenttoPageProps {
  params: Promise<{ id: string }>;
}

// Legacy /cuentto/{id} links: same link preview as the slug route (og:url
// points at the canonical slug link). The page itself is unchanged.
export async function generateMetadata({
  params,
}: CuenttoPageProps): Promise<Metadata> {
  const { id } = await params;
  const cuentto = await fetchPublicCuenttoById(id);
  return cuentto ? cuenttoMetadata(cuentto) : {};
}

export default function CuenttoDetailPage() {
  return <CuenttoByIdClient />;
}
