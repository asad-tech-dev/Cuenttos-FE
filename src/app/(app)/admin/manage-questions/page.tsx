"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import checkAdminAuth from "@/HOC/checkAdminAuth";
import EmptyState from "@/app/components/ui/EmptyState";
import QuestionGroupCard from "@/app/components/ui/questionGroups/QuestionGroupCard";
import { SkeletonQuestionGroupGrid } from "@/app/components/skeletons/QuestionGroupCard";
import { QuestionGroup } from "@/types/questionGroup";
import {
  fetchQuestionGroups,
  toggleQuestionGroupActive,
} from "@/lib/api/questionGroup";

const SKELETON_COUNT_STORAGE_KEY = "manageQuestions:lastCount";
const DEFAULT_SKELETON_COUNT = 3;

const readCachedCount = (): number => {
  if (typeof window === "undefined") return DEFAULT_SKELETON_COUNT;
  const stored = Number(localStorage.getItem(SKELETON_COUNT_STORAGE_KEY));
  return Number.isFinite(stored) && stored > 0
    ? stored
    : DEFAULT_SKELETON_COUNT;
};

function ManageQuestionsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<QuestionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [skeletonCount, setSkeletonCount] = useState<number>(
    DEFAULT_SKELETON_COUNT
  );

  useEffect(() => {
    setSkeletonCount(readCachedCount());
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchQuestionGroups();
        setGroups(data);
        if (typeof window !== "undefined") {
          localStorage.setItem(
            SKELETON_COUNT_STORAGE_KEY,
            String(data.length)
          );
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setGroups([]);
        } else {
          console.error(err);
          setError("Could not load question groups. Please try again.");
          setGroups([]);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const goToCreate = () => router.push("/admin/manage-questions/create");

  const handleToggleActive = useCallback(
    async (id: number, next: boolean) => {
      let snapshot: QuestionGroup[] = [];
      setGroups((prev) => {
        snapshot = prev;
        return prev.map((g) => (g.id === id ? { ...g, isActive: next } : g));
      });
      setTogglingId(id);

      try {
        await toggleQuestionGroupActive(id, next);
      } catch (err: unknown) {
        setGroups(snapshot);
        console.error("Toggle question group failed:", err);

        let message = "Could not update the question group. Please try again.";
        if (axios.isAxiosError(err)) {
          const data = err.response?.data as
            | { message?: string; error?: string }
            | undefined;
          message =
            data?.message ??
            data?.error ??
            (err.response?.status
              ? `Request failed (${err.response.status})`
              : err.message) ??
            message;
        }
        toast.error(message);
      } finally {
        setTogglingId(null);
      }
    },
    []
  );

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-8 px-6 py-8 sm:px-10 lg:px-[60px]">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-violet">
            Admin
          </p>
          <h1 className="text-[28px] font-semibold leading-[34px] text-subtle-black sm:text-[32px]">
            Manage Questions
          </h1>
          <p className="max-w-[640px] text-[14px] leading-[22px] text-gray">
            Create and organize question groups that guide users through
            writing their Cuenttos.
          </p>
        </div>

        {groups.length > 0 && (
          <button
            type="button"
            onClick={goToCreate}
            className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[10px] bg-violet px-5 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-violet-3 cursor-pointer"
          >
            <Plus size={18} />
            New Question Group
          </button>
        )}
      </header>

      {loading ? (
        <SkeletonQuestionGroupGrid count={skeletonCount} />
      ) : error ? (
        <div className="flex h-[300px] w-full items-center justify-center rounded-[16px] border border-dashed border-red/40 bg-white">
          <p className="text-[14px] text-red">{error}</p>
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          title="No question groups yet"
          description="Create your first question group to help users structure their Cuenttos with guided questions."
          actionLabel="Create Question Group"
          onAction={goToCreate}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <QuestionGroupCard
              key={group.id}
              group={group}
              toggling={togglingId === group.id}
              onToggleActive={handleToggleActive}
              onClick={() =>
                router.push(`/admin/manage-questions/${group.id}`)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default checkAdminAuth(ManageQuestionsPage);
