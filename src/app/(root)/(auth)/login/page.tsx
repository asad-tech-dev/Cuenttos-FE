import LoginForm from "@/app/components/forms/login";
export default function LoginPage() {
  return (
    <div className="flex flex-col gap-[20px] w-[360px] h-[480px]">
      <h1 className="text-[45px] text-white font-normal leading-[52px]">
        Sign In
      </h1>
      <p className="text-[16px] text-white font-normal leading-[24px]">
        Keep up with your friends! Share Cuenttos, interesting thoughts and
        create a healthy writing habit.
      </p>

      <div className="mt-[16px]">
        <LoginForm />
      </div>
    </div>
  );
}
