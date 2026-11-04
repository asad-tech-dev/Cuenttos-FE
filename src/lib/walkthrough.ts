// First-run walkthrough: which steps exist, when the tour may start, and where
// its popover goes. Pure logic only, so it's unit-testable; the overlay itself
// is `components/walkthrough/Walkthrough.tsx`.
//
// Storage (localStorage, every access guarded — private mode or a full quota
// must never break the page):
//  - `PENDING_KEY`: set at sign-up, holding the new account's email. Sign-up
//    can be followed by /interest and a separate sign-in, so the user id isn't
//    known yet; the email ties the pending tour to that account, so someone
//    else signing in on the same browser never gets it.
//  - `doneKey(userId)`: the tour was finished or skipped by this account.
// Accounts created before the walkthrough existed never have a pending mark,
// so they don't suddenly get the tour.

export const PENDING_KEY = "cuentto:walkthrough:pending";
export const doneKey = (userId: number) => `cuentto:walkthrough:done:${userId}`;
/** Fired on `window` to (re)start the tour on demand, e.g. "Take the tour". */
export const WALKTHROUGH_START_EVENT = "cuentto:walkthrough-start";
/** A sign-up that never reaches the app within this long drops its tour. */
export const PENDING_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export interface WalkthroughStep {
  id: string;
  title: string;
  body: string;
  /** `data-tour` value of the element to spotlight; none = centered card. */
  target?: string;
}

export const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: "welcome",
    title: "Welcome to Cuentto",
    body: "A calm space to think, write freely and share with the people closest to you. Here's a quick look around. It takes less than a minute.",
  },
  {
    id: "think",
    target: "nav-think",
    title: "Think",
    body: "Start here. Today's Prompt gives you something new to reflect on every day, and you can explore more prompts by mood.",
  },
  {
    id: "write",
    target: "nav-write",
    title: "Write",
    body: "Your writing desk. Begin a Cuentto from a prompt or a blank page, then pick a mood and some background music.",
  },
  {
    id: "share",
    target: "nav-share",
    title: "Share",
    body: "See what's trending and every Cuentto your circles have shared with you.",
  },
  {
    id: "saved",
    target: "nav-saved",
    title: "Saved",
    body: "Bookmark the Cuenttos that move you and come back to them anytime.",
  },
  {
    id: "profile",
    target: "nav-profile",
    title: "Profile",
    body: "Your Cuenttos, your circles and your account settings, all in one place.",
  },
  {
    id: "tour",
    target: "nav-tour",
    title: "Need a refresher?",
    body: "You can replay this tour from here whenever you like.",
  },
  {
    id: "done",
    title: "You're all set ✨",
    body: "Your words are safe here. Why not write your first Cuentto?",
  },
];

// --- storage ---------------------------------------------------------------

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const browserStorage = (): StorageLike | null => {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** Called right after a successful sign-up. */
export const markWalkthroughPending = (
  email: string,
  storage: StorageLike | null = browserStorage(),
  now = Date.now(),
): void => {
  if (!storage || !email.trim()) return;
  try {
    storage.setItem(
      PENDING_KEY,
      JSON.stringify({ email: normalizeEmail(email), at: now }),
    );
  } catch {
    // Storage full or blocked: the tour just won't show.
  }
};

/** Whether the tour should start on its own for this signed-in account. */
export const isWalkthroughDue = (
  user: { userId: number; email: string | null } | null,
  storage: StorageLike | null = browserStorage(),
  now = Date.now(),
): boolean => {
  if (!storage || !user?.email) return false;
  try {
    if (storage.getItem(doneKey(user.userId))) return false;
    const raw = storage.getItem(PENDING_KEY);
    if (!raw) return false;
    const pending = JSON.parse(raw) as { email?: unknown; at?: unknown };
    if (typeof pending.email !== "string" || typeof pending.at !== "number") {
      return false;
    }
    if (now - pending.at > PENDING_TTL_MS) return false;
    return pending.email === normalizeEmail(user.email);
  } catch {
    return false;
  }
};

/** Finished or skipped: never start on its own again for this account. */
export const markWalkthroughDone = (
  userId: number | null,
  storage: StorageLike | null = browserStorage(),
): void => {
  if (!storage) return;
  try {
    if (userId !== null) storage.setItem(doneKey(userId), "1");
    storage.removeItem(PENDING_KEY);
  } catch {
    // Worst case the tour offers itself once more; never worth a crash.
  }
};

/** userId / email / name from the stored access token, without verifying it. */
export const readTokenUser = (
  token: string | null | undefined,
): { userId: number; email: string | null; name: string | null } | null => {
  if (!token) return null;
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as Record<string, unknown>;
    if (typeof payload.userId !== "number") return null;
    return {
      userId: payload.userId,
      email: typeof payload.userEmail === "string" ? payload.userEmail : null,
      name: typeof payload.userName === "string" ? payload.userName : null,
    };
  } catch {
    return null;
  }
};

