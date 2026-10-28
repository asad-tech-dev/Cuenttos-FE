import { describe, expect, it } from "vitest";
import {
  THINK_PROMPT_MAX_WORDS,
  countWords,
  localDateKey,
} from "./thinkPrompt";
import { promptDraftKey } from "./cuenttoDraft";

describe("countWords", () => {
  it("counts words and ignores extra whitespace", () => {
    expect(countWords("  Think   about\nTrump's deal  ")).toBe(4);
    expect(countWords("")).toBe(0);
    expect(countWords("   ")).toBe(0);
  });

  it("matches the backend's 30-word cap", () => {
    expect(THINK_PROMPT_MAX_WORDS).toBe(30);
  });
});

describe("promptDraftKey", () => {
  it("keeps question prompts keyed by group id, as before", () => {
    expect(promptDraftKey("12", null)).toBe("12");
    expect(promptDraftKey(null, null)).toBeNull();
  });

  it("keys a written Today's Prompt by its slug", () => {
    expect(promptDraftKey(null, "think-about-home")).toBe(
      "daily:think-about-home",
    );
  });
});

describe("localDateKey", () => {
  it("uses the local calendar day, not the UTC one", () => {
    // 00:42 local on the 27th: local fields, whatever the machine's timezone.
    expect(localDateKey(new Date(2026, 9, 27, 0, 42))).toBe("2026-10-27");
    expect(localDateKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });
});
