import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mix a hex color toward white (amount > 0) or black (amount < 0).
// Returns the input unchanged when it isn't a valid 3/6-digit hex.
function mixHex(hex: string, amount: number): string {
  const raw = hex.replace("#", "")
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw
  if (full.length !== 6) return hex
  const num = parseInt(full, 16)
  if (Number.isNaN(num)) return hex
  const target = amount >= 0 ? 255 : 0
  const t = Math.abs(amount)
  const channel = (shift: number) => {
    const value = (num >> shift) & 0xff
    return Math.round(value + (target - value) * t)
  }
  const r = channel(16)
  const g = channel(8)
  const b = channel(0)
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

/**
 * Build a soft card-background gradient from a single mood color.
 * Derives a lighter tint and a subtly deeper shade of the SAME hue, so the
 * gradient always stays within the mood's own palette (no new colors invented)
 * and preserves the dark-text contrast the pastel mood colors already assume.
 * Returns null for a missing/invalid color so callers can fall back gracefully.
 */
export function moodGradient(color?: string | null): string | null {
  if (!color) return null
  const light = mixHex(color, 0.18)
  const deep = mixHex(color, -0.08)
  if (light === color && deep === color) return null // invalid hex
  return `linear-gradient(135deg, ${light} 5%, ${color} 45%, ${deep} 100%)`
}
