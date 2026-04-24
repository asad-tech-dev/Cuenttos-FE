import { Skeleton } from "@/components/ui/skeleton";
import { QUESTIONS_PER_GROUP } from "@/lib/formSchemas/questionGroup";

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5 rounded-[16px] border border-light-gray bg-white p-6 sm:p-8">
      {children}
    </section>
  );
}

function FieldSkeleton({
  labelWidth = "w-[80px]",
  inputHeight = "h-[48px]",
}: {
  labelWidth?: string;
  inputHeight?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className={`h-[12px] ${labelWidth} rounded bg-gray-6`} />
      <Skeleton className={`${inputHeight} w-full rounded-[10px] bg-gray-6`} />
    </div>
  );
}

export function SkeletonQuestionGroupForm() {
  return (
    <div className="flex flex-col gap-8">
      <SectionCard>
        <div className="flex flex-col gap-1">
          <Skeleton className="h-[18px] w-[140px] rounded bg-gray-6" />
          <Skeleton className="h-[13px] w-[260px] rounded bg-gray-6" />
        </div>

        <FieldSkeleton labelWidth="w-[40px]" />
        <FieldSkeleton labelWidth="w-[110px]" inputHeight="h-[96px]" />
      </SectionCard>

      <SectionCard>
        <div className="flex flex-col gap-1">
          <Skeleton className="h-[18px] w-[120px] rounded bg-gray-6" />
          <Skeleton className="h-[13px] w-[200px] rounded bg-gray-6" />
        </div>

        <div className="flex flex-col gap-5">
          {Array.from({ length: QUESTIONS_PER_GROUP }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-[12px] border border-light-gray bg-gray-5 p-5"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-[28px] w-[28px] rounded-full bg-gray-6" />
                <Skeleton className="h-[12px] w-[88px] rounded bg-gray-6" />
              </div>
              <FieldSkeleton labelWidth="w-[200px]" inputHeight="h-[96px]" />
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="flex flex-col-reverse items-stretch justify-end gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-[44px] w-full rounded-[10px] bg-gray-6 sm:w-[120px]" />
        <Skeleton className="h-[44px] w-full rounded-[10px] bg-gray-6 sm:w-[180px]" />
      </div>
    </div>
  );
}
