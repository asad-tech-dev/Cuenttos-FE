import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import { MAX_CHECK_INTERVAL_MS, useLocalDayChange } from "./useLocalDayChange";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const onDayChange = vi.fn();
function Probe() {
  useLocalDayChange(onDayChange);
  return null;
}

let container: HTMLDivElement;
let root: Root;

const mount = () =>
  act(() => {
    root.render(createElement(Probe));
  });
const advance = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
const setVisibility = (state: "visible" | "hidden") => {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => state,
  });
  act(() => {
    document.dispatchEvent(new Event("visibilitychange"));
  });
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
  // 23:00 local on 11 November.
  vi.setSystemTime(new Date(2026, 10, 11, 23, 0, 0));
  onDayChange.mockReset();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});

describe("useLocalDayChange", () => {
  it("fires at local midnight with the new day, not before", async () => {
    mount();
    await advance(60 * 60 * 1000 - 1000);
    expect(onDayChange).not.toHaveBeenCalled();
    await advance(2000); // just past midnight (+1s buffer)
    expect(onDayChange).toHaveBeenCalledTimes(1);
    expect(onDayChange).toHaveBeenCalledWith("2026-11-12");
  });

  it("keeps going: fires again the next midnight", async () => {
    mount();
    await advance(60 * 60 * 1000 + 1000);
    await advance(24 * 60 * 60 * 1000);
    expect(onDayChange.mock.calls.map((c) => c[0])).toEqual([
      "2026-11-12",
      "2026-11-13",
    ]);
  });

  it("catches up when a background tab comes back on a new day", () => {
    mount();
    setVisibility("hidden");
    // Timers were held back (sleep / background tab); the clock moved on.
    vi.setSystemTime(new Date(2026, 10, 12, 8, 15));
    expect(onDayChange).not.toHaveBeenCalled();
    setVisibility("visible");
    expect(onDayChange).toHaveBeenCalledWith("2026-11-12");
  });

  it("catches up on window focus too, once per new day", () => {
    mount();
    vi.setSystemTime(new Date(2026, 10, 12, 8, 15));
    act(() => {
      window.dispatchEvent(new Event("focus"));
    });
    act(() => {
      window.dispatchEvent(new Event("focus"));
    });
    setVisibility("visible");
    expect(onDayChange).toHaveBeenCalledTimes(1);
  });

  it("does nothing when focus returns on the same day", () => {
    mount();
    vi.setSystemTime(new Date(2026, 10, 11, 23, 30));
    act(() => {
      window.dispatchEvent(new Event("focus"));
    });
    setVisibility("visible");
    expect(onDayChange).not.toHaveBeenCalled();
  });

  it("re-checks at least hourly, so a corrected clock is noticed", async () => {
    vi.setSystemTime(new Date(2026, 10, 11, 9, 0, 0)); // 15h to midnight
    mount();
    // The clock is corrected forward a day without any timer firing.
    vi.setSystemTime(new Date(2026, 10, 12, 9, 0, 0));
    await advance(MAX_CHECK_INTERVAL_MS);
    expect(onDayChange).toHaveBeenCalledWith("2026-11-12");
  });

  it("stops listening when unmounted", async () => {
    mount();
    act(() => root.unmount());
    vi.setSystemTime(new Date(2026, 10, 12, 8, 0));
    window.dispatchEvent(new Event("focus"));
    await vi.advanceTimersByTimeAsync(2 * 60 * 60 * 1000);
    expect(onDayChange).not.toHaveBeenCalled();
    root = createRoot(container);
  });
});
