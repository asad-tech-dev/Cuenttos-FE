"use client";
import checkAuth from "@/HOC/checkAuth";
import CuenttoForm from "@/app/components/forms/cuentto";
import { BackIcon } from "@/app/components/icons";
import Link from "next/link";
function CreateCuenttoage() {
  return (
    <div className="flex flex-col gap-[30px] w-full py-[60px] px-[110px]">
      <div className="flex flex-row justify-between">
        <Link href="/write">
          <BackIcon
            width={10}
            height={18}
            className="cursor-pointer text-subtle-black"
          />
        </Link>
      </div>

      <CuenttoForm />
    </div>
  );
}
export default checkAuth(CreateCuenttoage);
