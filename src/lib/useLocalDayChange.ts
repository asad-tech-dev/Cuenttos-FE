"use client";

import { useEffect, useRef } from "react";
import { localDateKey, msUntilNextLocalMidnight } from "@/lib/thinkPrompt";

// Re-check at least this often. Covers what a single midnight timer can't:
// a laptop waking from sleep, the clock being corrected, or the device
// changing timezone mid-trip. One cheap date comparison per check.
export const MAX_CHECK_INTERVAL_MS = 60 * 60 * 1000;
// A little past midnight, so the check never lands a hair before it.
const MIDNIGHT_BUFFER_MS = 1000;

/**
 * Calls `onDayChange(newDateKey)` when the viewer's local calendar day turns
 * over while the page stays open — at local midnight, or as soon as the tab
 * comes back into view or regains focus on a new day (background tabs and
 * sleeping devices hold timers back). Never fires for the day the page
 * loaded on, and fires once per new day.
 */
export function useLocalDayChange(onDayChange: (dateKey: string) => void) {
  const callbackRef = useRef(onDayChange);
  useEffect(() => {
    callbackRef.current = onDayChange;
  }, [onDayChange]);

  useEffect(() => {
    let lastKey = localDateKey();
    let timer: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(
        check,
        Math.min(
          msUntilNextLocalMidnight() + MIDNIGHT_BUFFER_MS,
          MAX_CHECK_INTERVAL_MS,
        ),
      );
    };

    function check() {
      const key = localDateKey();
      if (key !== lastKey) {
        lastKey = key;
        callbackRef.current(key);
      }
      schedule();
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };

    schedule();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", check);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", check);
    };
  }, []);
}
