import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCuenttoFeatured() {
  return (
    <div className="flex flex-row gap-[20px] overflow-x-auto pt-2 pb-2 -mx-1 px-1 hide-scrollbar-lg">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton
          key={i}
          className="shrink-0 w-[78%] sm:w-[55%] md:w-[45%] lg:w-[32%] xl:w-[24%] min-h-[230px] rounded-[20px] bg-gray-6"
        />
      ))}
    </div>
  );
}
