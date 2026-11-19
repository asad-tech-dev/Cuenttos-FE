import type { Metadata } from "next";
import { getCuenttoPath } from "@/lib/cuenttoLink";

// Link previews (Open Graph / Twitter cards) for shared Cuentto links.
//
// Facebook, WhatsApp, LinkedIn, X, iMessage, Slack, Telegram, Discord… never
// run the page's JavaScript: they read the <meta> tags in the server HTML. The
// Cuentto pages fetch their data in the browser, so before this every shared
// link previewed as the site-wide "Cuentto" with whatever image the crawler
// scraped off the page. These helpers let the pages emit real tags server-side.
//
// Privacy: the server fetch never sends a token, so the backend only answers
// for a public Cuentto (private → 401, journal-only → 404). Anything else gets
// the generic site preview — a private Cuentto's title never leaks into a tag.

/** Only the fields a preview needs; the backend sends more. */
export interface PublicCuentto {
  id: number;
  title: string;
  description: string;
  createdAt?: string;
  slug?: string | null;
  isPublic?: boolean;
  isSelfShared?: boolean;
  mood?: { title?: string | null; color?: string | null } | null;
  user: { username: string; usernameSlug?: string | null };
}

/** Crawlers give up on slow pages; never hold one up on a stuck backend. */
const FETCH_TIMEOUT_MS = 5000;
export const DESCRIPTION_MAX = 160;
export const SITE_NAME = "Cuentto";

const isPublicCuentto = (value: unknown): value is PublicCuentto => {
  const c = value as PublicCuentto | null;
  return Boolean(
    c &&
      typeof c.id === "number" &&
      typeof c.title === "string" &&
      c.user &&
      typeof c.user.username === "string" &&
      // Belt and braces on top of the backend's own gate.
      c.isPublic !== false &&
      !c.isSelfShared,
  );
};

async function fetchPublic(path: string): Promise<PublicCuentto | null> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return null;
  try {
    const res = await fetch(`${base}${path}`, {
      // An edit or a switch to private must show on the next scrape.
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { cuentto?: unknown };
    return isPublicCuentto(data?.cuentto) ? data.cuentto : null;
  } catch {
    // Network error, timeout or bad JSON: fall back to the generic preview.
    return null;
  }
}

/** The /{usernameSlug}/cuentto/{slug} route's Cuentto, if it's public. */
export const fetchPublicCuenttoBySlug = (usernameSlug: string, slug: string) =>
  usernameSlug && slug
    ? fetchPublic(
        `/api/cuentto/${encodeURIComponent(usernameSlug)}/${encodeURIComponent(slug)}`,
      )
    : Promise.resolve(null);

/** The legacy /cuentto/{id} route's Cuentto, if it's public. */
export const fetchPublicCuenttoById = (rawId: string) =>
  /^\d+$/.test(rawId) && Number(rawId) > 0
    ? fetchPublic(`/api/cuentto/detail/${rawId}`)
    : Promise.resolve(null);

// --- text ------------------------------------------------------------------

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  laquo: "«",
  raquo: "»",
  iexcl: "¡",
  iquest: "¿",
  aacute: "á",
  eacute: "é",
  iacute: "í",
  oacute: "ó",
  uacute: "ú",
  ntilde: "ñ",
  uuml: "ü",
  Aacute: "Á",
  Eacute: "É",
  Iacute: "Í",
  Oacute: "Ó",
  Uacute: "Ú",
  Ntilde: "Ñ",
  Uuml: "Ü",
};

const decodeEntities = (text: string) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const code =
        entity[1] === "x" || entity[1] === "X"
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10);
      try {
        return Number.isFinite(code) && code > 0
          ? String.fromCodePoint(code)
          : match;
      } catch {
        return match;
      }
    }
    return NAMED_ENTITIES[entity] ?? match;
  });

/** The editor's HTML as one line of plain text. */
export const htmlToPlainText = (html: string | null | undefined): string =>
  decodeEntities(
    (html ?? "")
      .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
      // Block boundaries become spaces so words from adjacent lines don't fuse.
      .replace(/<\/?(p|div|br|li|ul|ol|h[1-6]|blockquote|tr|td)[^>]*>/gi, " ")
      .replace(/<[^>]*>/g, ""),
  )
    .replace(/\s+/g, " ")
    .trim();

/** Cut at a word boundary and add an ellipsis, never mid-word. */
export const truncate = (text: string, max: number): string => {
  const chars = Array.from(text);
  if (chars.length <= max) return text;
  const cut = chars.slice(0, max - 1).join("");
  // Already on a word boundary when the next character is a space.
  const endsOnWord = /\s/.test(chars[max - 1]);
  const lastSpace = cut.lastIndexOf(" ");
  const base =
    endsOnWord || lastSpace <= max * 0.6 ? cut : cut.slice(0, lastSpace);
  return `${base.replace(/[\s.,;:!?¡¿—–-]+$/u, "")}…`;
};

/** Emoji have no glyph in the preview image's font; drop them there. */
export const stripEmoji = (text: string): string =>
  text
    .replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}️‍]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

export const cuenttoTitle = (cuentto: PublicCuentto): string =>
  cuentto.title.trim() || "A Cuentto";

export const cuenttoDescription = (cuentto: PublicCuentto): string => {
  const text = htmlToPlainText(cuentto.description);
  return text
    ? truncate(text, DESCRIPTION_MAX)
    : `A Cuentto by ${cuentto.user.username}.`;
};

// --- metadata --------------------------------------------------------------

/**
 * Tags for a public Cuentto. The image itself comes from the route's
 * `opengraph-image.tsx`, which Next merges in. `og:url` is the canonical
 * /{user}/cuentto/{slug} address, so shares of the legacy /cuentto/{id} link
 * and of the slug link count as the same post.
 */
export function cuenttoMetadata(cuentto: PublicCuentto): Metadata {
  const title = cuenttoTitle(cuentto);
  const description = cuenttoDescription(cuentto);
  const url = getCuenttoPath(cuentto);
  return {
    title: `${title} — ${SITE_NAME}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      title,
      description,
      url,
      authors: [cuentto.user.username],
      ...(cuentto.createdAt && { publishedTime: cuentto.createdAt }),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
