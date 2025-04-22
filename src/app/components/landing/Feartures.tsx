"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const logos = [
  "https://res.cloudinary.com/dl2adjye7/image/upload/v1716817722/Amazon_icon.svg_a4qmtg.png",
  "https://res.cloudinary.com/dl2adjye7/image/upload/v1716800282/Apple_logo_black.svg_seeetv.png",
  "https://res.cloudinary.com/dl2adjye7/image/upload/v1716800359/WISE.L-b3d3de3c_rexehe.png",
];

const lineWidth = 80;
const lineHeight = 2;

const LogoBeam = () => {
  return (
    <div className="flex items-center justify-center min-h-52">
      <div className="relative flex items-center">
        <div className="bg-[#000] border border-white/30  rounded-2xl flex items-center justify-center w-14 h-14 p-4">
          <Image src="/write.svg" width={25} height={25} alt="write"></Image>
        </div>
        <div
          className="relative"
          style={{
            width: `${lineWidth}px`,
            height: `${lineHeight}px`,
            backgroundColor: "#000000",
            overflow: "hidden",
          }}
        >
          <motion.div
            className="absolute top-0 left-0 h-full w-10 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-75"
            initial={{ x: "-40px" }}
            animate={{ x: `calc(${lineWidth}px + 40px)` }}
            transition={{
              repeat: Infinity,
              duration: 0.5,
              repeatDelay: 2.5,
              ease: "linear",
            }}
            style={{ willChange: "transform" }}
          />
        </div>
        <div className="relative bg-black border-2 border-violet/90 rounded-2xl flex items-center justify-center w-16 h-16 p-4 overflow-hidden shadow-[0_0_15px_5px_#5d4dbe]">
          <Image src="/music.svg" width={40} height={40} alt="music"></Image>
          <motion.div
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 2,
              ease: "linear",
              repeat: Infinity,
              repeatType: "loop",
            }}
            style={{ willChange: "transform" }}
          />
        </div>
        <div
          className="relative"
          style={{
            width: `${lineWidth}px`,
            height: `${lineHeight}px`,
            backgroundColor: "#000000",
            overflow: "hidden",
          }}
        >
          <motion.div
            className="absolute top-0 right-0 h-full w-10 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-75"
            initial={{ x: "40px" }}
            animate={{ x: `calc(-${lineWidth}px - 40px)` }}
            transition={{
              repeat: Infinity,
              duration: 0.5,
              repeatDelay: 3.5,
              ease: "linear",
            }}
            style={{ willChange: "transform" }}
          />
        </div>
        <div className="bg-black border border-white/30 rounded-2xl flex items-center justify-center w-14 h-14 p-4">
          <Image
            src="/publish.svg"
            width={46}
            height={46}
            alt="publish"
          ></Image>
        </div>
      </div>
    </div>
  );
};

const CardWithEffect = ({ children }: { children: React.ReactNode }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      className="relative bg-white flex-1 rounded-xl border border-gray-200 p-4 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ willChange: "transform" }}
    >
      {isHovered && (
        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            width: "300px",
            height: "300px",
            top: mousePosition.y - 150,
            left: mousePosition.x - 150,
            background: "#5D2CA8",
            filter: "blur(100px)",
            transform: "translate(-0%, -0%)",
            zIndex: 10, // Ensure the effect is on top
            willChange: "transform, top, left",
          }}
        />
      )}
      {children}
    </div>
  );
};

const AWSIcon = () => {
  return (
    <div className="flex flex-col justify-start h-full items-center relative md:pt-0 pt-12">
      <div className="flex flex-row gap-8 justify-start h-full items-center relative -ml-[150px]">
        <div className="relative bg-black border-2 border-white/70 rounded-2xl flex items-center justify-center w-16 h-16 p-4 overflow-hidden shadow-[0_0_15px_5px_#dbe0e2]">
          <Image
            src="/playstore.svg"
            width={25}
            height={25}
            alt="playstore"
          ></Image>
          <motion.div
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 2,
              ease: "linear",
              repeat: Infinity,
              repeatType: "loop",
            }}
            style={{ willChange: "transform" }}
          />
        </div>
        <div className="relative  bg-black border-2 border-white/70 rounded-2xl flex items-center justify-center w-16 h-16 p-4 overflow-hidden shadow-[0_0_15px_5px_#dbe0e2]">
          <img
            src={logos[1]}
            alt="Logo 2"
            className="filter invert brightness-0"
          />
          <motion.div
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 2,
              ease: "linear",
              repeat: Infinity,
              repeatType: "loop",
            }}
            style={{ willChange: "transform" }}
          />
        </div>

        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 2,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
          }}
          style={{ willChange: "transform" }}
        />
      </div>

      <div className="text-left p-6 mt-4">
        <h1 className="text-black text-2xl font-bold mb-2">
          Download Mobile app
        </h1>
        <p className="text-gray-600 text-lg">
          Get the Cuentto app on Google and Apple store and start your Writing
          journey today.
        </p>
      </div>
    </div>
  );
};

const BentoBox1 = () => {
  return (
    <div className="bg-white flex justify-center items-center min-h-screen p-5 rounded-lg sm:py-24 ">
      <div className="flex flex-col md:flex-row gap-4 w-full max-w-7xl min-h-[800px] md:min-h-[800px] md:h-[800px]">
        <CardWithEffect>
          <div className="flex flex-col justify-between h-full">
            <div className="mb-4 px-6 mt-6">
              <div className="flex justify-between items-center mb-6 pb-2">
                <h2 className="text-black text-xl">
                </h2>
                <div className="flex items-center">
                  <div className="h-1 bg-black w-8 rounded-lg"></div>
                  <span className="ml-2 text-gray-600 text-sm">
                    1000+ Active Users
                  </span>
                </div>
              </div>
              <div className="relative w-full mt-12"></div>
            </div>
            <div className="flex flex-row justify-start pl-6">
              <Image
                src="/groups.png"
                width={300}
                height={400}
                alt="write"
                className="shadow-2xl rounded-[20px] -mt-[60px] z-100"
              ></Image>
            </div>
            <div className="text-left p-6 ">
              <h1 className="text-black text-2xl font-bold mb-2">
                Make your Custom Groups
              </h1>
              <p className="text-gray-600 text-lg">
                Make multiple groups among your follwers to share your stories
                with the specified followers only.
              </p>
            </div>
          </div>
        </CardWithEffect>
        <div className="flex flex-col w-full md:w-1/2 gap-5 h-full md:h-[800px]">
          <CardWithEffect>
            <div className="flex flex-col justify-center h-full">
              <LogoBeam />
              <div className="text-left p-6">
                <h1 className="text-black text-2xl font-bold mb-2">
                  Attach Music with Cuenttos
                </h1>
                <p className="text-gray-600 text-lg">
                  Select music while creating cuenttos to make it more immense
                  and relatable to the readers.
                </p>
              </div>
            </div>
          </CardWithEffect>
          <CardWithEffect>
            <AWSIcon />
          </CardWithEffect>
        </div>
      </div>
    </div>
  );
};

function Bentodemo() {
  return (
    <div className="h-screen flex items-center justify-center md:mt-0 mt-[400px]  ">
      <BentoBox1 />
    </div>
  );
}

export default Bentodemo;
