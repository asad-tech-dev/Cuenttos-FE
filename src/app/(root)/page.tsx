import Link from "next/link";
export default function Page() {
  return (
    <div className="flex flex-col gap-[30px] w-[409px] h-[296px]">
      <h1 className="text-[45px] text-white font-normal leading-[52px]">
        Wellness through Writing.
      </h1>
      <p className="text-[16px] text-offwhite font-normal leading-[24px]">
        In a world dominated by dopamine generating algorithms, Cuentto provides
        a safe haven for connecting with yourself and others through writing.
      </p>
      <div className="flex flex-row gap-4 items-center justify-start">
        <Link href="/login">
          <button className="w-[155px] h-[40px] text-white bg-violet text-[14px] rounded-[8px] font-medium cursor-pointer">
            Write a Cuentto
          </button>
        </Link>
        <Link href="/login">
          <button className="w-[133px] h-[40px] text-white cursor-pointer text-[14px] font-medium justify-center items-center">
            Explore Cuentto
          </button>
        </Link>
      </div>
    </div>
  );
}
