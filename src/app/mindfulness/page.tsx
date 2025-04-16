"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BreathingAnimation from "../components/breathinganimation/BreathingAnimation";
import Lottie from "lottie-react";
export default function MindfulnessPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(90);
  const [animationData, setAnimationData] = useState(null);
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
          setIsPlaying(true);
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
            <h1 className="md:text-[32px] text-[26px] text-white font-medium md:leading-[40px] leading-[30px]">
              Relax Your Mind For a Bit
            </h1>

            <div className="mt-[40px] flex justify-center">
              {/* <BreathingAnimation /> */}
              <Lottie animationData={animationData} loop={true} autoplay={true} style={{ width: 300, height: 300 }} />
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
