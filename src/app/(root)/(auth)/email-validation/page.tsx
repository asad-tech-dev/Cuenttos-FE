import Image from "next/image";
export default function ValidationPage() {
  return (
    <div className="flex flex-col gap-[30px] w-[457px] h-[376px]">
      <Image
        src="/green-check.png"
        alt="Google Icon"
        width={112}
        height={112}
      />
      <h1 className="text-[45px] text-white font-normal leading-[52px]">
        We have sent you an email to verify your account.
      </h1>
      <p className="text-[16px] text-offwhite w-[351px] font-normal leading-[24px]">
        Check your inbox for our email and come back once you validate it!
      </p>
    </div>
  );
}
