"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import checkAuth from "@/HOC/checkAuth";
import CuenttoForm from "@/app/components/forms/cuentto";
import { BackIcon } from "@/app/components/icons";
import { SkeletonCuenttoDetail } from "@/app/components/skeletons/CuenttoDetail";
import { Cuentto } from "@/types/cuentto";
import { fetchDetailCuentto } from "@/lib/api/cuentto";
import { getCurrentUserId } from "@/lib/api/auth";

function EditCuenttoPage() {
  const router = useRouter();
  const { id } = useParams();
  const cuenttoId = Number(id);
  const [cuentto, setCuentto] = useState<Cuentto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(cuenttoId)) {
      setError("Invalid Cuentto.");
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchDetailCuentto(cuenttoId);
        const currentUserId = getCurrentUserId();
        if (currentUserId !== data.user.id) {
          toast.error("You can only edit your own Cuenttos.");
          router.replace(`/cuentto/${cuenttoId}`);
          return;
        }
        setCuentto(data);
      } catch (err: unknown) {
        let message = "Could not load this Cuentto.";
        if (axios.isAxiosError(err)) {
          const data = err.response?.data as { message?: string } | undefined;
          message = data?.message ?? message;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cuenttoId, router]);

  return (
    <div className="flex flex-col gap-[30px] w-full py-[60px] px-[110px]">
      <div className="flex flex-row justify-between">
        <BackIcon
          width={10}
          height={18}
          className="cursor-pointer text-subtle-black"
          onClick={() => router.back()}
        />
      </div>

      {loading ? (
        <SkeletonCuenttoDetail />
      ) : error ? (
        <p className="text-red-400 text-[14px]">{error}</p>
      ) : cuentto ? (
        <CuenttoForm
          mode="edit"
          cuenttoId={cuentto.id}
          initialData={cuentto}
        />
      ) : null}
    </div>
  );
}

export default checkAuth(EditCuenttoPage);
