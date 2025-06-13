"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export const ProductShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: isMobile ? ["start 0.5", "end start"] : ["start end", "end start"],
  });
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const leftImageX = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const centerImageX = useTransform(scrollYProgress, [0, 1], [0, 0]);
  const rightImageX = useTransform(scrollYProgress, [0, 1], [0, 500]);

  return (
    <div
      ref={containerRef}
      className="bg-white text-white bg-gradient-to-b from-white to-[#5d4dbe]/20 md:py-[92px] px-[10px] py-[40px]  md:pb-[100px] pb-[0px] mx-auto relative overflow-hidden"
    >
      <h2 className="text-center md:text-5xl text-3xl font-bold tracking-tighter text-black">
        Intuitive <span className="text-violet">interface</span>
      </h2>
      <div className="mx-auto w-full md:w-[700px]">
        <p className="md:text-xl text-md text-center mt-5 text-dark-gray ">
          Cuentto® offers a sleek, intuitive interface designed to provide a
          tranquil and free of visual noise experience. Whether you are writing
          down your thoughts, exploring ideas, or sharing your voice with the
          world — everything feels possible, seamless and inspiring .
        </p>
      </div>

      <div className="relative flex justify-center items-center md:mt-14 h-[550px]">
        <motion.div
          style={{
            x: leftImageX,
            position: "absolute",
            zIndex: 1,
          }}
        >
          <Image
            src="/mobile-1.png"
            width={300}
            height={300}
            alt="App screen 1"
            className="rounded-[20px] md:w-[300px] w-[200px]"
          />
        </motion.div>

        <motion.div
          style={{
            x: centerImageX,
            position: "absolute",
            zIndex: 3,
          }}
        >
          <Image
            src="/mobile-2.png"
            width={300}
            height={300}
            alt="App screen 2"
            className="rounded-[20px] md:w-[300px] w-[200px]"
          />
        </motion.div>

        <motion.div
          style={{
            x: rightImageX,
            position: "absolute",
            zIndex: 1,
          }}
        >
          <Image
            src="/mobile-3.png"
            width={300}
            height={300}
            alt="App screen 3"
            className="rounded-[20px] md:w-[300px] w-[200px]"
          />
        </motion.div>
      </div>
    </div>
  );
};
