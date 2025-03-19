"use client";
import checkAuth from "@/HOC/checkAuth";
import { useRouter } from "next/navigation";
import CuenttoForm from "@/app/components/forms/cuentto";
import { BackIcon } from "@/app/components/icons";
function CreateCuenttoage() {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-[30px] w-full py-[60px] px-[110px]">
      <div className="flex flex-row justify-between">
        <BackIcon
          width={10}
          height={18}
          className="cursor-pointer text-subtle-black"
          onClick={() => router.back()}
        />
      </div>
      <CuenttoForm />
    </div>
  );
}
export default checkAuth(CreateCuenttoage);
