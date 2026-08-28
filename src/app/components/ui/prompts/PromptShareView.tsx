"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileQuestion, PenLine, Sparkles } from "lucide-react";
import { isAuthenticated } from "@/lib/api/auth";

interface PromptShareViewProps {
  groupId: number;
  groupTitle: string | null;
  questionText: string | null;
}

export default function PromptShareView({
  groupId,
  groupTitle,
  questionText,
}: PromptShareViewProps) {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, []);

  // Goes straight to Create Cuentto regardless of auth — a guest can write
  // freely there; CuenttoForm only sends them to login at Publish, saving
  // what they've written so it survives the round trip.
  const handleStartWriting = () => {
    router.push(`/cuentto/create?promptGroupId=${groupId}`);
  };

  if (!groupTitle || !questionText) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center w-full min-h-[calc(100vh-110px)] px-6 py-16">
        <div className="flex flex-col items-center gap-6 max-w-[440px]">
          <div className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-light-violet">
            <FileQuestion className="text-violet w-9 h-9 sm:w-11 sm:h-11" />
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-[26px] sm:text-[32px] leading-tight font-semibold text-dark-violet">
              Prompt Not Found
            </h1>
            <p className="text-[15px] sm:text-[16px] leading-[24px] text-gray">
              This prompt doesn&apos;t exist or is no longer available.
            </p>
          </div>
          <Link
            href={authed ? "/think" : "/"}
            className="flex items-center justify-center h-[44px] px-6 rounded-[100px] bg-violet text-white text-[14px] font-medium cursor-pointer whitespace-nowrap"
          >
            {authed ? "Explore Prompts" : "Go to Cuentto"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center w-full min-h-[calc(100vh-110px)] px-6 py-16">
      <div className="flex flex-col items-center gap-8 max-w-[560px] w-full">
        <span className="inline-flex items-center gap-1.5 text-violet text-[12px] font-semibold tracking-[0.1em] uppercase bg-light-violet px-3 py-1.5 rounded-full">
          <Sparkles size={14} />
          A prompt for you
        </span>

        <div className="relative overflow-hidden rounded-[24px] bg-violet px-6 sm:px-10 py-8 sm:py-10 w-full flex flex-col gap-5">
          <div
            aria-hidden
            className="absolute -top-10 -right-10 w-[180px] h-[180px] rounded-full bg-white/10"
          />
          <div
            aria-hidden
            className="absolute -bottom-16 right-10 w-[220px] h-[220px] rounded-full bg-white/5"
          />
          <span className="relative z-10 inline-flex items-center w-fit bg-white/15 text-white text-[12px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-[0.08em]">
            {groupTitle}
          </span>
          <p className="relative z-10 text-white text-[22px] sm:text-[28px] leading-[30px] sm:leading-[36px] font-medium">
            &quot;{questionText}&quot;
          </p>
        </div>

        <p className="text-[15px] leading-[22px] text-gray max-w-[420px]">
          Someone shared this Cuentto prompt with you. Start writing your own
          take — no rules, no pressure.
        </p>

        <button
          type="button"
          onClick={handleStartWriting}
          className="inline-flex items-center gap-2 h-[48px] px-8 rounded-[100px] bg-violet text-white text-[15px] font-semibold cursor-pointer"
        >
          <PenLine size={16} />
          Start Writing
        </button>
      </div>
    </div>
  );
}
