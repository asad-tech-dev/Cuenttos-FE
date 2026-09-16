import { getCuenttoPath } from "./cuenttoLink";
import CustomToast from "@/app/components/toasts/toast";

// Only the fields sharing actually needs, so both the feed card (full Cuentto)
// and any lighter payload can pass straight through.
export interface ShareableCuentto {
  id: number;
  title?: string;
  slug?: string | null;
  publicLink?: string | null;
  isPublic?: boolean;
  isSelfShared?: boolean;
  user: { usernameSlug?: string | null };
}

/**
 * A link is only worth handing out if the recipient can actually open it.
 * `isSelfShared` is journal-only — private to the owner even through the
 * canonical share URL, which the backend enforces server-side. A non-public
 * cuentto resolves for group members only, so a shared link would just wall
 * an outsider at login.
 *
 * `isPublic` missing is treated as public: that matches the column's schema
 * default, and every current endpoint returns the field.
 */
export function isPubliclyShareable(cuentto: ShareableCuentto): boolean {
  if (cuentto.isSelfShared) return false;
  if (cuentto.isPublic === false) return false;
  // A link must actually be resolvable. `id` alone is enough — getCuenttoPath
  // falls back to the legacy /cuentto/{id} route, which the backend also
  // serves unauthenticated for a public cuentto.
  return Boolean(cuentto.publicLink || cuentto.slug || cuentto.id);
}

/**
 * Always origin-relative, matching how /think shares a prompt. The backend's
 * own `publicLink` is deliberately not used for the host — it is built from
 * APP_BASE_URL, so on staging or localhost it would hand out a link pointing
 * at a different environment than the one you're looking at.
 */
export function buildCuenttoShareUrl(cuentto: ShareableCuentto): string {
  return `${window.location.origin}${getCuenttoPath(cuentto)}`;
}

/**
 * Shares a cuentto's public link. Phones and tablets get the real OS share
 * sheet via the Web Share API; everywhere else falls back to copy-to-clipboard
 * plus a toast, which is the behaviour /think already uses for prompts.
 */
export async function shareCuentto(cuentto: ShareableCuentto): Promise<void> {
  if (!isPubliclyShareable(cuentto)) {
    CustomToast({
      title: cuentto.isSelfShared
        ? "This Cuentto is in your journal, so only you can open it."
        : "This Cuentto is shared with a group, so it has no public link.",
    });
    return;
  }

  const url = buildCuenttoShareUrl(cuentto);
  const title = cuentto.title || "A Cuentto";

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title,
        text: `"${title}" on Cuentto`,
        url,
      });
      return;
    } catch (error) {
      // Dismissing the share sheet is a normal outcome, not a failure —
      // stay silent. Anything else falls through to copying the link.
      if ((error as Error)?.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    CustomToast({ title: "Cuentto link copied!" });
  } catch (error) {
    console.error(error);
    CustomToast({ title: "Couldn't copy the link. Please try again." });
  }
}
