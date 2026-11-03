import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react";
import { PENDING_KEY, doneKey, markWalkthroughPending } from "@/lib/walkthrough";

// Renders the real overlay in jsdom (no layout: every rect is 0x0, so spotlit
// steps exercise the "target never shows up" path).

let pathname = "/share";
const push = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ push }),
}));

const { default: Walkthrough } = await import("./Walkthrough");

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const token = (payload: object) =>
  `x.${btoa(JSON.stringify(payload)).replace(/=+$/, "")}.y`;

let container: HTMLDivElement;
let root: Root;

const render = () =>
  act(() => {
    root.render(createElement(Walkthrough));
  });

const advance = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

const dialog = () =>
  document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]');
const button = (label: string) =>
  [...document.querySelectorAll("button")].find(
    (b) => b.textContent === label || b.getAttribute("aria-label") === label,
  )!;

beforeEach(() => {
  // The tour measures targets on animation frames, timed with performance.
  vi.useFakeTimers({
    toFake: [
      "setTimeout",
      "clearTimeout",
      "setInterval",
      "clearInterval",
      "Date",
      "requestAnimationFrame",
      "cancelAnimationFrame",
      "performance",
    ],
  });
  pathname = "/share";
  localStorage.clear();
  localStorage.setItem(
    "authToken",
    token({ userId: 5, userEmail: "ana@example.com", userName: "ana" }),
  );
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  document.body.innerHTML = "";
  vi.useRealTimers();
});

describe("Walkthrough", () => {
  it("starts once for a new account and records a skip", async () => {
    markWalkthroughPending("ana@example.com");
    render();
    expect(dialog()).toBeNull();
    await advance(1000);
    expect(dialog()?.textContent).toContain("Welcome to Cuentto, ana");

    await act(async () => button("Skip").click());
    expect(dialog()).toBeNull();
    expect(localStorage.getItem(doneKey(5))).toBe("1");
    expect(localStorage.getItem(PENDING_KEY)).toBeNull();
  });

  it("does nothing for existing accounts", async () => {
    render();
    await advance(3000);
    expect(dialog()).toBeNull();
  });

  it("waits on onboarding and mid-task pages", async () => {
    markWalkthroughPending("ana@example.com");
    pathname = "/cuentto/create";
    render();
    await advance(3000);
    expect(dialog()).toBeNull();
  });

  it("waits while another dialog is open", async () => {
    markWalkthroughPending("ana@example.com");
    const other = document.createElement("div");
    other.setAttribute("role", "dialog");
    other.setAttribute("data-state", "open");
    document.body.appendChild(other);
    render();
    await advance(2500);
    expect(dialog()).toBeNull();

    other.remove();
    await advance(1100);
    expect(dialog()).not.toBeNull();
  });

  it("skips steps whose target is missing or hidden, then finishes", async () => {
    markWalkthroughPending("ana@example.com");
    // Rendered but 0x0 (as in jsdom): each such step is skipped after a wait.
    for (const id of ["nav-think", "nav-write"]) {
      const el = document.createElement("div");
      el.dataset.tour = id;
      document.body.appendChild(el);
    }
    render();
    await advance(1000);
    await act(async () => button("Show me around").click());
    // act() holds renders until its scope ends, so advance one hop at a time.
    for (let i = 0; i < 6; i++) await advance(800);
    expect(dialog()?.textContent).toContain("You're all set");

    await act(async () => button("Start writing").click());
    expect(dialog()).toBeNull();
    expect(push).toHaveBeenCalledWith("/write");
    expect(localStorage.getItem(doneKey(5))).toBe("1");
  });

  it("closes on Escape", async () => {
    markWalkthroughPending("ana@example.com");
    render();
    await advance(1000);
    await act(async () => {
      dialog()!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });
    expect(dialog()).toBeNull();
    expect(localStorage.getItem(doneKey(5))).toBe("1");
  });

  it("closes without finishing when the route changes", async () => {
    markWalkthroughPending("ana@example.com");
    render();
    await advance(1000);
    expect(dialog()).not.toBeNull();
    pathname = "/cuentto/create";
    render();
    expect(dialog()).toBeNull();
    // Still pending: it comes back on the next main page.
    expect(localStorage.getItem(PENDING_KEY)).not.toBeNull();
  });

  it("can be replayed on demand", async () => {
    localStorage.setItem(doneKey(5), "1");
    render();
    await act(async () => {
      window.dispatchEvent(new Event("cuentto:walkthrough-start"));
    });
    expect(dialog()).not.toBeNull();
  });
});
