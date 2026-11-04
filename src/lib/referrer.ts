// Who shared the prompt a guest arrived on. Shared prompt links carry the
// sharer as `?from=<username>`; the guest's browser remembers it until they
// sign up, when it's sent as `referrer` so the backend records it. That lets
// the new user add the sharer to a circle before either follows the other.

const STORAGE_KEY = "cuentto:referrer";
const FROM_PARAM = "from";
// A remembered sharer older than this no longer applies to a sign-up.
export const REFERRER_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

interface StoredReferrer {
  username: string;
  savedAt: number;
}

/**
 * A username or username slug: 1–100 characters with no surrounding
 * whitespace or control characters. Inner spaces are allowed — older and
 * mobile-created accounts can have them (e.g. "haris noman"); the link
 * encodes them and the backend resolves either form.
 */
export const isReferrerUsername = (value: unknown): value is string =>
  typeof value === "string" &&
  value.length > 0 &&
  value.length <= 100 &&
  value === value.trim() &&
  !/[\u0000-\u001f\u007f]/.test(value);

/** `path` with `?from=<username>` added (or replaced); unchanged without one. */
export const withReferrer = (path: string, username: string | null) => {
  if (!isReferrerUsername(username)) return path;
  const [base, hash = ""] = path.split("#");
  const [pathname, search = ""] = base.split("?");
  const params = new URLSearchParams(search);
  params.set(FROM_PARAM, username);
  return `${pathname}?${params.toString()}${hash ? `#${hash}` : ""}`;
};

/** The sharer named in a query string (e.g. `location.search`), if valid. */
export const referrerFromSearch = (search: string): string | null => {
  const value = new URLSearchParams(search).get(FROM_PARAM)?.trim() ?? "";
  return isReferrerUsername(value) ? value : null;
};

export const rememberReferrer = (username: string, now = Date.now()) => {
  if (!isReferrerUsername(username)) return;
  try {
    const entry: StoredReferrer = { username, savedAt: now };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // Storage unavailable (private mode, quota) — the link just won't count.
  }
};

/** The remembered sharer, or null when there's none, it's stale or corrupt. */
export const readReferrer = (now = Date.now()): string | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Partial<StoredReferrer>;
    if (
      !isReferrerUsername(entry?.username) ||
      typeof entry.savedAt !== "number" ||
      now - entry.savedAt > REFERRER_MAX_AGE_MS
    ) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return entry.username;
  } catch {
    return null;
  }
};

export const clearReferrer = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
};
