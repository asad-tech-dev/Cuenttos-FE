"use client";

import React from "react";
import { ClipboardList } from "lucide-react";
import { QuestionGroup } from "@/types/questionGroup";
import Toggle from "../Toggle";

interface QuestionGroupCardProps {
  group: QuestionGroup;
  onClick?: () => void;
  onToggleActive?: (id: number, next: boolean) => void;
  toggling?: boolean;
}

export default function QuestionGroupCard({
  group,
  onClick,
  onToggleActive,
  toggling = false,
}: QuestionGroupCardProps) {
  const questionCount =
    group._count?.questions ?? group.questions?.length ?? 0;
  const isActive = Boolean(group.isActive);

  const handleActivate = () => onClick?.();
  const handleKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : -1}
      onClick={handleActivate}
      onKeyDown={handleKey}
      className={`group flex h-full w-full flex-col justify-between rounded-[16px] border border-light-gray bg-white p-6 transition-all duration-300 hover:border-violet hover:shadow-[0_10px_30px_rgba(93,77,190,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet/25 ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[10px] bg-light-violet">
          <ClipboardList size={20} className="text-violet" />
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] font-semibold uppercase tracking-[0.06em] ${
              isActive ? "text-violet" : "text-gray-7"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
          <Toggle
            checked={isActive}
            loading={toggling}
            size="sm"
            ariaLabel={`Toggle ${group.title} active state`}
            onChange={(next) => onToggleActive?.(group.id, next)}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <h3 className="line-clamp-2 text-[18px] font-semibold text-subtle-black group-hover:text-dark-violet">
          {group.title}
        </h3>
        {group.description ? (
          <p className="line-clamp-3 text-[13px] leading-[20px] text-gray">
            {group.description}
          </p>
        ) : (
          <p className="text-[13px] italic text-gray-7">No description</p>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-light-gray pt-4">
        <span className="rounded-full bg-gray-6 px-3 py-1 text-[11px] font-semibold text-dark-gray">
          {questionCount} {questionCount === 1 ? "question" : "questions"}
        </span>
        {group.createdAt && (
          <span className="text-[11px] text-gray-7">
            {new Date(group.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        )}
      </div>
    </div>
  );
}
