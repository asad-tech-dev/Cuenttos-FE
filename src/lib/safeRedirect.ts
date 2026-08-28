// A `redirect` value can arrive from a link someone else generated (e.g. a
// shared prompt), not just from in-app navigation — only honor it if it's a
// same-site relative path, never an absolute/external URL.
export function isSafeRedirectPath(
  path: string | null | undefined,
): path is string {
  return (
    typeof path === "string" &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.includes("://")
  );
}
