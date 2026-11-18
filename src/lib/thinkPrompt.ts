// Mirrors the backend's cap on admin-written Today's Prompts. The API also
// sends its own `maxWords`, which wins when present; this is the fallback.
export const THINK_PROMPT_MAX_WORDS = 30;

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// The viewer's own calendar day as YYYY-MM-DD, sent with Think requests so a
// prompt scheduled for the 27th shows on their 27th. Not toISOString(), which
// gives the UTC day and is off by one for part of every day outside UTC.
export function localDateKey(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The viewer's IANA timezone (e.g. "America/Puerto_Rico"), or null. */
export function viewerTimeZone(): string | null {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return typeof zone === "string" && zone ? zone : null;
  } catch {
    return null;
  }
}

/**
 * How Think requests say which day it is for the viewer. `tz` lets the
 * server work out their date on its own clock (right even if the device
 * clock is off); `date` is the fallback for when the zone can't be read.
 */
export function viewerDayParams(now: Date = new Date()): {
  date: string;
  tz?: string;
} {
  const tz = viewerTimeZone();
  return tz ? { date: localDateKey(now), tz } : { date: localDateKey(now) };
}

/** Milliseconds from `now` until the next local midnight (DST-safe). */
export function msUntilNextLocalMidnight(now: Date = new Date()): number {
  const next = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );
  return next.getTime() - now.getTime();
}
