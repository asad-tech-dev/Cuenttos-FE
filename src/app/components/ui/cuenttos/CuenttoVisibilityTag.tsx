"use client";

import { Globe, Users, BookLock, Lock, type LucideIcon } from "lucide-react";

export interface CuenttoVisibilitySource {
  isPublic?: boolean;
  isSelfShared?: boolean;
  isGroupCuentto?: boolean;
}

export interface CuenttoVisibility {
  kind: "journal" | "public" | "group" | "private";
  label: string;
  Icon: LucideIcon;
}

/**
 * Resolves the one label that describes who can reach a cuentto.
 *
 * The three flags are not mutually exclusive in the database, so order
 * matters and mirrors how the backend actually resolves them:
 *  1. `isSelfShared` wins outright — create/update force `isPublic` to false
 *     alongside it, and the server 404s a journal entry for everyone but its
 *     owner even through the canonical share link.
 *  2. `isPublic` next: a public cuentto is openable by anyone holding the
 *     link, so that stays the honest label even when it was also shared into
 *     a group.
 *  3. `isGroupCuentto` otherwise — group members only.
 *  4. Anything left is a private account's cuentto: followers only.
 *
 * `isPublic` absent is read as public, matching the column's schema default.
 */
export function getCuenttoVisibility(
  cuentto: CuenttoVisibilitySource,
): CuenttoVisibility {
  if (cuentto.isSelfShared) {
    return { kind: "journal", label: "Journal", Icon: BookLock };
  }
  if (cuentto.isPublic === true) {
    return { kind: "public", label: "Public", Icon: Globe };
  }
  if (cuentto.isGroupCuentto) {
    return { kind: "group", label: "Group", Icon: Users };
  }
  if (cuentto.isPublic === undefined) {
    return { kind: "public", label: "Public", Icon: Globe };
  }
  return { kind: "private", label: "Private", Icon: Lock };
}

/**
 * The surface every cuentto pill shares — the same values the "shared with
 * you" pill on the feed card uses, exported so the two cannot drift apart.
 * One tone on every background: the detail header tints its own backdrop with
 * the mood colour, and this sits on it the same way the mood pill does.
 */
export const TAG_SURFACE = "bg-[#EEEAFE] text-[#6C5CE7]";

interface CuenttoVisibilityTagProps {
  cuentto: CuenttoVisibilitySource;
  className?: string;
}

export default function CuenttoVisibilityTag({
  cuentto,
  className = "",
}: CuenttoVisibilityTagProps) {
  const { label, Icon } = getCuenttoVisibility(cuentto);

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold leading-none whitespace-nowrap ${TAG_SURFACE} ${className}`}
    >
      <Icon size={12} strokeWidth={2} aria-hidden="true" />
      {label}
    </span>
  );
}
