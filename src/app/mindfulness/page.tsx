"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import checkAuth from "@/HOC/checkAuth";
import { fetchActiveQuestionGroups } from "@/lib/api/questionGroup";
import { Question, QuestionGroup } from "@/types/questionGroup";

const LAST_GROUP_KEY = "mindfulness:lastGroupId";

function pickRandom<T>(items: T[]): T | null {
  if (!items.length) return null;
  return items[Math.floor(Math.random() * items.length)];
}

function sortQuestions(questions: Question[] = []): Question[] {
  return [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function MindfulnessPage() {
  const router = useRouter();
  const [group, setGroup] = useState<QuestionGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const questions = useMemo(
    () => sortQuestions(group?.questions ?? []),
    [group],
  );
  const total = questions.length;
  const current = questions[step];
  const showInput = current ? current.isAnswer !== false : false;
  const isLast = step >= total - 1;

  const loadRandomGroup = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      setGroup(null);
      setStep(0);
      setAnswers({});

      const groups = await fetchActiveQuestionGroups();
      if (signal?.aborted) return;

      const valid = groups.filter((g) => (g.questions?.length ?? 0) > 0);
      const previousId =
        typeof window !== "undefined"
          ? Number(sessionStorage.getItem(LAST_GROUP_KEY)) || null
          : null;
      const pool =
        valid.length > 1 && previousId != null
          ? valid.filter((g) => g.id !== previousId)
          : valid;
      const next = pickRandom(pool.length > 0 ? pool : valid);

      if (signal?.aborted) return;

      if (typeof window !== "undefined") {
        if (next?.id != null) {
          sessionStorage.setItem(LAST_GROUP_KEY, String(next.id));
        } else {
          sessionStorage.removeItem(LAST_GROUP_KEY);
        }
      }

      setGroup(next);
    } catch (e) {
      if (signal?.aborted) return;
      console.error(e);
      setError("Couldn't load questions. Please try again.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadRandomGroup(controller.signal);
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        loadRandomGroup();
      }
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) loadRandomGroup();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      controller.abort();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [loadRandomGroup]);

  const goNext = () => {
    if (!current) return;
    if (isLast) {
      router.push("/cuentto/create");
      return;
    }
    setStep((s) => s + 1);
  };

  const goSkip = () => router.push("/cuentto/create");
  const goCancel = () => router.push("/write");

  const onAnswerChange = (value: string) => {
    if (!current?.id && current?.id !== 0) return;
    setAnswers((prev) => ({ ...prev, [current.id as number]: value }));
  };

  const currentValue =
    current && current.id != null ? (answers[current.id] ?? "") : "";

  const renderBody = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center gap-5 text-center w-full">
          <div className="h-3 w-28 rounded-full bg-white/15 animate-pulse" />
          <div className="h-7 w-[80%] max-w-[480px] rounded-md bg-white/15 animate-pulse" />
          <div className="h-7 w-[60%] max-w-[360px] rounded-md bg-white/15 animate-pulse" />
          <div className="h-[60px] w-full max-w-[520px] rounded-[14px] bg-white/10 animate-pulse mt-2" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center gap-5 text-center">
          <p className="text-white/90 text-[15px]">{error}</p>
          <Link
            href="/write"
            className="px-5 h-[40px] inline-flex items-center justify-center text-white bg-violet hover:bg-dark-violet text-[13px] rounded-[10px] font-medium transition-colors"
          >
            Back to Write
          </Link>
        </div>
      );
    }

    if (!group || !current) {
      return (
        <div className="flex flex-col items-center gap-5 text-center">
          <p className="text-white/90 text-[15px]">
            No active question group is available right now.
          </p>
          <Link
            href="/cuentto/create"
            className="px-5 h-[40px] inline-flex items-center justify-center text-white bg-violet hover:bg-dark-violet text-[13px] rounded-[10px] font-medium transition-colors"
          >
            Continue to writing
          </Link>
        </div>
      );
    }

    return (
      <div
        key={current.id ?? step}
        className="flex flex-col w-full items-center text-center gap-5 md:gap-6 animate-[fadeIn_.45s_ease-out]"
      >
        <p className="text-white/70 text-[11px] md:text-[12px] font-semibold tracking-[0.22em] uppercase">
          Question {step + 1} of {total}
        </p>

        <h1 className="text-white font-medium leading-[1.22] tracking-[-0.01em] text-[24px] sm:text-[28px] md:text-[34px] lg:text-[38px] max-w-[700px]">
          {current.text}
        </h1>

        {current.description && (
          <p className="text-white/70 text-[14px] md:text-[15px] max-w-[560px] leading-[1.55]">
            {current.description}
          </p>
        )}

        {showInput ? (
          <div className="w-full max-w-[560px] mt-2 md:mt-3">
            <textarea
              value={currentValue}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Write your thoughts... (optional)"
              rows={1}
              className="w-full px-4 py-3.5 rounded-[12px] bg-white/[0.07] text-white placeholder-white/50 text-[14px] md:text-[15px] outline-none transition-all duration-200 resize-none min-h-[52px] max-h-[180px] backdrop-blur-sm"
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
              }}
            />
          </div>
        ) : (
          <div className="h-1" />
        )}
      </div>
    );
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden">
      <Image
        src="/onboard-cover.png"
        alt="cover background"
        fill
        className="absolute inset-0 object-cover md:object-center object-left"
        priority
        quality={100}
      />
      {/* <div className="absolute inset-0 bg-gradient-to-b from-darkpurple-grad/95 via-darkpurple-grad/85 to-darkpurple-grad/95 z-0" /> */}
      {/* <div className="absolute inset-0 bg-gradient-to-l from-darkpurple-grad to-purple-grad z-0" /> */}

      <div className="relative z-10 flex flex-col min-h-[100dvh] px-5 sm:px-8 md:px-10 lg:px-16 py-5 md:py-8">
        <div className="flex flex-row items-center justify-between gap-4 w-full max-w-[860px] mx-auto">
          <div className="flex flex-row items-center gap-1.5">
            {Array.from({ length: Math.max(total, 0) }).map((_, i) => {
              const isActive = i === step;
              const isDone = i < step;
              return (
                <span
                  key={i}
                  className={`h-[3px] rounded-full transition-all duration-500 ease-out ${
                    isActive
                      ? "w-[28px] md:w-[34px] bg-white"
                      : isDone
                        ? "w-[18px] md:w-[22px] bg-white/65"
                        : "w-[18px] md:w-[22px] bg-white/25"
                  }`}
                />
              );
            })}
          </div>

          {!loading && group && (
            <button
              type="button"
              onClick={goSkip}
              className="text-white/85 hover:text-white text-[13px] md:text-[14px] font-medium tracking-wide cursor-pointer transition-colors duration-200"
            >
              Skip
            </button>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center w-full">
          <div className="w-full max-w-[720px] mx-auto py-6 md:py-10">
            {renderBody()}
          </div>
        </div>

        {!loading && group && current && (
          <div className="w-full max-w-[560px] mx-auto pb-2">
            <div className="flex flex-row items-center justify-between gap-3 sm:gap-4">
              <button
                type="button"
                onClick={goCancel}
                className="h-[42px] px-5 sm:px-6 inline-flex items-center justify-center text-white/85 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.16] border border-white/20 hover:border-white/35 text-[13px] md:text-[14px] rounded-[10px] font-medium cursor-pointer transition-all duration-200"
              >
                Cancel
              </button>

              <div className="flex flex-row items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={goNext}
                  className="h-[42px] min-w-[112px] sm:min-w-[128px] px-5 sm:px-6 inline-flex items-center justify-center text-white bg-violet hover:bg-dark-violet active:scale-[0.98] text-[13px] md:text-[14px] rounded-[10px] font-semibold cursor-pointer shadow-[0_8px_24px_rgba(93,77,190,0.35)] hover:shadow-[0_10px_30px_rgba(93,77,190,0.5)] transition-all duration-200"
                >
                  {isLast ? "Start Writing" : "Next"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default checkAuth(MindfulnessPage);
