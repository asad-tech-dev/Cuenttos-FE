"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
export default function MindfulnessPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(90);
  const [animationData, setAnimationData] = useState(null);
  const quotes = [
    "Relax Your Mind For a Bit.",
    "Let your body settle into stillness.",
    "Feel the natural rhythm within you.",
    "Notice the air around you.",
    "Allow yourself to arrive in this moment.",
    "Let your thoughts pass by like clouds.",
    "Sense the space between movement and stillness.",
    "Gently bring your awareness to your center.",
    "Allow distractions to fade into the background.",
    "Tune in to the quiet beneath the noise.",
    "Be with what is, just as it is.",
    "Let your attention rest softly.",
    "Feel the present moment unfold.",
    "There is nothing to do, nowhere to go.",
    "Every moment is enough.",
    "Stay connected to the stillness within.",
    "Observe without needing to change anything.",
    "Let calm expand from the inside out.",
    "Feel grounded, steady, and supported.",
    "Trust in the quiet strength of now.",
    "Simply remain here, fully aware.",
  ];
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [fade, setFade] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
        setFade(true);
      }, 500);
    }, 7000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    fetch("/breathing-animation.json")
      .then((res) => res.json())
      .then(setAnimationData);
  }, []);
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;

    if (secondsLeft > 0) {
      countdownInterval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(countdownInterval);
  }, [secondsLeft]);
  useEffect(() => {
    const playAudio = async () => {
      if (audioRef.current) {
        try {
          await audioRef.current.play();
        } catch (e) {
          console.log("Autoplay prevented. User interaction is needed.", e);
        }
      }
    };

    const timeout = setTimeout(() => {
      playAudio();
    }, 1000);

    return () => {
      clearTimeout(timeout);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  return (
    <div className="relative h-screen overflow-hidden">
      <audio ref={audioRef} src="/medidation.mp3" loop />

      <Image
        src="/onboard-cover.png"
        alt="cover background"
        fill
        className="absolute inset-0 object-cover md:object-center object-left"
        priority
        quality={100}
      />
      <div className="absolute inset-0 bg-gradient-to-l h-screen from-darkpurple-grad to-purple-grad z-0"></div>
      <div className="absolute inset-0 z-1"></div>

      <div className="relative z-10">
        <div className="flex items-start mt-[200px] h-screen justify-center w-full">
          <div className="flex flex-col text-center md:px-0 px-[20px]">
            <h1
              className={`md:text-[32px] text-[26px] text-white font-medium md:leading-[40px] leading-[30px] transition-opacity duration-500 ${
                fade ? "opacity-100" : "opacity-0"
              }`}
            >
              {quotes[currentQuoteIndex]}
            </h1>

            <div className="mt-[40px] flex justify-center">
              {animationData ? (
                <Lottie
                  animationData={animationData}
                  loop={true}
                  autoplay={true}
                  style={{ width: 300, height: 300 }}
                />
              ) : (
                <Skeleton className="w-[300px] h-[300px] rounded-full bg-violet/20" />
              )}
            </div>

            <div>
              <p className="mt-[30px] text-white text-md font-medium">
                {secondsLeft > 0 ? (
                  `${secondsLeft} seconds left`
                ) : (
                  <Link
                    href="/cuentto/create"
                    className=" hover:text-violet transition-colors duration-300"
                  >
                    Start Writing
                  </Link>
                )}
              </p>
            </div>

            <div className="flex flex-row gap-4 md:px-0 items-center justify-center mt-[80px]">
              <Link href="/cuentto/create">
                <button className="w-[150px] h-[40px] text-white bg-violet text-[14px] rounded-[8px] font-medium cursor-pointer">
                  Continue Anyway
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
