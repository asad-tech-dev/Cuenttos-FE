"use client";
import checkAuth from "@/HOC/checkAuth";
function SavedCuenttoPage() {
  return (
    <div className="flex flex-row  gap-[30px] py-[60px] px-[110px]">
      <h1 className="text-violet text-[40px] font-semibold"> Coming Soon</h1>
    </div>
  );
}
export default checkAuth(SavedCuenttoPage);
