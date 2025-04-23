import Image from "next/image";
import Link from "next/link";
import VioletButton from "../buttons/VioletButton";
import { AnimatedGradientTextDemo } from "./animatedtext";
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
        <main className="flex items-center h-screen justify-center w-full -mt-[55px] pr-[20px] md:pl-[0px] pl-[20px]">
          <div className="flex flex-1 items-center justify-center px-4 ">
            <div className="flex flex-col justify-center items-center gap-[10px]">
              <div className="flex items-center justify-center">
                <AnimatedGradientTextDemo />
              </div>
              <h1 className="text-[65px] text-white font-semibold text-center leading-[72px] w-[600px]">
                Wellness through Writing.
              </h1>
              <p className="text-[16px] text-center text-offwhite font-normal mt-[20px] leading-[24px] w-[500px]">
                In a world dominated by dopamine generating algorithms, Cuentto
                provides a safe haven for connecting with yourself and others
                through writing.
              </p>
              <div className="flex flex-row gap-4 items-center justify-start mt-[20px]">
                <Link href="/login">
                  <VioletButton
                    text="Get Started"
                    className="w-[155px] text-[14px]"
                  />
                </Link>
                {/* <Link href="/login">
                  <TextButton
                    text="Explore Cuentto"
                    className="w-[133px] h-[40px]"
                  />
                </Link> */}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
