"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CuenttoForm from "@/app/components/forms/cuentto";
import { BackIcon } from "@/app/components/icons";
import Spinner from "@/app/components/ui/Spinner";
import Link from "next/link";
import { getCurrentUserId, isAuthenticated } from "@/lib/api/auth";
import { readCuenttoDraft } from "@/lib/cuenttoDraft";
import { getLocalDraft } from "@/lib/localDrafts";
import { CuenttoCreateData } from "@/lib/formSchemas/cuentto";
import { fetchQuestionGroupById } from "@/lib/api/questionGroup";

function CreateCuenttoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const promptGroupId = searchParams.get("promptGroupId");
  const localDraftId = searchParams.get("draftId");
  const fromPrompt = searchParams.get("fromPrompt");
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState<CuenttoCreateData | undefined>(undefined);
  const [promptSlug, setPromptSlug] = useState<string | null>(fromPrompt);

  useEffect(() => {
    if (!promptGroupId || promptSlug) return;
    let cancelled = false;
    fetchQuestionGroupById(Number(promptGroupId))
      .then((group) => {
        if (cancelled) return;
        if (group?.slug) {
          setPromptSlug(group.slug);
        } else if (group?.id) {
          setPromptSlug(String(group.id));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [promptGroupId, promptSlug]);

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

    const restored = readCuenttoDraft(promptGroupId);
    if (restored) {
      setDraft(restored);
    } else if (authed && localDraftId) {
      const userId = getCurrentUserId();
      const local = userId != null ? getLocalDraft(userId, localDraftId) : null;
      if (local) setDraft(local);
    }

    setReady(true);
  }, [router, promptGroupId, localDraftId]);

  if (!ready) return null;

  const backHref = promptSlug
    ? `/prompt/${promptSlug}`
    : promptGroupId
    ? `/prompt/${promptGroupId}`
    : "/write";

  return (
    <div className="flex flex-col gap-[20px] sm:gap-[30px] w-full py-8 sm:py-10 md:py-[60px] px-4 sm:px-6 md:px-[60px] lg:px-[110px]">
      <div className="flex flex-row justify-between">
        <Link href={backHref}>
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
