import { describe, it, expect } from "vitest";
import {
  CIRCLE_EMOJI_SUGGESTIONS,
  containsEmoji,
  isEmoji,
  toSingleEmoji,
} from "./emoji";

describe("toSingleEmoji", () => {
  it("drops plain text, digits, spaces and punctuation", () => {
    expect(toSingleEmoji("abc")).toBe("");
    expect(toSingleEmoji("123 !?")).toBe("");
    expect(toSingleEmoji("")).toBe("");
  });

  it("keeps an emoji typed among text", () => {
    expect(toSingleEmoji("hi 🎉 there")).toBe("🎉");
  });

  it("keeps only the most recent emoji so a new pick replaces the old", () => {
    expect(toSingleEmoji("🎉🔥")).toBe("🔥");
  });

  it("keeps multi-code-point emoji whole", () => {
    expect(toSingleEmoji("👍🏽")).toBe("👍🏽"); // skin tone
    expect(toSingleEmoji("👨‍👩‍👧")).toBe("👨‍👩‍👧"); // ZWJ family
    expect(toSingleEmoji("🇵🇰")).toBe("🇵🇰"); // flag
    expect(toSingleEmoji("1️⃣")).toBe("1️⃣"); // keycap
    expect(toSingleEmoji("❤️")).toBe("❤️"); // variation selector
  });
});

describe("isEmoji", () => {
  it("accepts exactly one emoji", () => {
    expect(isEmoji("🎉")).toBe(true);
    expect(isEmoji("👨‍👩‍👧")).toBe(true);
  });

  it("rejects text, empty and multiple emoji", () => {
    expect(isEmoji("a")).toBe(false);
    expect(isEmoji("")).toBe(false);
    expect(isEmoji("🎉🎉")).toBe(false);
    expect(isEmoji("🎉a")).toBe(false);
  });

  it("every suggestion is a valid single emoji", () => {
    CIRCLE_EMOJI_SUGGESTIONS.forEach((e) => expect(isEmoji(e)).toBe(true));
  });
});

describe("containsEmoji", () => {
  it("is false for plain text so typing letters can be blocked", () => {
    expect(containsEmoji("a")).toBe(false);
    expect(containsEmoji("hello 123")).toBe(false);
    expect(containsEmoji(" ")).toBe(false);
  });

  it("is true when an emoji is inserted or pasted", () => {
    expect(containsEmoji("🎉")).toBe(true);
    expect(containsEmoji("party 🎉")).toBe(true);
  });
});
