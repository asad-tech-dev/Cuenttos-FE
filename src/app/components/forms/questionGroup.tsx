"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import FormField from "../ui/FormField";
import VioletButton from "../buttons/VioletButton";
import {
  QuestionGroupSchema,
  QuestionGroupFormData,
  QUESTIONS_PER_GROUP,
} from "@/lib/formSchemas/questionGroup";
import { createQuestionGroup } from "@/lib/api/questionGroup";

export default function QuestionGroupForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<QuestionGroupFormData>({
    resolver: zodResolver(QuestionGroupSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      questions: Array.from({ length: QUESTIONS_PER_GROUP }, () => ({
        text: "",
      })),
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "questions",
  });

  const onCancel = () => router.push("/admin/manage-questions");

  const onSubmit = async (data: QuestionGroupFormData) => {
    try {
      setLoading(true);
      setSubmitError(null);
      await createQuestionGroup(data);
      toast.success("Question group created");
      router.push("/admin/manage-questions");
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Could not create the question group. Please try again.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-8"
      noValidate
    >
      <section className="flex flex-col gap-5 rounded-[16px] border border-light-gray bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-[18px] font-semibold text-subtle-black">
            Group details
          </h2>
          <p className="text-[13px] text-gray">
            Give this group a clear title so admins can find it later.
          </p>
        </div>

        <FormField
          label="Title"
          placeholder="e.g. Morning Reflection Prompts"
          error={errors.title?.message}
          {...register("title")}
        />

        <FormField
          as="textarea"
          label="Description"
          optional
          placeholder="Briefly describe what this group of questions is for."
          rows={3}
          error={errors.description?.message}
          {...register("description")}
        />
      </section>

      <section className="flex flex-col gap-5 rounded-[16px] border border-light-gray bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-[18px] font-semibold text-subtle-black">
            Questions
          </h2>
          <p className="text-[13px] text-gray">
            Add {QUESTIONS_PER_GROUP} questions to guide the writer.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col gap-3 rounded-[12px] border border-light-gray bg-gray-5 p-5 transition-colors duration-200 focus-within:border-violet focus-within:bg-white"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-violet text-[13px] font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-[13px] font-medium uppercase tracking-[0.06em] text-dark-gray">
                  Question {index + 1}
                </p>
              </div>

              <FormField
                as="textarea"
                label={`What would you like to ask?`}
                placeholder="Write your question here…"
                rows={3}
                error={errors.questions?.[index]?.text?.message}
                {...register(`questions.${index}.text` as const)}
              />
            </div>
          ))}
        </div>

        {errors.questions?.root?.message && (
          <p className="text-[12px] text-red">
            {errors.questions.root.message}
          </p>
        )}
      </section>

      {submitError && (
        <p className="rounded-[10px] border border-red/30 bg-red/5 px-4 py-3 text-[13px] text-red">
          {submitError}
        </p>
      )}

      <div className="flex flex-col-reverse items-stretch justify-end gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="inline-flex h-[44px] items-center justify-center rounded-[10px] border border-light-gray bg-white px-6 text-[14px] font-semibold text-dark-gray transition-colors duration-200 hover:border-gray-7 hover:text-subtle-black disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          Cancel
        </button>
        <VioletButton
          text="Create Question"
          loading={loading}
          className="h-[44px] w-full sm:w-[180px] text-[14px]"
          type="submit"
        />
      </div>
    </form>
  );
}
