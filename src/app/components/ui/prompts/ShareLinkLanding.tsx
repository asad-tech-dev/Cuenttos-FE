"use client";
import { useEffect } from "react";
import { isAuthenticated } from "@/lib/api/auth";
import { rememberReferrer } from "@/lib/referrer";

interface ShareLinkLandingProps {
  /** Username (slug) of whoever shared the link, if known. */
  sharer: string | null;
  /** The prompt's own page, shown in the address bar instead of /s/<code>. */
  canonicalPath: string;
}

/**
 * Runs once on a short share link: a signed-out visitor remembers the sharer
 * (sent as `referrer` if they sign up), then the URL becomes the prompt's
 * canonical one without reloading the page. Renders nothing.
 */
export default function ShareLinkLanding({
  sharer,
  canonicalPath,
}: ShareLinkLandingProps) {
  useEffect(() => {
    if (sharer && !isAuthenticated()) rememberReferrer(sharer);
    // Only same-origin prompt paths, so a bad value can't send anyone away.
    if (!canonicalPath.startsWith("/prompt/")) return;
    try {
      // Next.js keeps its router in sync with a plain replaceState.
      window.history.replaceState(
        null,
        "",
        `${canonicalPath}${window.location.hash}`,
      );
    } catch {
      // Not critical: the visitor just keeps seeing the short URL.
    }
  }, [sharer, canonicalPath]);

  return null;
}
