import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCuenttoFeed() {
  return (
    <div className="flex flex-col gap-[20px] mt-[80px] ">
       <Skeleton className="bg-gray-6 w-full max-w-[984px] h-[280px] rounded-[16px]" />
       <Skeleton className="bg-gray-6 w-full max-w-[984px] h-[280px] rounded-[16px]" />
    </div>
  );
}
