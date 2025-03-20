import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCuenttoFeed() {
  return (
    <div className="flex flex-col gap-[20px] mt-[80px] ">
       <Skeleton className="bg-gray-6 w-[984px] h-[347px] rounded-[12px]" />
       <Skeleton className="bg-gray-6 w-[984px] h-[347px] rounded-[12px]" />
    </div>
  );
}