// --- where it may start ----------------------------------------------------

// The main app pages. Anything else (onboarding, the guided writing flow,
// writing/editing a Cuentto, a shared prompt or cuentto link, admin) is
// mid-task, so a pending tour waits until the user lands on one of these.
const TOUR_PAGES = ["/think", "/write", "/share", "/saved", "/profile"];

export const canAutoStartOn = (pathname: string | null | undefined): boolean => {
  if (!pathname) return false;
  const path = pathname.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  if (path === "/profile/edit") return false;
  return TOUR_PAGES.some((page) => path === page || path.startsWith(`${page}/`));
};

// --- step navigation ---------------------------------------------------------

/**
 * The index to show when moving from `from` in `direction`, skipping steps
 * whose target isn't on screen (e.g. a nav item that isn't rendered). Centered
 * steps are always available. Returns null when there's nothing left that way.
 */
export const nextAvailableStep = (
  steps: WalkthroughStep[],
  from: number,
  direction: 1 | -1,
  isTargetAvailable: (target: string) => boolean,
): number | null => {
  for (let i = from + direction; i >= 0 && i < steps.length; i += direction) {
    const target = steps[i].target;
    if (!target || isTargetAvailable(target)) return i;
  }
  return null;
};

// --- positioning ---------------------------------------------------------------

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type Placement = "right" | "bottom" | "top" | "left" | "center";

export interface PopoverPosition {
  top: number;
  left: number;
  placement: Placement;
  /** Arrow offset along the popover's edge facing the target, in px. */
  arrow: number | null;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

/**
 * Where the popover goes for a target: to the right of it if there's room
 * (the nav lives on the left), else below, above, or to the left — the first
 * that fits — and centered when there's no target or nothing fits. Always
 * clamped inside the viewport with `margin`, so it never causes horizontal
 * scroll, even at 320px.
 */
export const computePopoverPosition = (
  target: Rect | null,
  popover: { width: number; height: number },
  viewport: { width: number; height: number },
  gap = 16,
  margin = 12,
): PopoverPosition => {
  const maxLeft = viewport.width - popover.width - margin;
  const maxTop = viewport.height - popover.height - margin;
  const centered: PopoverPosition = {
    top: clamp((viewport.height - popover.height) / 2, margin, maxTop),
    left: clamp((viewport.width - popover.width) / 2, margin, maxLeft),
    placement: "center",
    arrow: null,
  };
  if (!target) return centered;

  const midY = target.top + target.height / 2;
  const midX = target.left + target.width / 2;
  const fits = {
    right:
      target.left + target.width + gap + popover.width + margin <=
      viewport.width,
    bottom:
      target.top + target.height + gap + popover.height + margin <=
      viewport.height,
    top: target.top - gap - popover.height - margin >= 0,
    left: target.left - gap - popover.width - margin >= 0,
  };

  // The arrow tracks the target's middle, kept off the card's rounded corners.
  const arrowAlong = (start: number, length: number, mid: number) =>
    clamp(mid - start, 24, length - 24);

  if (fits.right || fits.left) {
    const top = clamp(midY - popover.height / 2, margin, maxTop);
    const left = fits.right
      ? target.left + target.width + gap
      : target.left - gap - popover.width;
    return {
      top,
      left,
      placement: fits.right ? "right" : "left",
      arrow: arrowAlong(top, popover.height, midY),
    };
  }
  if (fits.bottom || fits.top) {
    const left = clamp(midX - popover.width / 2, margin, maxLeft);
    return {
      top: fits.bottom
        ? target.top + target.height + gap
        : target.top - gap - popover.height,
      left,
      placement: fits.bottom ? "bottom" : "top",
      arrow: arrowAlong(left, popover.width, midX),
    };
  }
  return centered;
};

/** A rect counts as on screen if any of it is inside the viewport. */
export const isRectVisible = (
  rect: Rect,
  viewport: { width: number; height: number },
): boolean =>
  rect.width > 0 &&
  rect.height > 0 &&
  rect.left + rect.width > 0 &&
  rect.top + rect.height > 0 &&
  rect.left < viewport.width &&
  rect.top < viewport.height;
