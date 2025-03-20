"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import OnboardHeader from "../components/headers/onboardHeader";
import { CheckIcon } from "../components/icons";
export default function InterestPage() {
  type Mood = {
    id: number;
    title: string;
  };
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
    const fetchMoods = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/moods`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        setMoods(response.data.moods);
      } catch (error) {
        console.error("Error fetching moods:", error);
      }
    };
    fetchMoods();
  }, []);

  return (
    <div
      className="h-screen overflow-hidden relative"
      style={{
        backgroundImage: "url('/onboard-cover.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-l h-screen from-darkpurple-grad to-purple-grad z-0"></div>
      <div className="absolute inset-0 backdrop-blur-lg z-1"></div>

      <div className="relative z-10">
        <OnboardHeader showButtons={false} />
        <div className="flex items-center h-screen justify-center w-full ">
          <div className="flex flex-col -mt-[55px] text-center gap-[30px] w-[760px] h-[352px]">
            <h1 className="text-[32px] text-white font-normal leading-[40px]">
              Tell us a little bit more about<br></br>yourself and your literary
              interests.
            </h1>
            <div className="mt-[30px] flex flex-col w-[760px] items-center justify-center">
              <div className=" grid grid-cols-3 gap-4 w-full justify-center ">
                {moods.map((moods) => (
                  <button
                    key={moods.id}
                    onClick={() => toggleGenre(moods.title)}
                    className={`py-1.5 flex items-center justify-center gap-2.5 text-white border rounded-[100px] cursor-pointer text-[14px] font-medium transition-all duration-500 ease-in-out ${
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
            <div className="flex flex-row gap-4 items-center justify-end mt-[30px]">
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
