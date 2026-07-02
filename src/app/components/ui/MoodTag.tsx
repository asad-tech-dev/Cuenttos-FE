import React from "react";

interface MoodTagProps {
  title?: string | null;
  color?: string | null;
  className?: string;
}

/**
 * Small pill that shows a mood's title using the mood's own color as the
 * background. Text is kept black (#000000) to match the design. Renders
 * nothing when there is no mood title, so cards without a mood stay clean.
 */
export default function MoodTag({ title, color, className = "" }: MoodTagProps) {
  if (!title) return null;

  return (
    <span
      className={`inline-flex max-w-full items-center truncate rounded-full px-3 py-1.5 text-[11px] font-semibold leading-none text-black/80 ${className}`}
      style={{ backgroundColor: color || "#E5E5E5" }}
      title={title}
    >
      {title}
    </span>
  );
}
