import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCuenttoDetail() {
  return (
    <div className="flex flex-col mt-[30px] space-y-5">
      <div className="relative flex flex-col justify-between rounded-[24px] bg-gray-6 h-[370px] p-[60px] animate-pulse">
        <div className="flex flex-col gap-[16px]">
          <Skeleton className="h-[45px] w-[70%] rounded-3xl" />
          <Skeleton className="h-[20px] w-[150px] rounded-full" />
        </div>

        <div className="flex items-center gap-4">
          <Skeleton className="w-[40px] h-[40px] rounded-full" />
          <div>
            <Skeleton className="h-[14px] w-[120px]" />
            <Skeleton className="h-[12px] mt-[6px] w-[100px]" />
          </div>
        </div>

      </div>

      <div className="flex flex-row justify-between items-center mt-[20px] border-b border-light-gray pb-[30px]">
        <Skeleton className="h-[16px] w-[150px]" />
        <Skeleton className="h-[32px] w-[120px] rounded-full" />
      </div>

      <div className="pt-[40px] flex flex-col gap-[20px]">
        <Skeleton className="h-[20px] w-full" />
        <Skeleton className="h-[20px] w-[90%]" />
        <Skeleton className="h-[20px] w-[80%]" />
      </div>
    </div>
  );
}
