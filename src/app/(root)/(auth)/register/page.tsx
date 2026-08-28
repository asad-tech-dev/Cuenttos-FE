import RegisterForm from "@/app/components/forms/register";
import Spinner from "@/app/components/ui/Spinner";
import { Suspense } from "react";
export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-[20px] w-[389px] h-[504px]">
      <h1 className="text-[45px] text-white font-normal leading-[52px]">
        Register
      </h1>
      <p className="text-[16px] text-offwhite font-normal leading-[24px]">
        Keep up with your friends! Share Cuenttos, interesting thoughts and
        create a healthy writing habit.
      </p>

      <div className="mt-[16px]">
        <Suspense
          fallback={
            <div className="flex justify-center items-center w-full h-[200px]">
              <Spinner size="w-10 h-10" borderSize="border-4" />
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
