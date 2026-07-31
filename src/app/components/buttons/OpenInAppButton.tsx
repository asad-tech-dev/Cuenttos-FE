"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  APP_STORE_URL,
  PLAY_STORE_URL,
  getAndroidIntentUrl,
  getCuenttoDeepLink,
} from "@/lib/constants/appLinks";
import {
  isAndroidDevice,
  isChromeOnAndroid,
  isIOSDevice,
  isInAppBrowser,
} from "@/lib/utils/device";

const FALLBACK_DELAY_MS = 1200;
const TOAST_OPTIONS = {
  duration: 5000,
  position: "top-center" as const,
  style: {
    background: "#FFFFFF",
    color: "#191c1d",
    borderRadius: "8px",
    fontSize: "16px",
    padding: "20px",
  },
};

interface OpenInAppButtonProps {
  id: number | string;
  className?: string;
}

export function OpenInAppButton({ id, className }: OpenInAppButtonProps) {
  const cleanupRef = useRef<(() => void) | null>(null);

  // If the user navigates away while a fallback timer is pending, don't let
  // it fire later and yank them to a store page they didn't ask for.
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  const openViaSchemeWithFallback = (onTimeout: () => void) => {
    let cancelled = false;

    const onVisibilityChange = () => {
      if (document.hidden) cancelled = true;
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const timer = setTimeout(() => {
      cleanup();
      if (!cancelled) {
        try {
          onTimeout();
        } catch (error) {
          console.error("OpenInAppButton fallback navigation failed", error);
        }
      }
    }, FALLBACK_DELAY_MS);

    const onPageHide = () => clearTimeout(timer);
    window.addEventListener("pagehide", onPageHide, { once: true });

    function cleanup() {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
      clearTimeout(timer);
    }
    cleanupRef.current = cleanup;

    try {
      // Must run synchronously inside the click handler — iOS silently
      // blocks scheme navigation if it's deferred (e.g. behind a promise).
      window.location.href = getCuenttoDeepLink(id);
    } catch (error) {
      console.error("Failed to open Cuentto via custom scheme", error);
      cleanup();
      if (!cancelled) onTimeout();
    }
  };

  const handleClick = () => {
    try {
      if (typeof window === "undefined" || typeof navigator === "undefined") {
        return;
      }

      const ua = navigator.userAgent || "";

      if (isInAppBrowser(ua)) {
        toast(
          "Custom links don't work inside this app. Tap ⋯ and choose \"Open in browser\" to download Cuentto.",
          TOAST_OPTIONS,
        );
        return;
      }

      if (isAndroidDevice(ua)) {
        if (isChromeOnAndroid(ua)) {
          window.location.href = getAndroidIntentUrl(id);
        } else {
          // Firefox / Samsung Internet don't reliably support intent://.
          openViaSchemeWithFallback(() => {
            window.location.href = PLAY_STORE_URL;
          });
        }
        return;
      }

      if (isIOSDevice(ua)) {
        openViaSchemeWithFallback(() => {
          if (APP_STORE_URL) {
            window.location.href = APP_STORE_URL;
          } else {
            // App Store listing isn't live yet — never send users to a
            // dead apps.apple.com URL.
            toast("Our iOS app is launching soon — check back shortly.", TOAST_OPTIONS);
          }
        });
        return;
      }

      // Desktop and anything unrecognized: no app to hand off to.
      toast("Download mobile app.", TOAST_OPTIONS);
    } catch (error) {
      console.error("OpenInAppButton click handler failed", error);
    }
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      Download App
    </button>
  );
}
