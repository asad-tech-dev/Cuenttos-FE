"use client";

import React from "react";

interface ToggleProps {
  checked: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
  size?: "sm" | "md";
  ariaLabel?: string;
  className?: string;
}

const sizes = {
  sm: {
    track: "h-5 w-9",
    thumb: "h-4 w-4",
    on: "translate-x-4",
    off: "translate-x-0.5",
  },
  md: {
    track: "h-6 w-11",
    thumb: "h-5 w-5",
    on: "translate-x-5",
    off: "translate-x-0.5",
  },
} as const;

export default function Toggle({
  checked,
  onChange,
  disabled = false,
  loading = false,
  size = "md",
  ariaLabel,
  className = "",
}: ToggleProps) {
  const dims = sizes[size];
  const isLocked = disabled || loading;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={isLocked}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!isLocked) onChange?.(!checked);
      }}
      className={`relative inline-flex ${dims.track} flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet/30 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed ${
        checked ? "bg-violet" : "bg-gray-9"
      } ${isLocked ? "opacity-60" : "cursor-pointer"} ${className}`}
    >
      <span
        className={`pointer-events-none inline-block ${dims.thumb} transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-transform duration-200 ${
          checked ? dims.on : dims.off
        }`}
      />
    </button>
  );
}
