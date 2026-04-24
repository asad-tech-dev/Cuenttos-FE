"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import checkAdminAuth from "@/HOC/checkAdminAuth";
import QuestionGroupForm from "@/app/components/forms/questionGroup";
import { SkeletonQuestionGroupForm } from "@/app/components/skeletons/QuestionGroupForm";
import { fetchQuestionGroupById } from "@/lib/api/questionGroup";
import {
  QuestionGroupFormData,
  QUESTIONS_PER_GROUP,
} from "@/lib/formSchemas/questionGroup";

function EditQuestionGroupPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);

  const [initialValues, setInitialValues] =
    useState<QuestionGroupFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || Number.isNaN(id)) {
      setError("Invalid question group id.");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const group = await fetchQuestionGroupById(id);

        const sorted = (group.questions ?? [])
          .slice()
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        const questions = Array.from(
          { length: QUESTIONS_PER_GROUP },
          (_, i) => {
            const q = sorted[i];
            return {
              ...(q?.id != null ? { id: q.id } : {}),
              text: q?.text ?? "",
              description: q?.description ?? null,
            };
          }
        );

        setInitialValues({
          title: group.title,
          description: group.description ?? "",
          questions,
        });
      } catch (err: unknown) {
        console.error("Failed to load question group:", err);
        const message =
          axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : axios.isAxiosError(err) && err.response?.status === 404
              ? "Question group not found."
              : "Could not load the question group. Please try again.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  return (
    <div className="mx-auto flex w-full max-w-[880px] flex-col gap-8 px-6 py-8 sm:px-10 lg:px-[60px]">
      <Link
        href="/admin/manage-questions"
        className="inline-flex w-fit items-center gap-2 text-[13px] font-medium text-gray hover:text-violet transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Manage Questions
      </Link>

      <header className="flex flex-col gap-2">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-violet">
          Admin
        </p>
        <h1 className="text-[28px] font-semibold leading-[34px] text-subtle-black sm:text-[32px]">
          Edit Question Group
        </h1>
        <p className="max-w-[640px] text-[14px] leading-[22px] text-gray">
          Update the title, description, and questions in this group.
        </p>
      </header>

      {loading ? (
        <SkeletonQuestionGroupForm />
      ) : error ? (
        <div className="flex h-[300px] w-full items-center justify-center rounded-[16px] border border-dashed border-red/40 bg-white">
          <p className="text-[14px] text-red">{error}</p>
        </div>
      ) : initialValues ? (
        <QuestionGroupForm
          mode="edit"
          groupId={id}
          initialValues={initialValues}
        />
      ) : null}
    </div>
  );
}

export default checkAdminAuth(EditQuestionGroupPage);
