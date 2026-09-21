"use client";

import { useState } from "react";
import { Lightbulb, Zap } from "lucide-react";
import checkAdminAuth from "@/HOC/checkAdminAuth";
import DailyPromptScheduler from "@/app/components/admin/think/DailyPromptScheduler";
import ChallengeManager from "@/app/components/admin/think/ChallengeManager";

type Tab = "prompt" | "challenge";

const TABS: { id: Tab; label: string; Icon: typeof Lightbulb }[] = [
  { id: "prompt", label: "Today's Prompt", Icon: Lightbulb },
  { id: "challenge", label: "Challenge", Icon: Zap },
];

function ManageThinkPage() {
  const [tab, setTab] = useState<Tab>("prompt");

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-8 px-4 py-8 sm:px-10 lg:px-[60px]">
      <header className="flex flex-col gap-2">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-violet">
          Admin
        </p>
        <h1 className="text-[26px] font-semibold leading-[32px] text-subtle-black sm:text-[32px] sm:leading-[38px]">
          Manage Think
        </h1>
        <p className="max-w-[640px] text-[14px] leading-[22px] text-gray">
          Choose which prompt is featured each day and which challenge writers
          see. Anything you leave unset keeps its existing automatic behaviour.
        </p>
      </header>

      {/* Segmented control: full width on phones so both targets stay large,
          sized to content from sm up. */}
      <div
        role="tablist"
        aria-label="Think page sections"
        className="inline-flex w-full gap-1 rounded-[12px] border border-light-gray bg-gray-6 p-1 sm:w-fit"
      >
        {TABS.map(({ id, label, Icon }) => {
          const isActive = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(id)}
              // min-w-0 is what lets flex-1 shrink below the label's own
              // width; without it the bar overflows and, because the app sets
              // overflow-x:hidden globally, the second tab is silently clipped
              // rather than scrollable.
              className={`inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[9px] px-2.5 py-2.5 text-[13px] font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet/30 cursor-pointer sm:flex-none sm:gap-2 sm:px-5 ${
                isActive
                  ? "bg-white text-violet shadow-[0_1px_3px_rgba(15,15,15,0.08)]"
                  : "text-dark-gray hover:text-subtle-black"
              }`}
            >
              {/* Below ~380px the icons cost more than they add: dropping
                  them buys enough room for both labels to read in full, and
                  `truncate` stays as the backstop for anything narrower. */}
              <Icon size={15} className="hidden shrink-0 min-[380px]:block" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>

      {tab === "prompt" ? <DailyPromptScheduler /> : <ChallengeManager />}
    </div>
  );
}

export default checkAdminAuth(ManageThinkPage);
