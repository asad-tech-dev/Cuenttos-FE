import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCuenttoFeatured() {
  return (
    <div className="flex flex-row gap-[20px] overflow-x-auto pb-2 md:flex-wrap md:overflow-visible">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton
          key={i}
          className="shrink-0 w-full sm:w-[260px] md:w-[280px] h-[260px] rounded-[20px] bg-gray-6"
        />
      ))}
    </div>
  );
}
