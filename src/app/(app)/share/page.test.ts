import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, Root } from "react-dom/client";

// Each request is held open until the test settles it, so the loading phase
// can be inspected.
type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (err: unknown) => void;
};
const deferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  let reject!: (err: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

let shared: Deferred<unknown[]>;
let featured: Deferred<unknown[]>;
vi.mock("@/lib/api/cuentto", () => ({
  fetchAllCuenttos: () => shared.promise,
  fetchFeaturedCuenttos: () => featured.promise,
}));

// The auth gate isn't under test: render the page directly.
vi.mock("@/HOC/checkAuth", () => ({
  default: <P,>(Component: P) => Component,
}));

vi.mock("@/app/components/skeletons/CuenttoFeatured", () => ({
  SkeletonCuenttoFeatured: () =>
    createElement("div", { "data-testid": "skeleton-featured" }),
}));
vi.mock("@/app/components/skeletons/CuenttoFeed", () => ({
  SkeletonCuenttoFeed: () =>
    createElement("div", { "data-testid": "skeleton-feed" }),
}));
vi.mock("@/app/components/ui/cuenttos/cuenttoFeedCard", () => ({
  default: ({ cuentto }: { cuentto: { id: number } }) =>
    createElement("div", { "data-testid": "feed-card" }, String(cuentto.id)),
}));
vi.mock("@/app/components/ui/cuenttos/featuredCuenttosCard", () => ({
  default: ({ cuentto }: { cuentto: { id: number } }) =>
    createElement("div", { "data-testid": "featured-card" }, String(cuentto.id)),
}));
vi.mock("@/app/components/ui/cuenttos/MoodFilter", () => ({
  default: () => null,
  moodKeyOf: () => null,
  moodsFromCuenttos: () => [],
}));

const { default: SharePage } = await import("./page");

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const TRENDING_EMPTY = "No trending Cuenttos yet";
const SHARED_EMPTY = "Nothing shared with you yet";

let container: HTMLDivElement;
let root: Root;

const text = () => container.textContent ?? "";
const has = (testId: string) =>
  container.querySelector(`[data-testid="${testId}"]`) !== null;

const render = async () => {
  await act(async () => {
    root.render(createElement(SharePage as React.ComponentType));
  });
};

const settle = async (fn: () => void) => {
  await act(async () => {
    fn();
  });
};

beforeEach(() => {
  shared = deferred();
  featured = deferred();
  vi.spyOn(console, "log").mockImplementation(() => {});
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

describe("Share page loading states", () => {
  it("shows skeletons, not empty states, on the very first render", () => {
    // Synchronous render: nothing has been fetched or awaited yet.
    act(() => {
      root.render(createElement(SharePage as React.ComponentType));
    });
    expect(has("skeleton-featured")).toBe(true);
    expect(has("skeleton-feed")).toBe(true);
    expect(text()).not.toContain(TRENDING_EMPTY);
    expect(text()).not.toContain(SHARED_EMPTY);
  });

  it("keeps Trending loading while only Shared to you has arrived", async () => {
    await render();
    await settle(() => shared.resolve([]));

    expect(has("skeleton-featured")).toBe(true);
    expect(text()).not.toContain(TRENDING_EMPTY);
    expect(has("skeleton-feed")).toBe(false);
    expect(text()).toContain(SHARED_EMPTY);
  });

  it("keeps Shared to you loading while only Trending has arrived", async () => {
    await render();
    await settle(() => featured.resolve([]));

    expect(has("skeleton-feed")).toBe(true);
    expect(text()).not.toContain(SHARED_EMPTY);
    expect(has("skeleton-featured")).toBe(false);
    expect(text()).toContain(TRENDING_EMPTY);
  });

  it("shows each section's cards once its data arrives", async () => {
    await render();
    await settle(() => {
      featured.resolve([{ id: 1 }, { id: 2 }]);
      shared.resolve([{ id: 3 }]);
    });

    expect(has("skeleton-featured")).toBe(false);
    expect(has("skeleton-feed")).toBe(false);
    expect(container.querySelectorAll('[data-testid="featured-card"]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-testid="feed-card"]')).toHaveLength(1);
    expect(text()).not.toContain(TRENDING_EMPTY);
    expect(text()).not.toContain(SHARED_EMPTY);
  });

  it("shows the empty states only after both requests finish with nothing", async () => {
    await render();
    await settle(() => {
      featured.resolve([]);
      shared.resolve([]);
    });

    expect(text()).toContain(TRENDING_EMPTY);
    expect(text()).toContain(SHARED_EMPTY);
  });

  it("stops loading when a request fails, as before", async () => {
    await render();
    await settle(() => {
      featured.reject(new Error("network"));
      shared.reject(new Error("network"));
    });

    expect(has("skeleton-featured")).toBe(false);
    expect(has("skeleton-feed")).toBe(false);
  });
});
