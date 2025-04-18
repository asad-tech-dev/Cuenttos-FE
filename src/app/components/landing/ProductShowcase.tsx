"use client";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
export const ProductShowcase = () => {
  const appImage = useRef<HTMLImageElement>(null);
  const { scrollYProgress } = useScroll({
    target: appImage,
    offset: ["start end", "end end"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [35, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.3, 1]);

  return (
    <div className="bg-white text-white bg-gradient-to-b from-white to-[#5d4dbe]/20 py-[72px] sm:py-24 mx-auto">
      <h2 className="text-center md:text-5xl text-3xl font-bold tracking-tighter text-black">
        Intuitive interface
      </h2>
      <div className="max-w-3xl mx-auto md:w-full w-[400px]">
        <p className="md:text-xl text-md text-center mt-5 text-dark-gray ">
          Cuentto offers a sleek, intuitive interface designed to provide
          the best user experience. Whether you are writing down your thoughts,
          exploring ideas, or sharing your voice with the world — everything
          feels seamless, natural, and inspiring.
        </p>
      </div>
      <div className="flex justify-center items-center ">
        <motion.div
          style={{
            opacity: opacity,
            rotateX: rotateX,
            transformPerspective: "800px",
          }}
        >
          <Image
            src="/screen.png"
            width={1300}
            height={1000}
            ref={appImage}
            alt="app screen"
            className="mt-14 rounded-[20px] md:w-[1000px] w-[500px]"
          />
        </motion.div>
      </div>
    </div>
  );
};
