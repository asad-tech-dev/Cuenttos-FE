import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, Root } from "react-dom/client";

const restoreSession = vi.fn<() => Promise<boolean>>();
vi.mock("@/lib/api/auth", () => ({ restoreSession: () => restoreSession() }));

const router = { replace: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const {
  default: SessionRestoreGate,
  SESSION_RESTORE_OVERLAY_ID,
  SHOW_LOADER_SCRIPT,
  RESTORE_TIMEOUT_MS,
} = await import("./SessionRestoreGate");

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

let container: HTMLDivElement;
let root: Root;

const overlay = () =>
  document.getElementById(SESSION_RESTORE_OVERLAY_ID) as HTMLDivElement;

const render = async () => {
  await act(async () => {
    root.render(createElement(SessionRestoreGate));
  });
};

const pending = () => {
  let resolve!: (value: boolean) => void;
  const promise = new Promise<boolean>((r) => (resolve = r));
  return { promise, resolve };
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  window.history.replaceState(null, "", "/login");
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});

describe("SessionRestoreGate", () => {
  it("does nothing for a visitor with no stored session", async () => {
    await render();
    expect(overlay().hidden).toBe(true);
    expect(restoreSession).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("covers the login screen while restoring, then goes to /share", async () => {
    localStorage.setItem("authToken", "stored");
    const restore = pending();
    restoreSession.mockReturnValue(restore.promise);
    await render();
    expect(overlay().hidden).toBe(false);
    expect(overlay().textContent).toContain("Signing you in");

    await act(async () => restore.resolve(true));
    expect(router.replace).toHaveBeenCalledWith("/share");
    // Stays up until the next page replaces this one.
    expect(overlay().hidden).toBe(false);
  });

  it("honours a safe ?redirect=", async () => {
    localStorage.setItem("authToken", "stored");
    window.history.replaceState(null, "", "/login?redirect=%2Fthink%3Ftab%3D1");
    restoreSession.mockResolvedValue(true);
    await render();
    expect(router.replace).toHaveBeenCalledWith("/think?tab=1");
  });

  it("ignores an unsafe ?redirect=", async () => {
    localStorage.setItem("authToken", "stored");
    window.history.replaceState(null, "", "/login?redirect=https%3A%2F%2Fevil.example");
    restoreSession.mockResolvedValue(true);
    await render();
    expect(router.replace).toHaveBeenCalledWith("/share");
  });

  it("shows the login form when the session is really over", async () => {
    localStorage.setItem("authToken", "expired");
    restoreSession.mockResolvedValue(false);
    await render();
    expect(overlay().hidden).toBe(true);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("shows the login form if restoring fails unexpectedly", async () => {
    localStorage.setItem("authToken", "stored");
    restoreSession.mockRejectedValue(new Error("boom"));
    await render();
    expect(overlay().hidden).toBe(true);
  });

  it("falls back to the login form if restoring takes too long", async () => {
    vi.useFakeTimers();
    localStorage.setItem("authToken", "stored");
    restoreSession.mockReturnValue(pending().promise);
    await render();
    expect(overlay().hidden).toBe(false);
    await act(async () => {
      vi.advanceTimersByTime(RESTORE_TIMEOUT_MS);
    });
    expect(overlay().hidden).toBe(true);
  });
});

describe("the inline before-paint script", () => {
  const page = () => {
    const el = document.createElement("div");
    el.id = SESSION_RESTORE_OVERLAY_ID;
    el.hidden = true;
    document.body.appendChild(el);
    return el;
  };
  const runScript = () => new Function(SHOW_LOADER_SCRIPT)();

  afterEach(() => {
    document.getElementById(SESSION_RESTORE_OVERLAY_ID)?.remove();
  });

  it("reveals the loader when a session is stored", () => {
    localStorage.setItem("authToken", "stored");
    const el = page();
    runScript();
    expect(el.hidden).toBe(false);
  });

  it("leaves the login screen alone for a visitor with no session", () => {
    const el = page();
    runScript();
    expect(el.hidden).toBe(true);
  });

  it("hides the loader by itself if the app never takes over", () => {
    vi.useFakeTimers();
    localStorage.setItem("authToken", "stored");
    const el = page();
    runScript();
    vi.advanceTimersByTime(RESTORE_TIMEOUT_MS + 2000);
    expect(el.hidden).toBe(true);
  });

  it("never throws, even if storage is blocked", () => {
    const spy = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });
    expect(runScript).not.toThrow();
    spy.mockRestore();
  });
});
