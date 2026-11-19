import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import type { ThinkToday, ThinkPrompt } from "@/types/think";
import type { Music } from "@/types/music";

const fetchThinkToday = vi.fn<() => Promise<ThinkToday>>();
vi.mock("@/lib/api/think", () => ({ fetchThinkToday: () => fetchThinkToday() }));

const fetchMusics = vi.fn<() => Promise<Music[]>>();
vi.mock("@/lib/api/music", () => ({ fetchMusics: () => fetchMusics() }));

vi.mock("@/lib/api/questionGroup", () => ({
  fetchActiveQuestionGroups: async () => [],
}));
vi.mock("@/lib/api/profile", () => ({ fetchUserProfile: vi.fn() }));
vi.mock("@/lib/api/auth", () => ({
  getCurrentUserId: () => null,
  getCurrentUsername: () => null,
}));
vi.mock("@/HOC/checkAuth", () => ({ default: <P,>(Component: P) => Component }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/useLocalDayChange", () => ({ useLocalDayChange: () => {} }));
vi.mock("@/app/components/toasts/toast", () => ({ default: vi.fn() }));
vi.mock("@/app/components/ui/ClampedText", () => ({
  default: ({ text }: { text: string }) => createElement("p", null, text),
}));

const { default: ThinkPage } = await import("./page");

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const song = (id: number, name: string, artist = "Artist"): Music => ({
  id,
  name,
  artist,
  albumArt: "",
  musicFile: `${id}.mp3`,
  length: 120,
});

const written = (overrides: Partial<ThinkPrompt> = {}): ThinkToday => ({
  prompt: {
    source: "scheduled",
    thinkPrompt: {
      id: 1,
      text: "Write about a song you can't forget",
      slug: "song",
      shareLink: "/prompt/daily/song",
      scheduledFor: "2026-11-19",
      isActive: true,
      musicId: null,
      ...overrides,
    },
    question: null,
    questionGroup: null,
  },
  challenge: null,
});

let container: HTMLDivElement;
let root: Root;

const render = async () => {
  await act(async () => {
    root.render(createElement(ThinkPage as React.ComponentType));
  });
  // Let the song list request settle.
  await act(async () => {});
};

const songPill = () =>
  container.querySelector<HTMLElement>('[data-testid="todays-prompt-song"]');

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  fetchMusics.mockResolvedValue([song(3, "Calm Piano"), song(7, "Jingle", "Kids")]);
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

describe("Today's Prompt song", () => {
  it("shows the music name when the prompt has a song", async () => {
    fetchThinkToday.mockResolvedValue(written({ musicId: 7 }));
    await render();
    expect(container.textContent).toContain("Write about a song you can't forget");
    expect(songPill()?.textContent).toContain("Jingle");
    expect(songPill()?.getAttribute("title")).toBe("Jingle · Kids");
    // Beside the "Daily pick" pill, in the same row.
    const row = songPill()!.parentElement!;
    expect(row.children).toHaveLength(2);
    expect(row.children[0].textContent).toContain("Daily pick");
    expect(row.children[1]).toBe(songPill());
  });

  it("leaves the Daily pick row on its own when there's no song", async () => {
    fetchThinkToday.mockResolvedValue(written({ musicId: null }));
    await render();
    const dailyPick = [...container.querySelectorAll("span")].find(
      (el) => el.textContent?.trim() === "Daily pick",
    )!;
    expect(dailyPick.parentElement!.children).toHaveLength(1);
  });

  it("shows nothing extra, and loads no songs, when the prompt has none", async () => {
    fetchThinkToday.mockResolvedValue(written({ musicId: null }));
    await render();
    expect(container.textContent).toContain("Write about a song you can't forget");
    expect(songPill()).toBeNull();
    expect(fetchMusics).not.toHaveBeenCalled();
  });

  it("shows nothing when the song no longer exists", async () => {
    fetchThinkToday.mockResolvedValue(written({ musicId: 99 }));
    await render();
    expect(songPill()).toBeNull();
    expect(container.textContent).toContain("Write about a song you can't forget");
  });

  it("keeps the prompt card when the song list can't load", async () => {
    fetchMusics.mockRejectedValue(new Error("network"));
    fetchThinkToday.mockResolvedValue(written({ musicId: 7 }));
    await render();
    expect(songPill()).toBeNull();
    expect(container.textContent).toContain("Write about a song you can't forget");
    expect(container.textContent).toContain("Start writing");
  });
});
