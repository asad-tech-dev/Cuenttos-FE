// Emoji-only input helpers for the circle emoji field.
//
// Text is split into user-perceived characters (grapheme clusters) so that
// multi-code-point emoji — skin tones, ZWJ families, flags, keycaps — stay
// whole. A cluster counts as an emoji when it is a pictographic character, a
// flag (regional-indicator pair) or a keycap (0-9 # * followed by U+20E3).
const EMOJI_CLUSTER = /\p{Extended_Pictographic}|\p{Regional_Indicator}{2}|[0-9#*]️?⃣/u;

const splitGraphemes = (value: string): string[] => {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(segmenter.segment(value), (s) => s.segment);
  }
  return Array.from(value);
};

/** True when `value` has at least one emoji in it. */
export const containsEmoji = (value: string): boolean =>
  splitGraphemes(value).some((g) => EMOJI_CLUSTER.test(g));

export const isEmoji = (value: string): boolean => {
  const clusters = splitGraphemes(value);
  return clusters.length === 1 && EMOJI_CLUSTER.test(clusters[0]);
};

/**
 * Reduce free-form input to a single emoji: the last one typed or pasted, so
 * picking a new emoji replaces the old one. Anything that isn't an emoji
 * (letters, digits, spaces, punctuation) is dropped; returns "" if none.
 */
export const toSingleEmoji = (value: string): string => {
  const emojis = splitGraphemes(value).filter((g) => EMOJI_CLUSTER.test(g));
  return emojis.length > 0 ? emojis[emojis.length - 1] : "";
};

/** Quick picks shown under the emoji field. */
export const CIRCLE_EMOJI_SUGGESTIONS = [
  "❤️", "👪", "👯", "🏡", "💼", "🎓",
  "⚽", "🎨", "🎵", "✈️", "📚", "🌱",
];
