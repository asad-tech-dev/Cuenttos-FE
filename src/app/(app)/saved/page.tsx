"use client";
import checkAuth from "@/HOC/checkAuth";
function SavedCuenttoPage() {
  return (
    <div className="flex flex-row gap-[30px] px-4 sm:px-6 md:px-[60px] lg:px-[110px] py-8 md:py-[60px]">
      <h1 className="text-violet text-[28px] sm:text-[40px] font-semibold"> Coming Soon</h1>
    </div>
  );
}
export default checkAuth(SavedCuenttoPage);
