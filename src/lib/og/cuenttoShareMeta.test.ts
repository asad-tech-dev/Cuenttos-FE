import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DESCRIPTION_MAX,
  PublicCuentto,
  cuenttoDescription,
  cuenttoMetadata,
  fetchPublicCuenttoById,
  fetchPublicCuenttoBySlug,
  htmlToPlainText,
  stripEmoji,
  truncate,
} from "./cuenttoShareMeta";

const cuentto = (over: Partial<PublicCuentto> = {}): PublicCuentto => ({
  id: 7,
  title: "Mi primer día",
  description: "<p>Hoy escribí <strong>algo</strong> nuevo.</p>",
  createdAt: "2026-11-18T10:00:00.000Z",
  slug: "mi-primer-dia",
  isPublic: true,
  isSelfShared: false,
  mood: { title: "Calm", color: "#C7F0D8" },
  user: { username: "Jose Arroyo", usernameSlug: "jose-arroyo" },
  ...over,
});

describe("htmlToPlainText", () => {
  it("strips tags and keeps words on separate lines apart", () => {
    expect(htmlToPlainText("<p>One</p><p>Two<br>Three</p>")).toBe(
      "One Two Three",
    );
  });

  it("decodes named and numeric entities, including Spanish ones", () => {
    expect(
      htmlToPlainText("&iquest;Qu&eacute; tal?&nbsp;A&amp;B &#8220;hi&#8221; &#x1F600;"),
    ).toBe("¿Qué tal? A&B “hi” 😀");
  });

  it("drops script and style contents", () => {
    expect(
      htmlToPlainText("<style>p{color:red}</style>Hi<script>alert(1)</script>"),
    ).toBe("Hi");
  });

  it("handles empty input", () => {
    expect(htmlToPlainText("")).toBe("");
    expect(htmlToPlainText(null)).toBe("");
  });
});

describe("truncate", () => {
  it("leaves short text alone", () => {
    expect(truncate("Short text", 20)).toBe("Short text");
  });

  it("cuts at a word boundary with an ellipsis, within the limit", () => {
    const out = truncate("The quick brown fox jumps over the lazy dog", 20);
    expect(out).toBe("The quick brown fox…");
    expect(Array.from(out).length).toBeLessThanOrEqual(20);
  });

  it("doesn't leave trailing punctuation before the ellipsis", () => {
    expect(truncate("Hello there, my friend and more", 14)).toBe("Hello there…");
  });
});

describe("stripEmoji", () => {
  it("removes emoji (incl. joined sequences and flags) and tidies spaces", () => {
    expect(stripEmoji("Feliz 🎉 día 👨‍👩‍👧 🇵🇷!")).toBe("Feliz día !");
  });
});

describe("cuenttoDescription", () => {
  it("is the plain-text excerpt, capped for previews", () => {
    const long = `<p>${"palabra ".repeat(60)}</p>`;
    const out = cuenttoDescription(cuentto({ description: long }));
    expect(Array.from(out).length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    expect(out.endsWith("…")).toBe(true);
  });

  it("falls back to the author when the body is empty", () => {
    expect(cuenttoDescription(cuentto({ description: "<p>&nbsp;</p>" }))).toBe(
      "A Cuentto by Jose Arroyo.",
    );
  });
});

describe("cuenttoMetadata", () => {
  it("puts the Cuentto's title on the page and in the share tags", () => {
    const meta = cuenttoMetadata(cuentto());
    expect(meta.title).toBe("Mi primer día — Cuentto");
    expect(meta.description).toBe("Hoy escribí algo nuevo.");
    expect(meta.openGraph).toMatchObject({
      type: "article",
      siteName: "Cuentto",
      title: "Mi primer día",
      description: "Hoy escribí algo nuevo.",
      url: "/jose-arroyo/cuentto/mi-primer-dia",
      authors: ["Jose Arroyo"],
      publishedTime: "2026-11-18T10:00:00.000Z",
    });
    expect(meta.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Mi primer día",
    });
    expect(meta.alternates?.canonical).toBe("/jose-arroyo/cuentto/mi-primer-dia");
  });

  it("uses the legacy path when there's no slug", () => {
    const meta = cuenttoMetadata(cuentto({ slug: null }));
    expect(meta.openGraph).toMatchObject({ url: "/cuentto/7" });
  });

  it("never sends a blank title", () => {
    expect(cuenttoMetadata(cuentto({ title: "   " })).openGraph).toMatchObject({
      title: "A Cuentto",
    });
  });
});

describe("fetching the public Cuentto", () => {
  const fetchMock = vi.fn();
  const respond = (status: number, body: unknown) =>
    fetchMock.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    });

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test");
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("asks the slug route without any credentials", async () => {
    respond(200, { cuentto: cuentto() });
    const result = await fetchPublicCuenttoBySlug("jose arroyo", "mi/slug");
    expect(result?.title).toBe("Mi primer día");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://api.test/api/cuentto/jose%20arroyo/mi%2Fslug");
    expect(init.headers).toBeUndefined();
    expect(init.cache).toBe("no-store");
  });

  it("returns null for a private (401) or missing (404) Cuentto", async () => {
    respond(401, { message: "Authentication required" });
    expect(await fetchPublicCuenttoBySlug("u", "s")).toBeNull();
    respond(404, { message: "Cuentto not found" });
    expect(await fetchPublicCuenttoById("7")).toBeNull();
  });

  it("refuses a non-public or journal Cuentto even if one comes back", async () => {
    respond(200, { cuentto: cuentto({ isPublic: false }) });
    expect(await fetchPublicCuenttoById("7")).toBeNull();
    respond(200, { cuentto: cuentto({ isSelfShared: true }) });
    expect(await fetchPublicCuenttoById("7")).toBeNull();
  });

  it("returns null on network errors and malformed payloads", async () => {
    fetchMock.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    expect(await fetchPublicCuenttoById("7")).toBeNull();
    respond(200, { nope: true });
    expect(await fetchPublicCuenttoById("7")).toBeNull();
  });

  it("doesn't call the API for an invalid legacy id", async () => {
    expect(await fetchPublicCuenttoById("abc")).toBeNull();
    expect(await fetchPublicCuenttoById("0")).toBeNull();
    expect(await fetchPublicCuenttoById("-3")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses the legacy detail route for an id", async () => {
    respond(200, { cuentto: cuentto() });
    await fetchPublicCuenttoById("7");
    expect(fetchMock.mock.calls[0][0]).toBe("http://api.test/api/cuentto/detail/7");
  });
});
