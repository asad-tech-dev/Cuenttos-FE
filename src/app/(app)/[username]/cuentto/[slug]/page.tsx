"use client";
import { useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import CuenttoDetailView from "@/app/components/ui/cuenttos/CuenttoDetailView";
import { fetchDetailCuenttoBySlug } from "@/lib/api/cuentto";

function CuenttoBySlugPage() {
  const searchParams = useSearchParams();
  const { username, slug } = useParams();
  const isFeatured = searchParams.get("featured") === "true";

  const usernameSlug = Array.isArray(username) ? username[0] : username;
  const cuenttoSlug = Array.isArray(slug) ? slug[0] : slug;
  const paramsValid = Boolean(usernameSlug && cuenttoSlug);

  const fetchCuentto = useCallback(
    () => fetchDetailCuenttoBySlug(usernameSlug as string, cuenttoSlug as string),
    [usernameSlug, cuenttoSlug],
  );

  return (
    <CuenttoDetailView
      fetchCuentto={fetchCuentto}
      paramsValid={paramsValid}
      isFeatured={isFeatured}
    />
  );
}
export default CuenttoBySlugPage;
