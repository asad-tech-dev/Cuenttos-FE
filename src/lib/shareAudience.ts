// Who a Cuentto is shared with, as the share drawer stores it on the form:
// "My Journal" (isSelfShared), Public (isPublic) and/or circles (groupIds).

export interface ShareAudience {
  isSelfShared?: boolean | null;
  isPublic?: boolean | null;
  groupIds?: readonly unknown[] | null;
}

/**
 * Whether at least one audience is chosen, so the Cuentto can be shared.
 *
 * `knownGroupIds` is the user's circles once they've loaded; when given, only
 * those count, so an id for a circle that's since been deleted (an old edit)
 * doesn't keep Share enabled with nothing visibly selected. Leave it out when
 * the circles aren't known (still loading, failed, guest) to count every id.
 */
export const hasShareAudience = (
  audience: ShareAudience | null | undefined,
  knownGroupIds?: readonly number[],
): boolean => {
  if (!audience) return false;
  if (audience.isSelfShared === true || audience.isPublic === true) return true;
  if (!Array.isArray(audience.groupIds)) return false;
  return audience.groupIds.some(
    (id) =>
      typeof id === "number" &&
      Number.isFinite(id) &&
      (!knownGroupIds || knownGroupIds.includes(id)),
  );
};
