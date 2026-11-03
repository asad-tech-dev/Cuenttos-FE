import { describe, expect, it } from "vitest";
import {
  PENDING_KEY,
  PENDING_TTL_MS,
  WALKTHROUGH_STEPS,
  canAutoStartOn,
  computePopoverPosition,
  doneKey,
  isRectVisible,
  isWalkthroughDue,
  markWalkthroughDone,
  markWalkthroughPending,
  nextAvailableStep,
  readTokenUser,
} from "./walkthrough";

const memoryStorage = () => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };
};

const throwingStorage = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("quota");
  },
  removeItem: () => {
    throw new Error("blocked");
  },
};

const NOW = 1_800_000_000_000;
const user = { userId: 7, email: "Sony@Example.com " };

describe("walkthrough storage", () => {
  it("is due for the account that just signed up", () => {
    const storage = memoryStorage();
    markWalkthroughPending("sony@example.com", storage, NOW);
    expect(isWalkthroughDue(user, storage, NOW + 1000)).toBe(true);
  });

  it("isn't due for anyone else signing in on the same browser", () => {
    const storage = memoryStorage();
    markWalkthroughPending("new@example.com", storage, NOW);
    expect(isWalkthroughDue(user, storage, NOW)).toBe(false);
  });

  it("isn't due for existing accounts that never signed up here", () => {
    expect(isWalkthroughDue(user, memoryStorage(), NOW)).toBe(false);
  });

  it("stops once finished or skipped, and clears the pending mark", () => {
    const storage = memoryStorage();
    markWalkthroughPending("sony@example.com", storage, NOW);
    markWalkthroughDone(7, storage);
    expect(storage.getItem(doneKey(7))).toBe("1");
    expect(storage.getItem(PENDING_KEY)).toBeNull();
    // Even if the same email signs up again on this browser.
    markWalkthroughPending("sony@example.com", storage, NOW);
    expect(isWalkthroughDue(user, storage, NOW)).toBe(false);
  });

  it("drops a pending tour that's too old", () => {
    const storage = memoryStorage();
    markWalkthroughPending("sony@example.com", storage, NOW);
    expect(isWalkthroughDue(user, storage, NOW + PENDING_TTL_MS + 1)).toBe(
      false,
    );
  });

  it("survives corrupt values and blocked storage", () => {
    const storage = memoryStorage();
    storage.setItem(PENDING_KEY, "{not json");
    expect(isWalkthroughDue(user, storage, NOW)).toBe(false);
    storage.setItem(PENDING_KEY, JSON.stringify({ email: 1, at: "x" }));
    expect(isWalkthroughDue(user, storage, NOW)).toBe(false);

    expect(() => markWalkthroughPending("a@b.co", throwingStorage)).not.toThrow();
    expect(() => markWalkthroughDone(7, throwingStorage)).not.toThrow();
    expect(isWalkthroughDue(user, throwingStorage, NOW)).toBe(false);
    expect(isWalkthroughDue(user, null, NOW)).toBe(false);
    expect(isWalkthroughDue(null, memoryStorage(), NOW)).toBe(false);
  });
});

describe("readTokenUser", () => {
  const token = (payload: object) =>
    `x.${btoa(JSON.stringify(payload)).replace(/=+$/, "")}.y`;

  it("reads id, email and name from the access token", () => {
    expect(
      readTokenUser(token({ userId: 3, userEmail: "a@b.co", userName: "ana" })),
    ).toEqual({ userId: 3, email: "a@b.co", name: "ana" });
  });

  it("returns null for missing or malformed tokens", () => {
    expect(readTokenUser(null)).toBeNull();
    expect(readTokenUser("")).toBeNull();
    expect(readTokenUser("nodots")).toBeNull();
    expect(readTokenUser("x.%%%.y")).toBeNull();
    expect(readTokenUser(token({ userId: "3" }))).toBeNull();
  });
});

describe("canAutoStartOn", () => {
  it("starts on the main app pages", () => {
    for (const path of ["/think", "/write", "/share", "/saved", "/profile", "/share/"]) {
      expect(canAutoStartOn(path)).toBe(true);
    }
    expect(canAutoStartOn("/profile/sony")).toBe(true);
  });

  it("waits while onboarding or mid-task", () => {
    for (const path of [
      "/interest",
      "/mindfulness",
      "/login",
      "/register",
      "/cuentto/create",
      "/cuentto/edit/4",
      "/prompt/daily/think-about-home",
      "/sony/cuentto/my-story",
      "/profile/edit",
      "/admin/think",
      "/thinker",
      "/",
      "",
      null,
    ]) {
      expect(canAutoStartOn(path)).toBe(false);
    }
  });
});

