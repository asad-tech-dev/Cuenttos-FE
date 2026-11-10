// Builds the link a user copies to share a prompt. Signed-in users get a
// short link (/s/<code>) that records them as the sharer server-side, so the
// recipient can't strip the attribution the way they could delete `?from=`.
// If that can't be had (signed out, offline, old backend), the link falls
// back to the prompt URL signed with `?from=` — sharing never breaks.

import { createShareLink, ShareLinkKind } from "@/lib/api/shareLinks";
import { withReferrer } from "@/lib/referrer";

export interface PromptTarget {
  kind: ShareLinkKind;
  slug: string;
}

/** The prompt a share path points at: /prompt/daily/<slug> or /prompt/<slug>. */
export const parsePromptPath = (path: string): PromptTarget | null => {
  const pathname = path.split(/[?#]/)[0];
  const match = /^\/prompt\/(?:(daily)\/)?([^/]+)\/?$/.exec(pathname);
  if (!match) return null;
  let slug: string;
  try {
    slug = decodeURIComponent(match[2]);
  } catch {
    return null;
  }
  if (!slug.trim() || slug.length > 200) return null;
  const kind = match[1] ? "daily" : "mood";
  // "/prompt/daily/" with no slug: not a mood prompt called "daily".
  if (kind === "mood" && match[2] === "daily") return null;
  return { kind, slug };
};

/** Canonical page for a prompt — the same paths the backend's shareLink uses. */
export const promptPath = ({ kind, slug }: PromptTarget) =>
  kind === "daily"
    ? `/prompt/daily/${encodeURIComponent(slug)}`
    : `/prompt/${encodeURIComponent(slug)}`;

// Short paths per (user, prompt) for this page session. Holding the promise
// means a double click makes one request; a failure is dropped from the cache
// so the next share tries again.
const shortPathCache = new Map<string, Promise<string>>();

export const clearPromptShareCache = () => shortPathCache.clear();

const shortPathFor = (userId: number, target: PromptTarget) => {
  const key = `${userId}:${target.kind}:${target.slug}`;
  let pending = shortPathCache.get(key);
  if (!pending) {
    pending = createShareLink(target.kind, target.slug).then((link) => {
      if (!link || typeof link.code !== "string" || !/^[A-Za-z0-9]{8}$/.test(link.code)) {
        throw new Error("Unexpected share link response");
      }
      return `/s/${link.code}`;
    });
    shortPathCache.set(key, pending);
    pending.catch(() => shortPathCache.delete(key));
  }
  return pending;
};

interface PromptShareUrlOptions {
  /** The prompt's share path, e.g. `/prompt/daily/<slug>`. */
  path: string;
  /** Signed-in user's id; null when signed out (no short link then). */
  userId: number | null;
  /** Username (slug) for the `?from=` fallback. */
  sharer: string | null;
  origin: string;
}

/** Absolute URL to copy. Never rejects. */
export const buildPromptShareUrl = async ({
  path,
  userId,
  sharer,
  origin,
}: PromptShareUrlOptions): Promise<string> => {
  const fallback = `${origin}${withReferrer(path, sharer)}`;
  const target = parsePromptPath(path);
  if (userId === null || !target) return fallback;
  try {
    return `${origin}${await shortPathFor(userId, target)}`;
  } catch (error) {
    console.error(error);
    return fallback;
  }
};

/**
 * Copies text that's still being worked out. Safari only allows clipboard
 * writes during the click itself, so the pending text goes in as a
 * ClipboardItem promise where supported; otherwise it's awaited and written.
 */
export const copyPendingText = async (text: Promise<string>) => {
  const clipboard = navigator.clipboard;
  if (typeof ClipboardItem !== "undefined" && clipboard?.write) {
    try {
      await clipboard.write([
        new ClipboardItem({
          "text/plain": text.then((t) => new Blob([t], { type: "text/plain" })),
        }),
      ]);
      return;
    } catch {
      // Promise-valued items unsupported here: fall through.
    }
  }
  await clipboard.writeText(await text);
};
