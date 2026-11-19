import { fetchPublicCuenttoBySlug } from "@/lib/og/cuenttoShareMeta";
import {
  OG_ALT,
  OG_CONTENT_TYPE,
  OG_SIZE,
  brandShareImage,
  cuenttoShareImage,
} from "@/lib/og/shareImage";

// The preview image for a shared /{user}/cuentto/{slug} link. X/Twitter falls
// back to og:image, so no separate twitter-image is needed.
export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const cuentto = await fetchPublicCuenttoBySlug(username, slug);
  return cuentto ? cuenttoShareImage(cuentto) : brandShareImage();
}
