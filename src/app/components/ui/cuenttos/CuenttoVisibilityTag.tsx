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

interface CuenttoVisibilityTagProps {
  cuentto: CuenttoVisibilitySource;
  /**
   * "default" sits on the white feed card; "onColor" sits on the detail
   * header, whose background is the mood colour.
   */
  tone?: "default" | "onColor";
  className?: string;
}

export default function CuenttoVisibilityTag({
  cuentto,
  tone = "default",
  className = "",
}: CuenttoVisibilityTagProps) {
  const { label, Icon } = getCuenttoVisibility(cuentto);

  const toneClasses =
    tone === "onColor"
      ? "border-dark-violet/20 bg-white/70 text-dark-violet"
      : "border-light-gray bg-white text-gray";

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none whitespace-nowrap ${toneClasses} ${className}`}
    >
      <Icon size={11} strokeWidth={2} aria-hidden="true" />
      {label}
    </span>
  );
}
