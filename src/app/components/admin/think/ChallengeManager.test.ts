import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import type { Challenge, ChallengeInput } from "@/types/think";

const fetchChallenges = vi.fn();
const createChallenge = vi.fn<(data: ChallengeInput) => Promise<unknown>>();
const updateChallenge =
  vi.fn<(id: number, data: Partial<ChallengeInput>) => Promise<unknown>>();
vi.mock("@/lib/api/think", () => ({
  fetchChallenges: () => fetchChallenges(),
  createChallenge: (data: ChallengeInput) => createChallenge(data),
  updateChallenge: (id: number, data: Partial<ChallengeInput>) =>
    updateChallenge(id, data),
  deleteChallenge: vi.fn(),
  toggleChallengeActive: vi.fn(),
  describeThinkApiError: (_: unknown, fallback: string) => fallback,
}));

const toastError = vi.fn();
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: (m: string) => toastError(m) },
}));

const { default: ChallengeManager } = await import("./ChallengeManager");

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const challenge = (overrides: Partial<Challenge>): Challenge => ({
  id: 1,
  title: "Sprint",
  description: "Write without stopping.",
  durationSeconds: 300,
  startsAt: null,
  endsAt: null,
  isActive: true,
  ...overrides,
});

let container: HTMLDivElement;
let root: Root;

const render = async () => {
  await act(async () => {
    root.render(createElement(ChallengeManager));
  });
};

const button = (label: string) =>
  [...container.querySelectorAll("button")].find(
    (b) =>
      b.textContent?.trim() === label || b.getAttribute("aria-label") === label,
  )!;

const click = (el: HTMLElement) =>
  act(async () => {
    el.click();
  });

const input = (id: string) =>
  container.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`)!;

// React tracks input values itself; go through the native setter.
const type = (el: HTMLInputElement | HTMLTextAreaElement, value: string) =>
  act(async () => {
    const proto =
      el instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value")!.set!.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });

beforeEach(() => {
  vi.clearAllMocks();
  fetchChallenges.mockResolvedValue({ liveChallengeId: null, challenges: [] });
  createChallenge.mockResolvedValue({});
  updateChallenge.mockResolvedValue({});
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("Show from / Show until in each viewer's local time", () => {
  it("saves the entered wall-clock times as typed, with no zone", async () => {
    await render();
    await click(button("New challenge"));
    await type(input("challenge-title"), "Weekend sprint");
    await type(input("challenge-description"), "Go.");
    await type(input("challenge-starts-at"), "2026-11-20T00:00");
    await type(input("challenge-ends-at"), "2026-11-22T23:30");
    await click(button("Save"));

    expect(createChallenge).toHaveBeenCalledTimes(1);
    expect(createChallenge.mock.calls[0][0]).toMatchObject({
      title: "Weekend sprint",
      startsAt: "2026-11-20T00:00",
      endsAt: "2026-11-22T23:30",
    });
  });

  it("saves empty dates as no bound, as before", async () => {
    await render();
    await click(button("New challenge"));
    await type(input("challenge-title"), "Sprint");
    await type(input("challenge-description"), "Go.");
    await click(button("Save"));
    expect(createChallenge.mock.calls[0][0]).toMatchObject({
      startsAt: null,
      endsAt: null,
    });
  });

  it("still refuses an end that isn't after the start", async () => {
    await render();
    await click(button("New challenge"));
    await type(input("challenge-title"), "Sprint");
    await type(input("challenge-description"), "Go.");
    await type(input("challenge-starts-at"), "2026-11-20T10:00");
    await type(input("challenge-ends-at"), "2026-11-20T09:00");
    await click(button("Save"));
    expect(createChallenge).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith(
      "The end of the window must be after its start.",
    );
  });

  it("tells the admin the dates are each viewer's local time", async () => {
    await render();
    await click(button("New challenge"));
    expect(container.textContent).toContain(
      "Each viewer's local time. Empty = as soon as it's active.",
    );
    expect(container.textContent).toContain(
      "Each viewer's local time. Empty = until you deactivate it.",
    );
  });

  it("edits a viewer-local challenge with the same wall-clock it was saved with", async () => {
    fetchChallenges.mockResolvedValue({
      liveChallengeId: null,
      challenges: [
        challenge({
          startsAt: "2026-11-20T00:00:00",
          endsAt: "2026-11-21T00:00:00",
          viewerLocalTime: true,
        }),
      ],
    });
    await render();
    await click(button("Edit Sprint"));
    expect(input("challenge-starts-at").value).toBe("2026-11-20T00:00");
    expect(input("challenge-ends-at").value).toBe("2026-11-21T00:00");

    await click(button("Save"));
    expect(updateChallenge.mock.calls[0][1]).toMatchObject({
      startsAt: "2026-11-20T00:00",
      endsAt: "2026-11-21T00:00",
    });
  });

  it("labels a viewer-local window on its card, and leaves older ones as they were", async () => {
    fetchChallenges.mockResolvedValue({
      liveChallengeId: null,
      challenges: [
        challenge({
          id: 1,
          title: "Local",
          startsAt: "2026-11-20T00:00:00",
          viewerLocalTime: true,
          isActive: false,
        }),
        challenge({
          id: 2,
          title: "Fixed",
          startsAt: "2026-11-20T04:00:00.000Z",
          viewerLocalTime: false,
          isActive: false,
        }),
      ],
    });
    await render();
    const cards = [...container.querySelectorAll("li")];
    const local = cards.find((li) => li.textContent?.includes("Local"))!;
    const fixed = cards.find((li) => li.textContent?.includes("Fixed"))!;
    expect(local.textContent).toContain(
      `From ${new Date(2026, 10, 20, 0, 0).toLocaleString()} · each viewer's local time`,
    );
    expect(fixed.textContent).toContain(
      `From ${new Date("2026-11-20T04:00:00.000Z").toLocaleString()}`,
    );
    expect(fixed.textContent).not.toContain("each viewer's local time");
  });
});
