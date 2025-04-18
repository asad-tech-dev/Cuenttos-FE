"use client";

import Image from "next/image";
import OnboardHeader from "../headers/onboardHeader";
import Link from "next/link";

export const Hero2 = () => {
  return (
    <div className="bg-white text-white bg-[linear-gradient(to_bottom,#000,#200D42_34%,#4F21A1_65%,#5d4dbe_82%)] relative overflow-clip h-screen mx-auto">
      <div className="absolute top-0 left-0 w-full z-[999]">
        <OnboardHeader />
      </div>

      <div className="absolute  z-0 w-[750px] sm:w-[1536px] sm:h-[768px] lg:w-[2400px] llg:h-[800px] rounded-[100%] bg-white left-1/2 -translate-x-1/2  bg-[radial-gradient(closest-side,#fff_82%,#5d4dbe)] top-[calc(100%-96px)] sm:top-[calc(100%-120px)]"></div>

      <div className="relative z-10 pt-[72px] sm:pt-24">
        <div className="flex justify-center mt-[80px]">
          <div className="inline-flex relative">
            <h1 className="text-7xl sm:text-9xl font-bold tracking-tightner text-center inline-flex">
              Wellness <br /> through Writing.
            </h1>

            <div className="absolute left-[0px] top-[258px] hidden sm:inline animate-[bounce_11s_ease-in-out_infinite]">
              <Image
                src="/cursor.png"
                alt="cursor"
                height={200}
                width={200}
                className="max-w-none"
              />
            </div>

            <div className="absolute right-[0px] top-[6px] hidden sm:inline animate-[bounce_11s_ease-in-out_infinite] [animation-delay:-5.5s]">
              <Image
                src="/message.png"
                alt="message"
                height={200}
                width={200}
                className="max-w-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <p className="text-xl text-center mt-8 max-w-xl">
            In a world dominated by dopamine generating algorithms, Cuentto
            provides a safe haven for connecting with yourself and others
            through writing.
          </p>
        </div>

        <div className="flex justify-center mt-8">
            <Link href="/login">
          <button className="bg-white text-black py-3 px-5 rounded-lg font-medium cursor-pointer">
            Get Started
          </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
