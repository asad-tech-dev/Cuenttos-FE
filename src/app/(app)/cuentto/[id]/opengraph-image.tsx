import { fetchPublicCuenttoById } from "@/lib/og/cuenttoShareMeta";
import {
  OG_ALT,
  OG_CONTENT_TYPE,
  OG_SIZE,
  brandShareImage,
  cuenttoShareImage,
} from "@/lib/og/shareImage";

// Preview image for a legacy /cuentto/{id} link.
export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cuentto = await fetchPublicCuenttoById(id);
  return cuentto ? cuenttoShareImage(cuentto) : brandShareImage();
}
