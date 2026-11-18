import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import PromptMusicPicker from "./PromptMusicPicker";
import type { Music } from "@/types/music";

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
const songs = [
  song(3, "Calm Piano"),
  song(7, "Jingle", "Santa Band"),
  ...Array.from({ length: 40 }, (_, i) => song(100 + i, `Track ${i + 1}`)),
];

let container: HTMLDivElement;
let root: Root;
const onChange = vi.fn();
const play = vi.fn<() => Promise<void>>();
const pause = vi.fn();

const render = async (
  props: Partial<Parameters<typeof PromptMusicPicker>[0]> = {},
) => {
  await act(async () => {
    root.render(
      createElement(PromptMusicPicker, {
        songs,
        loaded: true,
        failed: false,
        value: "",
        onChange,
        ...props,
      }),
    );
  });
};

// The drawer renders in a portal, so look across the whole document.
const buttonWithText = (text: string) =>
  [...document.querySelectorAll<HTMLButtonElement>("button")].find(
    (b) => b.textContent?.trim().startsWith(text),
  );
const byLabel = (label: string) =>
  document.querySelector<HTMLElement>(`[aria-label="${label}"]`);
const drawer = () => document.querySelector('[role="dialog"]');
const radios = () => [
  ...document.querySelectorAll<HTMLButtonElement>('[role="radio"]'),
];
const radio = (title: string) =>
  radios().find((b) => b.textContent?.startsWith(title))!;
const click = (el: HTMLElement) =>
  act(async () => {
    el.click();
  });
const typeSearch = (value: string) =>
  act(async () => {
    const input = byLabel("Search songs") as HTMLInputElement;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!
      .set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });

beforeEach(() => {
  onChange.mockReset();
  play.mockReset().mockResolvedValue();
  pause.mockReset();
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(play);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(pause);
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

describe("PromptMusicPicker", () => {
  it("keeps the form tidy: only a Select music button, no song list", async () => {
    await render();
    expect(container.textContent).toContain("Select music");
    expect(container.textContent).toContain("Choose from 42 songs");
    expect(radios()).toHaveLength(0);
    expect(drawer()).toBeNull();
  });

  it("opens the drawer with every song in one scrolling list", async () => {
    await render();
    await click(buttonWithText("Select music")!);
    expect(drawer()).not.toBeNull();
    expect(radios()).toHaveLength(43); // "No song" + 42
    expect(radio("No song").getAttribute("aria-checked")).toBe("true");
  });

  it("applies the pick only on Done", async () => {
    await render();
    await click(buttonWithText("Select music")!);
    await click(radio("Jingle"));
    expect(onChange).not.toHaveBeenCalled();
    expect(drawer()!.textContent).toContain("Selected: Jingle");
    await click(buttonWithText("Done")!);
    expect(onChange).toHaveBeenCalledWith("7");
    expect(drawer()).toBeNull();
  });

  it("Cancel closes without changing the song", async () => {
    await render({ value: "3" });
    await click(buttonWithText("Change")!);
    await click(radio("Jingle"));
    await click(buttonWithText("Cancel")!);
    expect(onChange).not.toHaveBeenCalled();
    expect(drawer()).toBeNull();
  });

  it("shows the chosen song in the form, with Change and Remove", async () => {
    await render({ value: "7" });
    expect(container.textContent).toContain("Jingle");
    expect(container.textContent).toContain("Santa Band");
    await click(byLabel("Remove song")!);
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("opens on the current song when changing it", async () => {
    await render({ value: "7" });
    await click(buttonWithText("Change")!);
    expect(radio("Jingle").getAttribute("aria-checked")).toBe("true");
  });

  it("searches by song or artist", async () => {
    await render();
    await click(buttonWithText("Select music")!);
    await typeSearch("santa");
    expect(radios().map((b) => b.textContent)).toEqual(["JingleSanta Band"]);
    expect(drawer()!.textContent).toContain("1 of 42 songs");
    await typeSearch("zzz");
    expect(radios()).toHaveLength(0);
    expect(drawer()!.textContent).toContain("No songs match");
  });

  it("previews without picking, one at a time, and stops when the drawer closes", async () => {
    await render();
    await click(buttonWithText("Select music")!);
    await click(byLabel("Play preview: Calm Piano")!);
    expect(play).toHaveBeenCalledTimes(1);
    expect(radio("Calm Piano").getAttribute("aria-checked")).toBe("false");
    await click(byLabel("Play preview: Jingle")!);
    expect(pause).toHaveBeenCalled();
    expect(byLabel("Pause preview: Jingle")).not.toBeNull();
    pause.mockClear();
    await click(buttonWithText("Cancel")!);
    expect(pause).toHaveBeenCalled();
  });

  it("previews the chosen song from the form", async () => {
    await render({ value: "3" });
    await click(byLabel("Play preview: Calm Piano")!);
    expect(play).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain("Playing preview…");
  });

  it("keeps a song that's no longer in the library", async () => {
    await render({ value: "42" });
    expect(container.textContent).toContain("Current song");
    await click(buttonWithText("Change")!);
    expect(radio("Current song").getAttribute("aria-checked")).toBe("true");
  });

  it("shows a placeholder while loading and a note when loading failed", async () => {
    await render({ loaded: false });
    expect(byLabel("Loading songs")).not.toBeNull();
    await render({ loaded: false, failed: true });
    expect(container.textContent).toContain("Couldn't load the songs");
    expect(buttonWithText("Select music")).toBeUndefined();
  });
});
