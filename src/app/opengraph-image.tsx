import {
  OG_ALT,
  OG_CONTENT_TYPE,
  OG_SIZE,
  brandShareImage,
} from "@/lib/og/shareImage";

// Default preview image for every link that has no image of its own (home,
// shared prompts, a private Cuentto…), instead of whatever image a crawler
// happens to scrape off the page.
export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return brandShareImage();
}
