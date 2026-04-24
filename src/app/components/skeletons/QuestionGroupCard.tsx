import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonQuestionGroupCard() {
  return (
    <div className="flex h-full w-full flex-col justify-between rounded-[16px] border border-light-gray bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-[40px] w-[40px] rounded-[10px] bg-gray-6" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-[14px] w-[52px] rounded-full bg-gray-6" />
          <Skeleton className="h-5 w-9 rounded-full bg-gray-6" />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <Skeleton className="h-[18px] w-3/4 rounded bg-gray-6" />
        <Skeleton className="h-[13px] w-full rounded bg-gray-6" />
        <Skeleton className="h-[13px] w-5/6 rounded bg-gray-6" />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-light-gray pt-4">
        <Skeleton className="h-[22px] w-[92px] rounded-full bg-gray-6" />
        <Skeleton className="h-[12px] w-[72px] rounded bg-gray-6" />
      </div>
    </div>
  );
}

interface SkeletonQuestionGroupGridProps {
  count?: number;
}

export function SkeletonQuestionGroupGrid({
  count = 6,
}: SkeletonQuestionGroupGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonQuestionGroupCard key={i} />
      ))}
    </div>
  );
}
