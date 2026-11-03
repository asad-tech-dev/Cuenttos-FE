import { afterEach, describe, expect, it, vi } from "vitest";
import {
  REFERRER_MAX_AGE_MS,
  clearReferrer,
  isReferrerUsername,
  readReferrer,
  referrerFromSearch,
  rememberReferrer,
  withReferrer,
} from "./referrer";

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("withReferrer", () => {
  it("adds the sharer to a plain path", () => {
    expect(withReferrer("/prompt/daily/a-place", "sony")).toBe(
      "/prompt/daily/a-place?from=sony",
    );
  });

  it("keeps existing params and hash, and replaces an old from", () => {
    expect(withReferrer("/prompt/x?a=1&from=old#top", "jose")).toBe(
      "/prompt/x?a=1&from=jose#top",
    );
  });

  it("encodes the username", () => {
    expect(withReferrer("/prompt/x", "ana&b")).toBe("/prompt/x?from=ana%26b");
  });

  it("encodes usernames with spaces (older accounts have them)", () => {
    expect(withReferrer("/prompt/daily/x", "haris noman")).toBe(
      "/prompt/daily/x?from=haris+noman",
    );
  });

  it("leaves the link alone without a valid username", () => {
    for (const name of [null, "", " padded ", "tab\there"]) {
      expect(withReferrer("/prompt/x", name)).toBe("/prompt/x");
    }
  });
});

describe("referrerFromSearch", () => {
  it("reads and trims ?from=", () => {
    expect(referrerFromSearch("?from=sony")).toBe("sony");
    expect(referrerFromSearch("?a=1&from=%20jose%20")).toBe("jose");
  });

  it("round-trips a username with a space", () => {
    const link = withReferrer("/prompt/daily/x", "haris noman");
    expect(referrerFromSearch(link.slice(link.indexOf("?")))).toBe(
      "haris noman",
    );
  });

  it("ignores a missing or malformed value", () => {
    expect(referrerFromSearch("")).toBeNull();
    expect(referrerFromSearch("?from=")).toBeNull();
    expect(referrerFromSearch("?from=%20%20")).toBeNull();
    expect(referrerFromSearch("?from=a%0Ab")).toBeNull();
    expect(referrerFromSearch(`?from=${"x".repeat(101)}`)).toBeNull();
  });
});

describe("remembered referrer", () => {
  it("round-trips and clears", () => {
    rememberReferrer("sony");
    expect(readReferrer()).toBe("sony");
    clearReferrer();
    expect(readReferrer()).toBeNull();
  });

  it("the latest link wins", () => {
    rememberReferrer("sony");
    rememberReferrer("jose");
    expect(readReferrer()).toBe("jose");
  });

  it("expires after the max age", () => {
    rememberReferrer("sony", 1_000);
    expect(readReferrer(1_000 + REFERRER_MAX_AGE_MS)).toBe("sony");
    expect(readReferrer(1_001 + REFERRER_MAX_AGE_MS)).toBeNull();
    expect(localStorage.getItem("cuentto:referrer")).toBeNull();
  });

  it("drops corrupt entries", () => {
    for (const raw of ["not json", "{}", '{"username":" a ","savedAt":1}']) {
      localStorage.setItem("cuentto:referrer", raw);
      expect(readReferrer()).toBeNull();
    }
  });

  it("never throws when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => rememberReferrer("sony")).not.toThrow();
    expect(readReferrer()).toBeNull();
    expect(() => clearReferrer()).not.toThrow();
  });

  it("only accepts usernames", () => {
    expect(isReferrerUsername("sony")).toBe(true);
    expect(isReferrerUsername("haris noman")).toBe(true);
    expect(isReferrerUsername("")).toBe(false);
    expect(isReferrerUsername(" sony")).toBe(false);
    expect(isReferrerUsername(42)).toBe(false);
    rememberReferrer("line\nbreak");
    expect(readReferrer()).toBeNull();
  });
});
