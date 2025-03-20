import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCuenttoFeatured() {
  return (
    <div className="flex flex-row gap-[20px]">
      <Skeleton className="w-[278px] h-[290px] rounded-tl-[10px] rounded-bl-[10px] rounded-tr-[40px] rounded-br-[40px] bg-gray-6" />
      <Skeleton className="w-[278px] h-[290px] rounded-tl-[10px] rounded-bl-[10px] rounded-tr-[40px] rounded-br-[40px] bg-gray-6" />
      <Skeleton className="w-[278px] h-[290px] rounded-tl-[10px] rounded-bl-[10px] rounded-tr-[40px] rounded-br-[40px] bg-gray-6" />
      <Skeleton className="w-[278px] h-[290px] rounded-tl-[10px] rounded-bl-[10px] rounded-tr-[40px] rounded-br-[40px] bg-gray-6" />
      <Skeleton className="w-[278px] h-[290px] rounded-tl-[10px] rounded-bl-[10px] rounded-tr-[40px] rounded-br-[40px] bg-gray-6" />
    </div>
  );
}
