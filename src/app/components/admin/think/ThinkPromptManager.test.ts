import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import type { ThinkPrompt, ThinkPromptInput } from "@/types/think";
import type { Music } from "@/types/music";

const fetchThinkPrompts = vi.fn();
const createThinkPrompt = vi.fn<(data: ThinkPromptInput) => Promise<unknown>>();
const updateThinkPrompt =
  vi.fn<(id: number, data: Partial<ThinkPromptInput>) => Promise<unknown>>();
vi.mock("@/lib/api/think", () => ({
  fetchThinkPrompts: () => fetchThinkPrompts(),
  createThinkPrompt: (data: ThinkPromptInput) => createThinkPrompt(data),
  updateThinkPrompt: (id: number, data: Partial<ThinkPromptInput>) =>
    updateThinkPrompt(id, data),
  deleteThinkPrompt: vi.fn(),
  describeThinkApiError: (_: unknown, fallback: string) => fallback,
}));

const fetchMusics = vi.fn<() => Promise<Music[]>>();
vi.mock("@/lib/api/music", () => ({ fetchMusics: () => fetchMusics() }));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { default: ThinkPromptManager } = await import("./ThinkPromptManager");

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const song = (id: number, name: string): Music => ({
  id,
  name,
  artist: "Artist",
  albumArt: "",
  musicFile: `${id}.mp3`,
  length: 120,
});

const prompt = (overrides: Partial<ThinkPrompt>): ThinkPrompt => ({
  id: 1,
  text: "Write something with this song",
  slug: "write-something",
  shareLink: "/prompt/daily/write-something",
  scheduledFor: null,
  isActive: true,
  musicId: null,
  ...overrides,
});

let container: HTMLDivElement;
let root: Root;

const render = async () => {
  await act(async () => {
    root.render(createElement(ThinkPromptManager));
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

// React tracks input values itself; go through the native setter.
const type = (el: HTMLTextAreaElement, value: string) =>
  act(async () => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!
      .set!.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });

// The song drawer renders in a portal, so look across the whole document.
const songCards = () => [
  ...document.querySelectorAll<HTMLButtonElement>('[role="radio"]'),
];
const songCard = (title: string) =>
  songCards().find((b) => b.textContent?.startsWith(title))!;
const checkedSong = () =>
  songCards().find((b) => b.getAttribute("aria-checked") === "true");
const anyButton = (label: string) =>
  [...document.querySelectorAll<HTMLButtonElement>("button")].find(
    (b) => b.textContent?.trim().startsWith(label),
  )!;

beforeEach(() => {
  vi.clearAllMocks();
  fetchThinkPrompts.mockResolvedValue({
    today: "2026-11-18",
    livePromptId: null,
    maxWords: 30,
    thinkPrompts: [],
  });
  fetchMusics.mockResolvedValue([song(3, "Calm Piano"), song(7, "Jingle")]);
  createThinkPrompt.mockResolvedValue({});
  updateThinkPrompt.mockResolvedValue({});
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("ThinkPromptManager background music", () => {
  it("saves a new prompt with the picked song", async () => {
    await render();
    await click(button("New prompt"));
    await type(
      container.querySelector("#think-prompt-text")!,
      "Write something with this song",
    );
    await click(anyButton("Select music"));
    expect(songCards().map((b) => b.textContent)).toEqual([
      "No songWriters pick their own",
      "Calm PianoArtist",
      "JingleArtist",
    ]);
    expect(checkedSong()?.textContent).toContain("No song");
    await click(songCard("Jingle"));
    expect(checkedSong()?.textContent).toContain("Jingle");
    await click(anyButton("Done"));
    expect(container.textContent).toContain("Jingle");
    await click(button("Save"));
    expect(createThinkPrompt).toHaveBeenCalledWith({
      text: "Write something with this song",
      scheduledFor: null,
      isActive: true,
      musicId: 7,
    });
  });

  it("saves a new prompt without a song as null", async () => {
    await render();
    await click(button("New prompt"));
    await type(container.querySelector("#think-prompt-text")!, "Hello");
    await click(button("Save"));
    expect(createThinkPrompt.mock.calls[0][0].musicId).toBeNull();
  });

  it("shows a prompt's song and keeps it when editing other fields", async () => {
    fetchThinkPrompts.mockResolvedValue({
      today: "2026-11-18",
      livePromptId: null,
      maxWords: 30,
      thinkPrompts: [prompt({ id: 1, musicId: 3 })],
    });
    await render();
    expect(container.textContent).toContain("Calm Piano");
    await click(button("Edit prompt: Write something with this song"));
    expect(container.textContent).toContain("Calm Piano");
    await click(anyButton("Change"));
    expect(checkedSong()?.textContent).toContain("Calm Piano");
    // The drawer's Cancel, not the prompt form's.
    await click(
      [
        ...document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button'),
      ].find((el) => el.textContent?.trim() === "Cancel")!,
    );
    await click(button("Save"));
    expect(updateThinkPrompt).toHaveBeenCalledWith(1, {
      text: "Write something with this song",
      scheduledFor: null,
      isActive: true,
      musicId: 3,
    });
  });

  it("removes the song when No song is picked", async () => {
    fetchThinkPrompts.mockResolvedValue({
      today: "2026-11-18",
      livePromptId: null,
      maxWords: 30,
      thinkPrompts: [prompt({ id: 1, musicId: 3 })],
    });
    await render();
    await click(button("Edit prompt: Write something with this song"));
    await click(
      container.querySelector<HTMLButtonElement>('[aria-label="Remove song"]')!,
    );
    await click(button("Save"));
    expect(updateThinkPrompt.mock.calls[0][1].musicId).toBeNull();
  });

  it("leaves the song untouched when the songs can't load", async () => {
    fetchMusics.mockRejectedValue(new Error("offline"));
    fetchThinkPrompts.mockResolvedValue({
      today: "2026-11-18",
      livePromptId: null,
      maxWords: 30,
      thinkPrompts: [prompt({ id: 1, musicId: 3 })],
    });
    await render();
    await click(button("Edit prompt: Write something with this song"));
    expect(container.textContent).not.toContain("Select music");
    expect(container.textContent).toContain("Couldn't load the songs");
    await click(button("Save"));
    expect("musicId" in updateThinkPrompt.mock.calls[0][1]).toBe(false);
  });

  it("switching a prompt on/off doesn't touch its song", async () => {
    fetchThinkPrompts.mockResolvedValue({
      today: "2026-11-18",
      livePromptId: null,
      maxWords: 30,
      thinkPrompts: [prompt({ id: 1, musicId: 3 })],
    });
    await render();
    await click(
      container.querySelector<HTMLElement>(
        '[aria-label="Switch off: Write something with this song"]',
      )!,
    );
    expect(updateThinkPrompt).toHaveBeenCalledWith(1, { isActive: false });
  });
});
