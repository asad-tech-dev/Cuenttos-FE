"use client";
import { useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import CuenttoDetailView from "@/app/components/ui/cuenttos/CuenttoDetailView";
import { fetchDetailCuentto } from "@/lib/api/cuentto";

export default function CuenttoByIdClient() {
  const searchParams = useSearchParams();
  const { id } = useParams();
  const isFeatured = searchParams.get("featured") === "true";

  const rawId = Array.isArray(id) ? id[0] : id;
  const numericId = Number(rawId);
  const paramsValid = Boolean(rawId) && Number.isInteger(numericId) && numericId > 0;

  const fetchCuentto = useCallback(
    () => fetchDetailCuentto(numericId),
    [numericId],
  );

  return (
    <CuenttoDetailView
      fetchCuentto={fetchCuentto}
      paramsValid={paramsValid}
      isFeatured={isFeatured}
    />
  );
}
