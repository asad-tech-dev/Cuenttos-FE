"use client";
import checkAuth from "@/HOC/checkAuth";
import CuenttoForm from "@/app/components/forms/cuentto";
import { BackIcon } from "@/app/components/icons";
import Spinner from "@/app/components/ui/Spinner";
import Link from "next/link";
import { Suspense } from "react";
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

      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[200px]">
            <Spinner size="w-10 h-10" borderSize="border-4" color="border-violet" />
          </div>
        }
      >
        <CuenttoForm />
      </Suspense>
    </div>
  );
}
export default checkAuth(CreateCuenttoage);
