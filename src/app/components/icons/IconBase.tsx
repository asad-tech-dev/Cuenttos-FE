import React from "react";

export interface IconProps {
  /** Renders a square icon at this size. `width`/`height` override it. */
  size?: number;
  width?: number;
  height?: number;
  /** Matches lucide's prop of the same name; 2 keeps both families in step. */
  strokeWidth?: number;
  className?: string;
  onClick?: () => void;
}

interface IconBaseProps extends IconProps {
  /** Solid variant, for "active"/selected marks such as a saved bookmark. */
  filled?: boolean;
  children: React.ReactNode;
}

/**
 * Shared frame for the app's own icons.
 *
 * Every icon built on this base shares one 24x24 grid and one 2px stroke, so
 * they render at the same optical size AND the same weight — as each other,
 * and as the lucide icons sitting beside them, which use the same grid and
 * stroke. That pairing is the whole point: the icons previously sat on four
 * different grids (24x24, 30x30, 14x18, 18x17) with their thickness baked
 * into filled path geometry, which made matching them impossible from props.
 *
 * When adding an icon: draw inside roughly x/y 2..22 and let this component
 * own fill, stroke and stroke-width. Never bake thickness into a filled path.
 */
export default function IconBase({
  size = 24,
  width,
  height,
  strokeWidth = 2,
  className = "",
  onClick,
  filled = false,
  children,
}: IconBaseProps) {
  return (
    <svg
      width={width ?? size}
      height={height ?? size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={onClick}
    >
      {children}
    </svg>
  );
}
