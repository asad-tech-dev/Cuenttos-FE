import { describe, expect, it } from "vitest";
import { hasShareAudience } from "./shareAudience";

describe("hasShareAudience", () => {
  it("is true for Public, My Journal or a circle", () => {
    expect(hasShareAudience({ isPublic: true })).toBe(true);
    expect(hasShareAudience({ isSelfShared: true })).toBe(true);
    expect(hasShareAudience({ groupIds: [3] })).toBe(true);
    expect(hasShareAudience({ isPublic: true, groupIds: [3, 4] })).toBe(true);
  });

  it("is false when everything is deselected", () => {
    expect(
      hasShareAudience({ isPublic: false, isSelfShared: false, groupIds: [] }),
    ).toBe(false);
  });

  it("tolerates missing or malformed values", () => {
    expect(hasShareAudience(null)).toBe(false);
    expect(hasShareAudience(undefined)).toBe(false);
    expect(hasShareAudience({})).toBe(false);
    expect(hasShareAudience({ groupIds: null })).toBe(false);
    expect(hasShareAudience({ groupIds: ["all", NaN, null] })).toBe(false);
  });

  it("only counts circles the user still has once they're known", () => {
    expect(hasShareAudience({ groupIds: [9] }, [1, 2])).toBe(false);
    expect(hasShareAudience({ groupIds: [9, 2] }, [1, 2])).toBe(true);
    expect(hasShareAudience({ groupIds: [9] }, [])).toBe(false);
    // Public / My Journal don't depend on circles.
    expect(hasShareAudience({ isPublic: true, groupIds: [9] }, [])).toBe(true);
  });

  it("counts every circle while they aren't known", () => {
    expect(hasShareAudience({ groupIds: [9] })).toBe(true);
  });
});
