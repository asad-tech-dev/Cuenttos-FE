// Mirrors the backend's cap on admin-written Today's Prompts. The API also
// sends its own `maxWords`, which wins when present; this is the fallback.
export const THINK_PROMPT_MAX_WORDS = 30;

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// The viewer's own calendar day as YYYY-MM-DD, sent with Think requests so a
// prompt scheduled for the 27th shows on their 27th. Not toISOString(), which
// gives the UTC day and is off by one for part of every day outside UTC.
export function localDateKey(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
