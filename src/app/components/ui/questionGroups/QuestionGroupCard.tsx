import React from "react";
import { ClipboardList } from "lucide-react";
import { QuestionGroup } from "@/types/questionGroup";

interface QuestionGroupCardProps {
  group: QuestionGroup;
  onClick?: () => void;
}

export default function QuestionGroupCard({
  group,
  onClick,
}: QuestionGroupCardProps) {
  const questionCount = group.questions?.length ?? 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full w-full flex-col justify-between rounded-[16px] border border-light-gray bg-white p-6 text-left transition-all duration-300 hover:border-violet hover:shadow-[0_10px_30px_rgba(93,77,190,0.08)] focus:outline-none focus:ring-2 focus:ring-violet/25 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[10px] bg-light-violet">
          <ClipboardList size={20} className="text-violet" />
        </div>
        <span className="rounded-full bg-gray-6 px-3 py-1 text-[11px] font-semibold text-dark-gray">
          {questionCount} {questionCount === 1 ? "question" : "questions"}
        </span>
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
    </button>
  );
}
