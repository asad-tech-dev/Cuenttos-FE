"use client";

import { MouseEvent } from "react";
import { FavouriteIcon, FavouriteActive } from "../../icons";
import { useSavedCuenttos } from "../../context/SavedCuenttosContext";

interface SaveCuenttoButtonProps {
  cuenttoId: number;
  width?: number;
  height?: number;
  /**
   * "plain" is a bare icon for the feed card and detail view; "floating" is
   * the circular white chip the featured card sits on top of its gradient.
   */
  variant?: "plain" | "floating";
  className?: string;
}

/**
 * Bookmark toggle backed by POST /api/savecuentto, matching the mobile app's
 * save action.
 *
 * Deliberately does no auth check of its own: every feed surface that renders
 * it is already behind `checkAuth`, and doing the check here would mean
 * resolving localStorage in an effect, which pops the button in a frame late
 * and shifts the row. The one guest-reachable surface (the public cuentto
 * detail view) decides for itself whether to render this.
 */
export default function SaveCuenttoButton({
  cuenttoId,
  width = 14,
  height = 17,
  variant = "plain",
  className = "",
}: SaveCuenttoButtonProps) {
  const { isSaved, isPending, toggleSave } = useSavedCuenttos();

  const saved = isSaved(cuenttoId);
  const pending = isPending(cuenttoId);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    // Cards wrap content in links; keep a bookmark tap from navigating.
    event.preventDefault();
    event.stopPropagation();
    toggleSave(cuenttoId);
  };

  const Icon = saved ? FavouriteActive : FavouriteIcon;

  const base =
    "flex items-center justify-center transition-transform duration-200 cursor-pointer active:scale-90 disabled:cursor-not-allowed disabled:opacity-50";
  const variantClasses =
    variant === "floating"
      ? "w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-sm"
      : "hover:scale-110";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save Cuentto"}
      title={saved ? "Remove from saved" : "Save Cuentto"}
      className={`${base} ${variantClasses} ${className}`}
    >
      <Icon
        width={width}
        height={height}
        className={saved ? "text-violet" : "text-subtle-black"}
      />
    </button>
  );
}
