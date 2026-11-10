import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const createShareLink = vi.fn();
vi.mock("@/lib/api/shareLinks", () => ({ createShareLink }));

const {
  buildPromptShareUrl,
  clearPromptShareCache,
  copyPendingText,
  parsePromptPath,
  promptPath,
} = await import("./promptShareLink");

const origin = "https://cuentto.test";
const share = (path: string, userId: number | null = 1, sharer: string | null = "haris-noman") =>
  buildPromptShareUrl({ path, userId, sharer, origin });

beforeEach(() => {
  clearPromptShareCache();
  createShareLink.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe("parsePromptPath", () => {
  it("reads daily and mood prompt paths", () => {
    expect(parsePromptPath("/prompt/daily/abc-def")).toEqual({ kind: "daily", slug: "abc-def" });
    expect(parsePromptPath("/prompt/calm-mind")).toEqual({ kind: "mood", slug: "calm-mind" });
    expect(parsePromptPath("/prompt/12")).toEqual({ kind: "mood", slug: "12" });
    expect(parsePromptPath("/prompt/a%20b?from=x#top")).toEqual({ kind: "mood", slug: "a b" });
  });

  it("rejects anything else", () => {
    for (const path of ["", "/", "/prompt", "/prompt/", "/prompt/daily/", "/prompt/a/b", "/cuentto/x", "https://evil.test/prompt/x", "/prompt/%E0%A4%A", "/prompt/%20"]) {
      expect(parsePromptPath(path)).toBeNull();
    }
  });

  it("round-trips with promptPath", () => {
    for (const path of ["/prompt/daily/a-b", "/prompt/calm-mind", "/prompt/a%20b"]) {
      expect(promptPath(parsePromptPath(path)!)).toBe(path);
    }
  });
});

describe("buildPromptShareUrl", () => {
  it("uses the short link for a signed-in sharer", async () => {
    createShareLink.mockResolvedValue({ code: "Abc12345", path: "/s/Abc12345" });
    expect(await share("/prompt/daily/today")).toBe(`${origin}/s/Abc12345`);
    expect(createShareLink).toHaveBeenCalledWith("daily", "today");
  });

  it("makes one request per prompt, even on a double click", async () => {
    createShareLink.mockResolvedValue({ code: "Abc12345", path: "/s/Abc12345" });
    const [a, b] = await Promise.all([share("/prompt/x"), share("/prompt/x")]);
    expect(a).toBe(b);
    await share("/prompt/x");
    expect(createShareLink).toHaveBeenCalledTimes(1);
  });

  it("keeps links separate per user", async () => {
    createShareLink
      .mockResolvedValueOnce({ code: "UserOne1" })
      .mockResolvedValueOnce({ code: "UserTwo2" });
    expect(await share("/prompt/x", 1)).toBe(`${origin}/s/UserOne1`);
    expect(await share("/prompt/x", 2)).toBe(`${origin}/s/UserTwo2`);
  });

  it("falls back to ?from= when the request fails, and retries next time", async () => {
    createShareLink.mockRejectedValueOnce(new Error("offline"));
    expect(await share("/prompt/daily/today")).toBe(
      `${origin}/prompt/daily/today?from=haris-noman`,
    );
    createShareLink.mockResolvedValueOnce({ code: "Abc12345" });
    expect(await share("/prompt/daily/today")).toBe(`${origin}/s/Abc12345`);
  });

  it("falls back on an unexpected response", async () => {
    createShareLink.mockResolvedValue({ code: "../../x" });
    expect(await share("/prompt/x")).toBe(`${origin}/prompt/x?from=haris-noman`);
    createShareLink.mockResolvedValue(undefined);
    expect(await share("/prompt/y")).toBe(`${origin}/prompt/y?from=haris-noman`);
  });

  it("skips the short link when signed out or the path isn't a prompt", async () => {
    expect(await share("/prompt/x", null, null)).toBe(`${origin}/prompt/x`);
    expect(await share("/somewhere/else")).toBe(`${origin}/somewhere/else?from=haris-noman`);
    expect(createShareLink).not.toHaveBeenCalled();
  });
});

describe("copyPendingText", () => {
  const setClipboard = (clipboard: Partial<Clipboard> | undefined) =>
    Object.defineProperty(navigator, "clipboard", { value: clipboard, configurable: true });

  afterEach(() => {
    // @ts-expect-error test cleanup
    delete globalThis.ClipboardItem;
  });

  it("writes a promised ClipboardItem when supported", async () => {
    const items: unknown[] = [];
    // @ts-expect-error minimal stand-in
    globalThis.ClipboardItem = class {
      constructor(public data: Record<string, Promise<Blob>>) {}
    };
    const write = vi.fn(async (list: unknown[]) => void items.push(...list));
    const writeText = vi.fn();
    setClipboard({ write, writeText });
    await copyPendingText(Promise.resolve("hello"));
    expect(write).toHaveBeenCalledTimes(1);
    expect(writeText).not.toHaveBeenCalled();
    const blob = await (items[0] as { data: Record<string, Promise<Blob>> }).data["text/plain"];
    expect(blob.type).toBe("text/plain");
    expect(blob.size).toBe("hello".length);
  });

  it("falls back to writeText", async () => {
    const writeText = vi.fn(async () => {});
    setClipboard({ writeText });
    await copyPendingText(Promise.resolve("hello"));
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("falls back to writeText when a promised item is rejected", async () => {
    // @ts-expect-error minimal stand-in
    globalThis.ClipboardItem = class {
      constructor(public data: unknown) {}
    };
    const writeText = vi.fn(async () => {});
    setClipboard({ write: vi.fn(async () => { throw new Error("NotAllowed"); }), writeText });
    await copyPendingText(Promise.resolve("hello"));
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("rejects when the clipboard is unavailable, so the caller can say so", async () => {
    setClipboard(undefined);
    await expect(copyPendingText(Promise.resolve("x"))).rejects.toBeTruthy();
  });
});
