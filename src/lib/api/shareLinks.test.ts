import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchShareLink } from "./shareLinks";

const respond = (status: number, body: unknown) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(body), { status }),
  );

afterEach(() => vi.restoreAllMocks());

describe("fetchShareLink", () => {
  it("returns the prompt and sharer", async () => {
    const fetchMock = respond(200, {
      kind: "daily",
      slug: "today",
      path: "/prompt/daily/today",
      sharer: { username: "haris noman", usernameSlug: "haris-noman" },
    });
    expect(await fetchShareLink("Abc12345")).toEqual({
      kind: "daily",
      slug: "today",
      sharer: { username: "haris noman", usernameSlug: "haris-noman" },
    });
    expect(fetchMock.mock.calls[0][0]).toBe("http://api.test/api/share-links/Abc12345");
  });

  it("skips the request for malformed codes", async () => {
    const fetchMock = respond(200, {});
    for (const code of ["", "short", "abc/def1", "../../../", "x".repeat(9)]) {
      expect(await fetchShareLink(code)).toBeNull();
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("is null for unknown links, bad payloads and network errors", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    respond(404, { message: "Share link not found" });
    expect(await fetchShareLink("Abc12345")).toBeNull();
    vi.restoreAllMocks();
    respond(200, { kind: "cuentto", slug: "x" });
    expect(await fetchShareLink("Abc12345")).toBeNull();
    vi.restoreAllMocks();
    respond(200, { kind: "mood", slug: "" });
    expect(await fetchShareLink("Abc12345")).toBeNull();
    vi.restoreAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("down"));
    expect(await fetchShareLink("Abc12345")).toBeNull();
  });

  it("tolerates a missing or partial sharer", async () => {
    respond(200, { kind: "mood", slug: "calm", sharer: null });
    expect((await fetchShareLink("Abc12345"))?.sharer).toBeNull();
    vi.restoreAllMocks();
    respond(200, { kind: "mood", slug: "calm", sharer: { username: "Sony" } });
    expect((await fetchShareLink("Abc12345"))?.sharer).toEqual({ username: "Sony", usernameSlug: null });
  });
});
