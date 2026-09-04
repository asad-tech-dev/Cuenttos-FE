"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CuenttoForm from "@/app/components/forms/cuentto";
import { BackIcon } from "@/app/components/icons";
import Spinner from "@/app/components/ui/Spinner";
import Link from "next/link";
import { getCurrentUserId, isAuthenticated } from "@/lib/api/auth";
import { readCuenttoDraft, clearCuenttoDraft } from "@/lib/cuenttoDraft";
import { getLocalDraft } from "@/lib/localDrafts";
import { CuenttoCreateData } from "@/lib/formSchemas/cuentto";

function CreateCuenttoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const promptGroupId = searchParams.get("promptGroupId");
  const localDraftId = searchParams.get("draftId");
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState<CuenttoCreateData | undefined>(undefined);

  useEffect(() => {
    const authed = isAuthenticated();

    // A guest arriving from a shared prompt link may write freely — login is
    // only required at Publish (CuenttoForm saves a draft and redirects
    // there itself). Anyone else still needs to already be authenticated,
    // matching every other page in the app.
    if (!authed && !promptGroupId) {
      router.replace(
        `/login?redirect=${encodeURIComponent(
          window.location.pathname + window.location.search,
        )}`,
      );
      return;
    }

    if (authed) {
      const restored = readCuenttoDraft(promptGroupId);
      if (restored) {
        setDraft(restored);
        clearCuenttoDraft(promptGroupId);
      } else if (localDraftId) {
        const userId = getCurrentUserId();
        const local = userId != null ? getLocalDraft(userId, localDraftId) : null;
        if (local) setDraft(local);
      }
    }

    setReady(true);
  }, [router, promptGroupId, localDraftId]);

  if (!ready) return null;

  return (
    <div className="flex flex-col gap-[20px] sm:gap-[30px] w-full py-8 sm:py-10 md:py-[60px] px-4 sm:px-6 md:px-[60px] lg:px-[110px]">
      <div className="flex flex-row justify-between">
        <Link href="/write">
          <BackIcon
            width={10}
            height={18}
            className="cursor-pointer text-subtle-black"
          />
        </Link>
      </div>

      <CuenttoForm initialData={draft} localDraftId={localDraftId ?? undefined} />
    </div>
  );
}

export default function CreateCuenttoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center w-full h-[200px]">
          <Spinner size="w-10 h-10" borderSize="border-4" color="border-violet" />
        </div>
      }
    >
      <CreateCuenttoContent />
    </Suspense>
  );
}
