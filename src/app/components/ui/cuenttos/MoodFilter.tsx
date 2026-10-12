"use client";

import { Cuentto } from "@/types/cuentto";

export type MoodOption = { key: string; title: string; color: string };

// Moods can come without an id on older payloads, so fall back to the title.
export const moodKeyOf = (mood?: Cuentto["mood"] | null): string | null =>
  mood?.title ? (mood.id != null ? `id:${mood.id}` : `t:${mood.title}`) : null;

/**
 * The distinct moods used by `cuenttos`, in mood-id order (the same order the
 * mood list uses elsewhere) — so the filter never offers a mood with nothing
 * behind it.
 */
export const moodsFromCuenttos = (cuenttos: Cuentto[]): MoodOption[] => {
  const byKey = new Map<string, MoodOption & { id: number }>();
  for (const { mood } of cuenttos) {
    const key = moodKeyOf(mood);
    if (!key || byKey.has(key)) continue;
    byKey.set(key, {
      key,
      id: mood.id ?? Number.MAX_SAFE_INTEGER,
      title: mood.title,
      color: mood.color || "#EEEAFE",
    });
  }
  return [...byKey.values()]
    .sort((a, b) => a.id - b.id || a.title.localeCompare(b.title))
    .map(({ key, title, color }) => ({ key, title, color }));
};

// Bring a tapped chip fully into view when it's half off-screen in the
// swipeable row.
const revealChip = (chip: HTMLElement) =>
  chip.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "nearest",
  });

// Selected chip: a brand-violet ring set just outside the pill with a white
// gap, so the mood colour stays intact and the selection reads clearly.
const selectedRing = "ring-1 ring-offset-white";

const chipBase =
  "h-[34px] px-4 inline-flex items-center rounded-full text-[13px] whitespace-nowrap shrink-0 cursor-pointer select-none transition-all duration-150 active:scale-95 hover:brightness-95";

/**
 * Mood chips ("All" + one per mood), mirroring the mobile app's feed filter.
 * On phones the row swipes sideways like the app; from tablet width up the
 * chips wrap instead, since a hidden horizontal scrollbar is hard to use with
 * a mouse.
 */
export default function MoodFilter({
  moods,
  selectedKey,
  onSelect,
}: {
  moods: MoodOption[];
  selectedKey: string | null;
  onSelect: (key: string | null) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filter by mood"
      className="flex flex-row gap-2 overflow-x-auto hide-scrollbar md:flex-wrap md:overflow-visible -mx-1.5 px-1.5 py-1.5"
    >
      <button
        type="button"
        aria-pressed={selectedKey === null}
        onClick={(e) => {
          revealChip(e.currentTarget);
          onSelect(null);
        }}
        className={`${chipBase} bg-violet text-white ${
          selectedKey === null ? `font-semibold ${selectedRing}` : "font-medium"
        }`}
      >
        All
      </button>
      {moods.map((mood) => {
        const isSelected = selectedKey === mood.key;
        return (
          <button
            key={mood.key}
            type="button"
            aria-pressed={isSelected}
            onClick={(e) => {
              revealChip(e.currentTarget);
              onSelect(isSelected ? null : mood.key);
            }}
            className={`${chipBase} text-black ${
              isSelected ? `font-semibold ${selectedRing}` : "font-medium"
            }`}
            style={{ backgroundColor: mood.color }}
          >
            {mood.title}
          </button>
        );
      })}
    </div>
  );
}
