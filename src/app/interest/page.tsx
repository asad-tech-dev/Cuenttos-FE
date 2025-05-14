"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import OnboardHeader from "../components/headers/onboardHeader";
import { CheckIcon } from "../components/icons";
import Image from "next/image";
import { Mood } from "@/types/mood";
import { fetchMoods } from "@/lib/api/mood";
export default function InterestPage() {
  const [activeGenres, setActiveGenres] = useState<string[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);

  const toggleGenre = (label: string) => {
    setActiveGenres((prev) =>
      prev.includes(label)
        ? prev.filter((genre) => genre !== label)
        : [...prev, label]
    );
  };
  useEffect(() => {
    const getMoods = async () => {
      try {
        const data = await fetchMoods();
        setMoods(data);
      } catch (error) {
        console.log(error);
      }
    };
    getMoods();
  }, []);

  return (
    <div className="relative h-screen overflow-hidden relative">
      <Image
        src="/onboard-cover.png"
        alt="cover background"
        fill
        className="absolute inset-0 object-cover"
        priority
        quality={100}
      />
      <div className="absolute inset-0 bg-gradient-to-l h-screen from-darkpurple-grad to-purple-grad z-0"></div>
      <div className="absolute inset-0 backdrop-blur-lg z-1"></div>

      <div className="relative z-10">
        <OnboardHeader showButtons={false} />
        <div className="flex items-center h-screen justify-center w-full ">
          <div className="flex flex-col -mt-[55px] text-center gap-[30px] md:w-[760px] h-[352px] md:px-0 px-[20px]">
            <h1 className="md:text-[32px] text-[26px] text-white font-normal md:leading-[40px] leading-[30px]">
              Tell us a little bit more<br className="md:hidden block"></br>
              about<br className="md:block hidden"></br> yourself and your
              <br className="md:hidden block"></br>literary interests.
            </h1>
            <div className="mt-[30px] flex flex-col md:w-[760px] items-center justify-center items-start">
              <div className=" md:grid grid-cols-3 flex flex-wrap gap-4 md:w-full justify-start items-start ">
                {moods.map((moods) => (
                  <button
                    key={moods.id}
                    onClick={() => toggleGenre(moods.title)}
                    className={`py-1.5 flex items-center justify-center md:gap-2.5 gap-1 text-white border rounded-[100px] cursor-pointer md:text-[14px] text-[12px] font-medium transition-all duration-500 ease-in-out ${
                      activeGenres.includes(moods.title)
                        ? "bg-violet border-violet"
                        : "border-white px-2"
                    }`}
                  >
                    {activeGenres.includes(moods.title) && (
                      <CheckIcon width={18} height={18} color="white" />
                    )}
                    {moods.title}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-row gap-4 md:px-0 items-center justify-end mt-[30px]">
              <Link href="/login">
                <button className="w-[110px] h-[40px] text-white bg-violet text-[14px] rounded-[8px] font-medium cursor-pointer">
                  Continue
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
