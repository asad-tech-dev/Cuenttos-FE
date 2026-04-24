import React from "react";
import { PlusIcon } from "../icons";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center w-full rounded-[16px] border border-dashed border-light-gray bg-white px-6 py-14 text-center ${className}`}
    >
      <button
        type="button"
        onClick={onAction}
        aria-label={actionLabel ?? "Create new"}
        className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-violet text-white shadow-[0_10px_30px_rgba(93,77,190,0.25)] transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <PlusIcon width={26} height={26} className="text-white" />
      </button>

      <h3 className="mt-[24px] text-[20px] font-semibold text-subtle-black">
        {title}
      </h3>
      {description && (
        <p className="mt-[8px] max-w-[420px] text-[14px] leading-[22px] text-gray">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-[20px] text-[14px] font-semibold text-violet hover:underline cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
