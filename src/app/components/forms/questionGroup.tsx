"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import FormField from "../ui/FormField";
import Toggle from "../ui/Toggle";
import VioletButton from "../buttons/VioletButton";
import {
  QuestionGroupSchema,
  QuestionGroupFormData,
  QUESTIONS_PER_GROUP,
} from "@/lib/formSchemas/questionGroup";
import {
  createQuestionGroup,
  updateQuestionGroup,
} from "@/lib/api/questionGroup";

type QuestionGroupFormMode = "create" | "edit";
type Step = 1 | 2;

interface QuestionGroupFormProps {
  mode?: QuestionGroupFormMode;
  groupId?: number;
  initialValues?: QuestionGroupFormData;
}

const STEPS: { number: Step; label: string }[] = [
  { number: 1, label: "Group Details" },
  { number: 2, label: "Add Questions" },
];

const emptyValues: QuestionGroupFormData = {
  title: "",
  description: "",
  questions: Array.from({ length: QUESTIONS_PER_GROUP }, () => ({
    text: "",
    isAnswer: true,
  })),
};

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
  }),
};

export default function QuestionGroupForm({
  mode = "create",
  groupId,
  initialValues,
}: QuestionGroupFormProps = {}) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [direction, setDirection] = useState<1 | -1>(1);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<QuestionGroupFormData>({
    resolver: zodResolver(QuestionGroupSchema),
    mode: "onChange",
    defaultValues: initialValues ?? emptyValues,
  });

  const { fields } = useFieldArray({
    control,
    name: "questions",
  });

  const onCancel = () => router.push("/admin/manage-questions");

  const isEdit = mode === "edit" && typeof groupId === "number";

  const handleToggleIsAnswer = (index: number, next: boolean) => {
    setValue(`questions.${index}.isAnswer`, next, { shouldDirty: true });
  };

  const goToStep = async (target: Step) => {
    if (target === currentStep || loading) return;
    if (target > currentStep) {
      const valid = await trigger(["title", "description"]);
      if (!valid) return;
    }
    setDirection(target > currentStep ? 1 : -1);
    setCurrentStep(target);
  };

  const hasChanges = (data: QuestionGroupFormData) => {
    if (!initialValues) return true;
    if (data.title !== (initialValues.title ?? "")) return true;
    if ((data.description ?? "") !== (initialValues.description ?? ""))
      return true;
    return data.questions.some((q, i) => {
      const initial = initialValues.questions?.[i];
      return (
        q.text !== (initial?.text ?? "") ||
        (q.description ?? null) !== (initial?.description ?? null) ||
        q.isAnswer !== (initial?.isAnswer ?? true)
      );
    });
  };

  const onSubmit = async (data: QuestionGroupFormData) => {
    if (isEdit && !hasChanges(data)) {
      toast.info("No changes to save");
      return;
    }

    try {
      setLoading(true);
      setSubmitError(null);
      if (isEdit) {
        await updateQuestionGroup(groupId as number, data);
        toast.success("Question group updated");
      } else {
        await createQuestionGroup(data);
        toast.success("Question group created");
      }
      router.push("/admin/manage-questions");
    } catch (err: unknown) {
      const fallback = isEdit
        ? "Could not update the question group. Please try again."
        : "Could not create the question group. Please try again.";
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : fallback;
      setSubmitError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const onError = () => {
    if (errors.title || errors.description) {
      setDirection(-1);
      setCurrentStep(1);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="flex flex-col gap-8"
      noValidate
    >
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {STEPS.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;

          return (
            <div
              key={step.number}
              className="flex items-center gap-2 sm:gap-4"
            >
              <button
                type="button"
                onClick={() => goToStep(step.number)}
                disabled={loading}
                className="group flex items-center gap-3 focus:outline-none disabled:cursor-not-allowed cursor-pointer"
                aria-current={isActive ? "step" : undefined}
              >
                <motion.div
                  animate={{ scale: isActive ? 1.06 : 1 }}
                  transition={{ type: "spring", stiffness: 380, damping: 24 }}
                  className={`relative flex h-[40px] w-[40px] items-center justify-center rounded-full text-[14px] font-semibold transition-colors duration-300 ${
                    isCompleted || isActive
                      ? "bg-violet text-white"
                      : "bg-gray-6 text-gray-7 group-hover:bg-light-violet group-hover:text-violet"
                  } ${
                    isActive
                      ? "shadow-[0_8px_24px_rgba(93,77,190,0.35)]"
                      : ""
                  }`}
                >
                  {isActive && (
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-violet/30"
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{
                        duration: 1.6,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  )}
                  <AnimatePresence mode="wait" initial={false}>
                    {isCompleted ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0.4, opacity: 0, rotate: -45 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0.4, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative"
                      >
                        <Check size={18} strokeWidth={3} />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="num"
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.6, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative"
                      >
                        {step.number}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>

                <div className="hidden flex-col items-start text-left sm:flex">
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                      isActive || isCompleted ? "text-violet" : "text-gray-7"
                    }`}
                  >
                    Step {step.number}
                  </span>
                  <span
                    className={`text-[14px] font-semibold transition-colors ${
                      isActive
                        ? "text-subtle-black"
                        : isCompleted
                          ? "text-dark-gray"
                          : "text-gray-7"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </button>

              {index < STEPS.length - 1 && (
                <div className="relative h-[3px] w-12 overflow-hidden rounded-full bg-light-gray sm:w-24">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-violet"
                    initial={false}
                    animate={{ width: isCompleted ? "100%" : "0%" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="relative">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col gap-8"
          >
            {currentStep === 1 ? (
              <section className="flex flex-col gap-5 rounded-[16px] border border-light-gray bg-white p-6 shadow-[0_4px_24px_rgba(15,15,15,0.04)] sm:p-8">
                <div className="flex flex-col gap-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-violet">
                    Step 1 of 2
                  </p>
                  <h2 className="text-[20px] font-semibold text-subtle-black">
                    Add Group Details
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
            ) : (
              <section className="flex flex-col gap-5 rounded-[16px] border border-light-gray bg-white p-6 shadow-[0_4px_24px_rgba(15,15,15,0.04)] sm:p-8">
                <div className="flex flex-col gap-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-violet">
                    Step 2 of 2
                  </p>
                  <h2 className="text-[20px] font-semibold text-subtle-black">
                    Add Questions
                  </h2>
                  <p className="text-[13px] text-gray">
                    Add {QUESTIONS_PER_GROUP} questions to guide the writer.
                  </p>
                </div>

                <div className="flex flex-col gap-5">
                  {fields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.08 * index,
                        ease: "easeOut",
                      }}
                      whileHover={{ y: -2 }}
                      className="flex flex-col gap-3 rounded-[12px] border border-light-gray bg-gray-5 p-5 transition-colors duration-200 focus-within:border-violet focus-within:bg-white hover:border-violet/40"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <motion.span
                            whileHover={{ rotate: [0, -8, 8, 0] }}
                            transition={{ duration: 0.4 }}
                            className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-violet text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(93,77,190,0.3)]"
                          >
                            {index + 1}
                          </motion.span>
                          <p className="text-[13px] font-medium uppercase tracking-[0.06em] text-dark-gray">
                            Question {index + 1}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Controller
                            control={control}
                            name={`questions.${index}.isAnswer` as const}
                            render={({ field: { value } }) => (
                              <>
                                <span
                                  className={`text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors ${
                                    value ? "text-violet" : "text-gray-7"
                                  }`}
                                >
                                  Answer {value ? "On" : "Off"}
                                </span>
                                <Toggle
                                  checked={!!value}
                                  disabled={loading}
                                  size="sm"
                                  ariaLabel={`Toggle isAnswer for question ${index + 1}`}
                                  onChange={(next) =>
                                    handleToggleIsAnswer(index, next)
                                  }
                                />
                              </>
                            )}
                          />
                        </div>
                      </div>

                      <FormField
                        as="textarea"
                        label={`What would you like to ask?`}
                        placeholder="Write your question here…"
                        rows={3}
                        error={errors.questions?.[index]?.text?.message}
                        {...register(`questions.${index}.text` as const)}
                      />
                    </motion.div>
                  ))}
                </div>

                {errors.questions?.root?.message && (
                  <p className="text-[12px] text-red">
                    {errors.questions.root.message}
                  </p>
                )}
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {submitError && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[10px] border border-red/30 bg-red/5 px-4 py-3 text-[13px] text-red"
        >
          {submitError}
        </motion.p>
      )}

      <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        {currentStep === 1 ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex h-[44px] cursor-pointer items-center justify-center rounded-[10px] border border-light-gray bg-white px-6 text-[14px] font-semibold text-dark-gray transition-colors duration-200 hover:border-gray-7 hover:text-subtle-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        ) : (
          <button
            type="button"
            onClick={() => goToStep(1)}
            disabled={loading}
            className="group inline-flex h-[44px] cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-light-gray bg-white px-6 text-[14px] font-semibold text-dark-gray transition-colors duration-200 hover:border-violet hover:text-violet disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ArrowLeft
              size={16}
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
            />
            Back
          </button>
        )}

        {currentStep === 1 ? (
          <button
            type="button"
            onClick={() => goToStep(2)}
            disabled={loading}
            className="group inline-flex h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-violet px-6 text-[14px] font-semibold text-white shadow-[0_8px_24px_rgba(93,77,190,0.25)] transition-all duration-200 hover:bg-dark-violet hover:shadow-[0_10px_28px_rgba(93,77,190,0.35)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-[180px]"
          >
            Next
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </button>
        ) : (
          <VioletButton
            text={isEdit ? "Save Changes" : "Create Question"}
            loading={loading}
            className="h-[44px] w-full text-[14px] sm:w-[180px]"
            type="submit"
          />
        )}
      </div>
    </form>
  );
}
