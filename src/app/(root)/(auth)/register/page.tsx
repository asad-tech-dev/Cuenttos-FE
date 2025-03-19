import RegisterForm from "@/app/components/forms/register";
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
        <RegisterForm />
      </div>
    </div>
  );
}