describe("nextAvailableStep", () => {
  const steps = [
    { id: "a", title: "", body: "" },
    { id: "b", title: "", body: "", target: "nav-b" },
    { id: "c", title: "", body: "", target: "nav-c" },
    { id: "d", title: "", body: "" },
  ];

  it("moves to the neighbouring step when its target is there", () => {
    expect(nextAvailableStep(steps, 0, 1, () => true)).toBe(1);
    expect(nextAvailableStep(steps, 2, -1, () => true)).toBe(1);
  });

  it("skips steps whose target is missing, in either direction", () => {
    const only = (t: string) => t === "nav-c";
    expect(nextAvailableStep(steps, 0, 1, only)).toBe(2);
    expect(nextAvailableStep(steps, 3, -1, (t) => t === "nav-b")).toBe(1);
    expect(nextAvailableStep(steps, 0, 1, () => false)).toBe(3);
  });

  it("returns null past either end", () => {
    expect(nextAvailableStep(steps, 3, 1, () => true)).toBeNull();
    expect(nextAvailableStep(steps, 0, -1, () => true)).toBeNull();
  });

  it("opens and closes on centered steps", () => {
    expect(WALKTHROUGH_STEPS[0].target).toBeUndefined();
    expect(WALKTHROUGH_STEPS[WALKTHROUGH_STEPS.length - 1].target).toBeUndefined();
    const ids = WALKTHROUGH_STEPS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("computePopoverPosition", () => {
  const card = { width: 340, height: 200 };
  const desktop = { width: 1440, height: 900 };

  it("centers the card when there's no target", () => {
    expect(computePopoverPosition(null, card, desktop)).toEqual({
      top: 350,
      left: 550,
      placement: "center",
      arrow: null,
    });
  });

  it("sits to the right of a sidebar item, arrow on its middle", () => {
    const pos = computePopoverPosition(
      { top: 300, left: 26, width: 212, height: 68 },
      card,
      desktop,
    );
    expect(pos.placement).toBe("right");
    expect(pos.left).toBe(26 + 212 + 16);
    expect(pos.top).toBe(234);
    expect(pos.arrow).toBe(100);
  });

  it("goes below the target on a 320px phone and stays on screen", () => {
    const phone = { width: 320, height: 640 };
    const narrow = { width: 296, height: 210 };
    const pos = computePopoverPosition(
      { top: 120, left: 26, width: 212, height: 68 },
      narrow,
      phone,
    );
    expect(pos.placement).toBe("bottom");
    expect(pos.top).toBe(120 + 68 + 16);
    expect(pos.left).toBeGreaterThanOrEqual(12);
    expect(pos.left + narrow.width).toBeLessThanOrEqual(320 - 12);
  });

  it("goes above when there's no room below", () => {
    const phone = { width: 320, height: 640 };
    const pos = computePopoverPosition(
      { top: 520, left: 26, width: 212, height: 68 },
      { width: 296, height: 210 },
      phone,
    );
    expect(pos.placement).toBe("top");
    expect(pos.top).toBe(520 - 16 - 210);
  });

  it("clamps the vertical position near the bottom edge", () => {
    const pos = computePopoverPosition(
      { top: 860, left: 26, width: 212, height: 30 },
      card,
      desktop,
    );
    expect(pos.placement).toBe("right");
    expect(pos.top + card.height).toBeLessThanOrEqual(900 - 12);
    // The arrow still points at the target, within the card.
    expect(pos.arrow).toBeLessThanOrEqual(card.height - 24);
  });

  it("falls back to centered when nothing fits, and never goes negative", () => {
    const tiny = { width: 300, height: 260 };
    const pos = computePopoverPosition(
      { top: 0, left: 0, width: 300, height: 260 },
      { width: 296, height: 240 },
      tiny,
    );
    expect(pos.placement).toBe("center");
    expect(pos.left).toBeGreaterThanOrEqual(12);
    expect(pos.top).toBeGreaterThanOrEqual(12);
  });
});

describe("isRectVisible", () => {
  const vp = { width: 375, height: 700 };
  it("treats a closed drawer item as hidden", () => {
    expect(isRectVisible({ top: 120, left: -230, width: 200, height: 56 }, vp)).toBe(false);
  });
  it("treats zero-size or off-screen rects as hidden", () => {
    expect(isRectVisible({ top: 0, left: 0, width: 0, height: 0 }, vp)).toBe(false);
    expect(isRectVisible({ top: 900, left: 10, width: 50, height: 50 }, vp)).toBe(false);
  });
  it("accepts a rect partly on screen", () => {
    expect(isRectVisible({ top: 680, left: 10, width: 50, height: 50 }, vp)).toBe(true);
  });
});
