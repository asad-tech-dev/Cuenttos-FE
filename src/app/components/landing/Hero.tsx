import Image from "next/image";
import Link from "next/link";
import VioletButton from "../buttons/VioletButton";
import TextButton from "../buttons/textButton";
import OnboardHeader from "../headers/onboardHeader";

export default function Hero() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <Image
        src="/onboard-cover.png"
        alt="cover background"
        fill
        className="absolute inset-0 object-cover"
        priority
        quality={100}
      />
      <div className="absolute inset-0 bg-gradient-to-l from-darkpurple-grad to-purple-grad z-0" />
      <div className="relative z-10 h-full flex flex-col">
        <OnboardHeader />
        <main className="flex items-center h-screen md:justify-end justify-center w-full -mt-[55px] md:pl-[980px] pr-[20px] md:pl-[0px] pl-[20px]">
          <div className="flex flex-1 items-center justify-center px-4 ">
            <div className="flex flex-col gap-[30px] w-[409px] h-[296px]">
              <h1 className="text-[45px] text-white font-normal leading-[52px]">
                Wellness through Writing.
              </h1>
              <p className="text-[16px] text-offwhite font-normal leading-[24px]">
                In a world dominated by dopamine generating algorithms, Cuentto
                provides a safe haven for connecting with yourself and others
                through writing.
              </p>
              <div className="flex flex-row gap-4 items-center justify-start">
                <Link href="/login">
                  <VioletButton
                    text="Write a Cuentto"
                    className="w-[155px] text-[14px]"
                  />
                </Link>
                <Link href="/login">
                  <TextButton
                    text="Explore Cuentto"
                    className="w-[133px] h-[40px]"
                  />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
