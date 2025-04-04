import Link from "next/link";
import VioletButton from "../components/buttons/VioletButton";
import TextButton from "../components/buttons/textButton";
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
        <VioletButton text="Write a Cuentto" className="w-[155px] h-[40px] text-[14px] font-medium" />

        </Link>
        <Link href="/login">
        <TextButton text="Explore Cuentto" className="w-[133px] h-[40px]" />
        </Link>
      </div>
    </div>
  );
}
