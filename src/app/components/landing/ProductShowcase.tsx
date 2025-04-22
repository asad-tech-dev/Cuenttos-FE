"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export const ProductShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const leftImageX = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const centerImageX = useTransform(scrollYProgress, [0, 1], [0, 0]);
  const rightImageX = useTransform(scrollYProgress, [0, 1], [0, 500]);

  return (
    <div
      ref={containerRef}
      className="bg-white text-white bg-gradient-to-b from-white to-[#5d4dbe]/20 py-[72px] sm:py-24 mx-auto relative overflow-hidden"
    >
      <h2 className="text-center md:text-5xl text-3xl font-bold tracking-tighter text-black">
        Intuitive <span className="text-violet">interface</span>
      </h2>
      <div className="max-w-3xl mx-auto md:w-full w-[400px]">
        <p className="md:text-xl text-md text-center mt-5 text-dark-gray ">
          Cuentto offers a sleek, intuitive interface designed to provide the
          best user experience. Whether you are writing down your thoughts,
          exploring ideas, or sharing your voice with the world — everything
          feels seamless, natural, and inspiring.
        </p>
      </div>

      <div className="relative flex justify-center items-center mt-14 h-[550px]">

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
            className="rounded-[20px]"
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
            className="rounded-[20px]"
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
            className="rounded-[20px]"
          />
        </motion.div>
      </div>
    </div>
  );
};
