"use client";

import checkAuth from "@/HOC/checkAuth";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Zap, PenLine, ArrowRight } from "lucide-react";
import { fetchActiveQuestionGroups } from "@/lib/api/questionGroup";
import { QuestionGroup } from "@/types/questionGroup";
import { firstValidQuestion } from "@/lib/questionPrompt";

// There's no "daily pick" flag in the backend, so today's pick is derived
// deterministically from today's date — stable all day, different tomorrow —
// rather than randomized on every visit.
function dailyIndex(dateKey: string, length: number): number {
  if (length <= 0) return 0;
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return hash % length;
}

function estimateReadMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function hexToRgb(hex: string): [number, number, number] | null {
  const match = hex.replace("#", "").match(/^([0-9a-f]{6})$/i);
  if (!match) return null;
  const int = parseInt(match[1], 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Mood colors are admin-set and often pastel/near-white — fine as a soft
// background wash, but unreadable as text/icon foreground. Clamps lightness
// so every mood stays legible while keeping its hue (colors already dark
// enough pass through unchanged).
function readableAccent(hex: string, maxLightness = 42): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const [h, s, l] = rgbToHsl(...rgb);
  if (l <= maxLightness) return hex;
  return hslToHex(h, s, maxLightness);
}

type Mood = { id: number; title: string; color: string };

function ThinkPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<QuestionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMoodId, setSelectedMoodId] = useState<number | "all">("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const active = await fetchActiveQuestionGroups();
        if (cancelled) return;
        setGroups(active.filter((g) => firstValidQuestion(g.questions)));
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setError("Couldn't load today's prompts. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const moods = useMemo(() => {
    const byId = new Map<number, Mood>();
    groups.forEach((g) => {
      if (g.mood?.id != null) {
        byId.set(g.mood.id, {
          id: g.mood.id,
          title: g.mood.title ?? "",
          color: g.mood.color ?? "#5D4DBE",
        });
      }
    });
    return Array.from(byId.values());
  }, [groups]);

  const dailyGroup = useMemo(() => {
    if (!groups.length) return null;
    const today = new Date().toISOString().slice(0, 10);
    return groups[dailyIndex(today, groups.length)];
  }, [groups]);

  const dailyQuestion = dailyGroup ? firstValidQuestion(dailyGroup.questions) : null;
  const dailyText = dailyQuestion
    ? [dailyQuestion.text.trim(), dailyQuestion.description?.trim()]
        .filter(Boolean)
        .join(" ")
    : "";

  const gridGroups = useMemo(
    () =>
      selectedMoodId === "all"
        ? groups
        : groups.filter((g) => g.mood?.id === selectedMoodId),
    [groups, selectedMoodId],
  );

  // Unlike /write's "random prompt" entry into /mindfulness, a prompt picked
  // here is a specific choice — it goes straight to Create Cuentto with that
  // prompt shown at the top, matching the mobile app's behavior.
  const openPrompt = (groupId: number) => {
    router.push(`/cuentto/create?promptGroupId=${groupId}`);
  };

  return (
    <div className="flex flex-col gap-8 px-4 sm:px-6 md:px-[60px] lg:px-[90px] py-2">
      <div className="flex flex-col gap-2">
        <h1 className="text-[26px] sm:text-[30px] font-semibold text-subtle-black">
          Let&apos;s Think ✨
        </h1>
        <p className="text-[15px] leading-[22px] text-gray">
          Pick a prompt, let your mind wander.
          <br />
          No rules — just write.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          <div className="h-[180px] w-full rounded-[24px] bg-gray-6 animate-pulse" />
          <div className="h-[80px] w-full rounded-[16px] bg-gray-6 animate-pulse" />
        </div>
      ) : error ? (
        <p className="text-[14px] text-dark-red">{error}</p>
      ) : (
        <>
          {dailyGroup && dailyQuestion && (
            <div className="flex flex-col gap-3">
              <p className="text-dark-gray text-[12px] font-semibold tracking-[0.12em] uppercase">
                Today&apos;s Prompt
              </p>
              <div className="relative overflow-hidden rounded-[24px] bg-violet px-6 sm:px-10 py-8 sm:py-10 flex flex-col gap-8">
                <div
                  aria-hidden
                  className="absolute -top-10 -right-10 w-[180px] h-[180px] rounded-full bg-white/10"
                />
                <div
                  aria-hidden
                  className="absolute -bottom-16 right-10 w-[220px] h-[220px] rounded-full bg-white/5"
                />
                <div className="relative z-10 flex flex-col gap-5">
                  <span className="inline-flex items-center gap-1.5 w-fit bg-white/15 text-white text-[12px] font-semibold px-3 py-1.5 rounded-full">
                    <Star size={12} className="fill-white text-white" />
                    Daily pick
                  </span>
                  <p className="text-white text-[22px] sm:text-[28px] leading-[30px] sm:leading-[36px] font-medium max-w-[640px]">
                    &quot;{dailyText}&quot;
                  </p>
                </div>
                <div className="relative z-10 flex flex-row flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => openPrompt(dailyGroup.id)}
                    className="inline-flex items-center gap-2 h-[44px] px-6 rounded-[100px] bg-white text-violet text-[14px] font-semibold cursor-pointer whitespace-nowrap"
                  >
                    <PenLine size={16} />
                    Start writing
                  </button>
                  <span className="text-white/70 text-[14px]">
                    {estimateReadMinutes(dailyText)} min read
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <p className="text-dark-gray text-[12px] font-semibold tracking-[0.12em] uppercase">
              Challenge
            </p>
            <div className="flex flex-row items-center gap-4 rounded-[16px] border border-amber-200 bg-amber-50 px-5 py-4">
              <div className="shrink-0 w-12 h-12 rounded-[14px] bg-orange-400 text-white flex items-center justify-center">
                <Zap size={22} className="fill-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-amber-700 text-[12px] font-bold tracking-[0.08em] uppercase">
                  5-min sprint
                </p>
                <p className="text-[14px] text-subtle-black">
                  Write without stopping. Don&apos;t edit. Just flow.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/cuentto/create?challenge=5min")}
                className="shrink-0 inline-flex items-center justify-center h-[38px] px-5 rounded-[100px] bg-violet text-white text-[14px] font-semibold cursor-pointer"
              >
                Go
              </button>
            </div>
          </div>

          {moods.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-dark-gray text-[12px] font-semibold tracking-[0.12em] uppercase">
                Explore by Mood
              </p>
              <div className="flex flex-row items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedMoodId("all")}
                  className={`shrink-0 h-[36px] px-4 rounded-full text-[13px] font-medium cursor-pointer transition-colors ${
                    selectedMoodId === "all"
                      ? "bg-violet text-white"
                      : "bg-gray-6 text-subtle-black"
                  }`}
                >
                  All
                </button>
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => setSelectedMoodId(mood.id)}
                    className={`shrink-0 inline-flex items-center gap-2 h-[36px] px-4 rounded-full text-[13px] font-medium whitespace-nowrap cursor-pointer transition-colors ${
                      selectedMoodId === mood.id
                        ? "bg-violet text-white"
                        : "bg-gray-6 text-subtle-black"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          selectedMoodId === mood.id
                            ? "#fff"
                            : readableAccent(mood.color),
                      }}
                    />
                    {mood.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gridGroups.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gridGroups.map((group) => {
                const question = firstValidQuestion(group.questions);
                if (!question) return null;
                const color = group.mood?.color || "#5D4DBE";
                const accent = readableAccent(color);
                return (
                  <div
                    key={group.id}
                    className="relative flex flex-col justify-between gap-6 rounded-[20px] border border-black/[0.06] p-5 min-h-[150px]"
                    style={{ backgroundColor: `${color}26` }}
                  >
                    <div className="flex flex-col gap-2">
                      <p
                        className="text-[11px] font-bold tracking-[0.1em] uppercase"
                        style={{ color: accent }}
                      >
                        {group.title}
                      </p>
                      <p className="text-[14px] leading-[20px] text-subtle-black line-clamp-2">
                        {question.text}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openPrompt(group.id)}
                      aria-label={`Start writing: ${group.title}`}
                      className="self-end w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
                      style={{ backgroundColor: `${accent}26` }}
                    >
                      <ArrowRight size={16} style={{ color: accent }} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !error && groups.length === 0 && (
            <p className="text-[14px] text-gray">
              No prompts are available right now — check back soon.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default checkAuth(ThinkPage);
