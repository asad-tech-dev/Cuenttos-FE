import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, Globe, Lock, Users, X } from "lucide-react";
import Link from "next/link";

/** Who can see the Cuentto that was just published or saved. */
export type PublishAudience = "public" | "circles" | "private";

interface PublishCuenttoProps {
  /** "updated" after an edit; "published" (default) after creating one. */
  variant?: "published" | "updated";
  audience?: PublishAudience;
  redirectHref?: string;
}

const AUDIENCE: Record<
  PublishAudience,
  { label: string; Icon: typeof Globe; published: string; updated: string }
> = {
  public: {
    label: "Public",
    Icon: Globe,
    published: "Your story is now live and visible to everyone on Cuentto.",
    updated: "Your changes are live. Everyone will now see the latest version.",
  },
  circles: {
    label: "Your circles",
    Icon: Users,
    published: "Your story is now live and shared with the circles you chose.",
    updated:
      "Your changes are live. Your circles will now see the latest version.",
  },
  private: {
    label: "Only you",
    Icon: Lock,
    published: "Your story is saved privately. Only you can see it.",
    updated:
      "Your changes are saved. This Cuentto is still visible only to you.",
  },
};

// Small dots that burst out from the badge once, for a sense of celebration.
const SPARKS = [
  { x: -58, y: -30, size: 8, color: "bg-violet-2", delay: "120ms" },
  { x: 60, y: -38, size: 6, color: "bg-violet-3", delay: "180ms" },
  { x: -50, y: 38, size: 6, color: "bg-violet-3", delay: "220ms" },
  { x: 56, y: 32, size: 8, color: "bg-violet-2", delay: "160ms" },
  { x: 0, y: -62, size: 5, color: "bg-violet", delay: "260ms" },
  { x: -70, y: 4, size: 4, color: "bg-violet", delay: "300ms" },
  { x: 72, y: -2, size: 5, color: "bg-violet-2", delay: "240ms" },
];

const primaryButtonClass =
  "inline-flex w-full items-center justify-center gap-2 h-[44px] px-5 whitespace-nowrap rounded-[100px] bg-gradient-to-r from-violet to-violet-3 text-white text-[14px] font-semibold shadow-[0_6px_18px_rgba(93,77,190,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(93,77,190,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-2 focus-visible:ring-offset-2 cursor-pointer";

function PublishCuentto({
  variant = "published",
  audience = "public",
  redirectHref = "/share",
}: PublishCuenttoProps) {
  const isUpdate = variant === "updated";
  const { label, Icon, ...copy } = AUDIENCE[audience] ?? AUDIENCE.public;

  return (
    <DialogContent className="bg-white z-100 border-none w-[calc(100vw-2rem)] max-w-[420px] sm:max-w-[420px] max-h-[calc(100dvh-2rem)] overflow-y-auto p-0 rounded-[20px] shadow-[0_24px_64px_rgba(37,16,58,0.25)]">
      {/* Soft violet wash behind the badge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[150px] bg-gradient-to-b from-light-violet/70 to-white rounded-t-[20px]"
      />

      <DialogClose
        aria-label="Close"
        className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray transition-colors hover:bg-white hover:text-subtle-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-2 cursor-pointer"
      >
        <X size={18} />
      </DialogClose>

      <div className="relative flex flex-col items-center text-center px-5 pt-9 pb-6 sm:px-8 sm:pt-10 sm:pb-8 [@media(max-height:480px)]:pt-6 [@media(max-height:480px)]:pb-5">
        {/* Badge */}
        <div className="relative flex h-[88px] w-[88px] items-center justify-center">
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-violet-2/50 motion-safe:animate-[publish-ring_1.6s_ease-out_0.35s_both]"
          />
          {SPARKS.map((spark, i) => (
            <span
              key={i}
              aria-hidden
              className={`absolute left-1/2 top-1/2 rounded-full opacity-0 ${spark.color} motion-safe:animate-[publish-spark_900ms_cubic-bezier(0.22,1,0.36,1)_both]`}
              style={
                {
                  width: spark.size,
                  height: spark.size,
                  marginLeft: -spark.size / 2,
                  marginTop: -spark.size / 2,
                  animationDelay: spark.delay,
                  "--spark-x": `${spark.x}px`,
                  "--spark-y": `${spark.y}px`,
                } as React.CSSProperties
              }
            />
          ))}
          <span className="relative flex h-[76px] w-[76px] items-center justify-center rounded-full bg-gradient-to-br from-violet to-violet-3 shadow-[0_10px_28px_rgba(93,77,190,0.4)] motion-safe:animate-[publish-pop_550ms_cubic-bezier(0.34,1.56,0.64,1)_both]">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-9 w-9 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                pathLength={1}
                className="[stroke-dasharray:1] motion-safe:[stroke-dashoffset:1] motion-safe:animate-[publish-check_450ms_ease-out_300ms_forwards]"
              />
            </svg>
          </span>
        </div>

        <DialogTitle className="mt-6 [@media(max-height:480px)]:mt-3 text-[22px] sm:text-[24px] leading-[30px] font-semibold text-subtle-black motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 motion-safe:delay-150 motion-safe:fill-mode-both">
          {isUpdate ? "Changes saved" : "Your Cuentto is live!"}
        </DialogTitle>

        <DialogDescription className="mt-2 max-w-[320px] text-[15px] leading-[22px] text-dark-gray motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 motion-safe:delay-200 motion-safe:fill-mode-both">
          {isUpdate ? copy.updated : copy.published}
        </DialogDescription>

        <span className="mt-4 inline-flex items-center gap-1.5 h-[28px] px-3 rounded-[100px] bg-light-violet text-violet text-[13px] font-medium motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-500 motion-safe:delay-300 motion-safe:fill-mode-both">
          <Icon size={14} aria-hidden />
          Visible to: {label}
        </span>

        <div className="mt-7 [@media(max-height:480px)]:mt-4 flex w-full motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 motion-safe:delay-300 motion-safe:fill-mode-both">
          <Link href={redirectHref} className={primaryButtonClass}>
            {isUpdate ? "Done" : "Go to share"}
            <ArrowRight size={16} aria-hidden className="shrink-0" />
          </Link>
        </div>
      </div>
    </DialogContent>
  );
}
export default PublishCuentto;
