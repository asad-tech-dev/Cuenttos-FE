import { describe, it, expect } from "vitest";
import { moodKeyOf, moodsFromCuenttos } from "./MoodFilter";
import { Cuentto } from "@/types/cuentto";

const c = (mood: Partial<Cuentto["mood"]> | null): Cuentto =>
  ({ id: Math.random(), mood }) as unknown as Cuentto;

describe("moodsFromCuenttos", () => {
  it("lists only the moods the cuenttos use, once each, in mood-id order", () => {
    const moods = moodsFromCuenttos([
      c({ id: 3, title: "Calm", color: "#cce" }),
      c({ id: 1, title: "Joy", color: "#fd0" }),
      c({ id: 3, title: "Calm", color: "#cce" }),
    ]);
    expect(moods).toEqual([
      { key: "id:1", title: "Joy", color: "#fd0" },
      { key: "id:3", title: "Calm", color: "#cce" },
    ]);
  });

  it("skips cuenttos without a mood and falls back to title/default colour", () => {
    const moods = moodsFromCuenttos([
      c(null),
      c({ title: "Nostalgia", color: "" }),
    ]);
    expect(moods).toEqual([
      { key: "t:Nostalgia", title: "Nostalgia", color: "#EEEAFE" },
    ]);
  });

  it("is empty for an empty list (the filter is then hidden)", () => {
    expect(moodsFromCuenttos([])).toEqual([]);
  });
});

describe("moodKeyOf", () => {
  it("matches a cuentto to its mood chip", () => {
    expect(moodKeyOf({ id: 2, title: "Joy", color: "#fd0" })).toBe("id:2");
    expect(moodKeyOf({ title: "Joy", color: "#fd0" })).toBe("t:Joy");
    expect(moodKeyOf(null)).toBeNull();
  });
});
