interface CuenttoLinkSource {
  id: number;
  slug?: string | null;
  user: { usernameSlug?: string | null };
}

// Canonical shareable/detail path: /{usernameSlug}/cuentto/{slug}. Falls back to the
// legacy /cuentto/{id} shape if a cuentto is missing its slug (e.g. stale cached data),
// since that route still resolves via GET /api/cuentto/detail/:id.
export function getCuenttoPath(cuentto: CuenttoLinkSource): string {
  const { slug, user } = cuentto;
  if (slug && user.usernameSlug) {
    return `/${user.usernameSlug}/cuentto/${slug}`;
  }
  return `/cuentto/${cuentto.id}`;
}
