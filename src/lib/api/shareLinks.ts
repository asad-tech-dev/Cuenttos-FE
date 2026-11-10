import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/** "daily" = admin-written Today's Prompt; "mood" = a question-group prompt. */
export type ShareLinkKind = "daily" | "mood";

export interface ShareLink {
  code: string;
  /** `/s/<code>` */
  path: string;
}

export interface ResolvedShareLink {
  kind: ShareLinkKind;
  slug: string;
  sharer: { username: string; usernameSlug: string | null } | null;
}

// A share should never hang on this call; past this the caller falls back
// to a `?from=` link.
const CREATE_TIMEOUT_MS = 5000;

/**
 * The signed-in user's short link for a prompt (created on first share,
 * reused after). It identifies them as the sharer without a `?from=`
 * parameter a recipient could delete.
 */
export const createShareLink = async (
  kind: ShareLinkKind,
  slug: string,
): Promise<ShareLink> => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  const response = await axios.post(
    `${API_URL}/api/share-links`,
    { kind, slug },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      timeout: CREATE_TIMEOUT_MS,
    },
  );
  return response.data;
};

export const SHARE_CODE_PATTERN = /^[A-Za-z0-9]{8}$/;

const isKind = (value: unknown): value is ShareLinkKind =>
  value === "daily" || value === "mood";

/**
 * Public lookup of a short link. Null when the code is malformed, unknown,
 * or the response is unusable — callers show "not found" either way.
 * Server-safe (plain fetch, not cached: a deleted link should stop working).
 */
export const fetchShareLink = async (
  code: string,
): Promise<ResolvedShareLink | null> => {
  if (!SHARE_CODE_PATTERN.test(code)) return null;
  try {
    const res = await fetch(
      `${API_URL}/api/share-links/${encodeURIComponent(code)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!isKind(data?.kind) || typeof data?.slug !== "string" || !data.slug) {
      return null;
    }
    const sharer =
      data.sharer && typeof data.sharer.username === "string"
        ? {
            username: data.sharer.username,
            usernameSlug:
              typeof data.sharer.usernameSlug === "string"
                ? data.sharer.usernameSlug
                : null,
          }
        : null;
    return { kind: data.kind, slug: data.slug, sharer };
  } catch (error) {
    console.error(error);
    return null;
  }
};
