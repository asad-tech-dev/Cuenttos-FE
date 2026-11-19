"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/app/components/ui/Spinner";
import { restoreSession } from "@/lib/api/auth";
import { isSafeRedirectPath } from "@/lib/safeRedirect";

// Someone who is still signed in and opens /login (e.g. reopening the site
// after closing the tab) is sent straight on -- without the login screen
// flashing first.
//
// Why this needs more than an effect: /login is static HTML, so the browser
// paints the login screen as soon as it arrives, long before any JavaScript
// runs; then restoring the session can take a network round trip (the access
// token expires after 24h and is renewed with the refresh cookie). The
// refresh cookie belongs to the API's domain, so the web server can't see it
// and redirect up front either.
//
// So: a few bytes of inline script, run by the browser while it parses the
// page (before first paint), show a plain loader over the login screen
// whenever this browser holds a session. React then restores it and
// redirects, or -- if the session is really over -- hides the loader and the
// login form is simply there. Visitors with no stored session never see the
// loader at all, so their login page is exactly as before.

export const SESSION_RESTORE_OVERLAY_ID = "session-restore-overlay";
/** Longest we keep the loader up before falling back to the login form. */
export const RESTORE_TIMEOUT_MS = 10_000;

const AUTH_TOKEN_KEY = "authToken";

const hasStoredSession = (): boolean => {
  try {
    return Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
  } catch {
    return false;
  }
};

// Runs before first paint. Only reveals the loader (never redirects -- React
// decides that), and hides it again on its own if the app's JavaScript never
// takes over, so a failed bundle can't leave anyone stuck on a spinner.
export const SHOW_LOADER_SCRIPT = `try{if(localStorage.getItem(${JSON.stringify(
  AUTH_TOKEN_KEY,
)})){var o=document.getElementById(${JSON.stringify(
  SESSION_RESTORE_OVERLAY_ID,
)});if(o){o.removeAttribute("hidden");setTimeout(function(){o.setAttribute("hidden","")},${
  RESTORE_TIMEOUT_MS + 2000
})}}}catch(e){}`;

// Layout effect on the client so that arriving at /login by in-app navigation
// (where the inline script doesn't run) also shows the loader before paint.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const redirectTarget = (): string => {
  const redirect = new URLSearchParams(window.location.search).get("redirect");
  return isSafeRedirectPath(redirect) ? redirect : "/share";
};

export default function SessionRestoreGate() {
  const router = useRouter();
  // Starts false to match the server HTML; the inline script may already
  // have revealed the loader, which the layout effect below then confirms.
  const [restoring, setRestoring] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (!hasStoredSession()) return;
    setRestoring(true);

    let active = true;
    const giveUp = window.setTimeout(() => {
      if (active) setRestoring(false);
    }, RESTORE_TIMEOUT_MS);
    const showLogin = () => {
      window.clearTimeout(giveUp);
      if (active) setRestoring(false);
    };

    restoreSession()
      .then((authed) => {
        if (!active) return;
        if (authed) {
          window.clearTimeout(giveUp);
          // The loader stays up until the next page replaces this one.
          router.replace(redirectTarget());
        } else {
          showLogin();
        }
      })
      .catch(showLogin);

    return () => {
      active = false;
      window.clearTimeout(giveUp);
    };
  }, [router]);

  return (
    <>
      <div
        id={SESSION_RESTORE_OVERLAY_ID}
        hidden={!restoring}
        // The inline script may un-hide it before hydration; that's intended.
        suppressHydrationWarning
        role="status"
        aria-live="polite"
        className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
      >
        <Spinner size="w-10 h-10" borderSize="border-4" color="border-violet" />
        <span className="sr-only">Signing you in…</span>
      </div>
      <script dangerouslySetInnerHTML={{ __html: SHOW_LOADER_SCRIPT }} />
    </>
  );
}
