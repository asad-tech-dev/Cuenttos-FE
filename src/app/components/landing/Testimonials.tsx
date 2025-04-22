"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";

const testimonials = [
  {
    text: "As someone who loves sharing thoughts freely, Cuentto felt like a breath of fresh air—raw, real, and incredibly liberating.",
    imageSrc: "/avatar-1.png",
    name: "Jamie Rivera",
    username: "@jamietechguru00",
  },
  {
    text: "Our team's engagement has reached new heights since we joined Cuentto. It's where real conversations are born.",
    imageSrc: "/avatar-2.png",
    name: "Josh Smith",
    username: "@jjsmith",
  },
  {
    text: "Cuentto has completely changed how I connect with people and express myself online. It feels personal and powerful.",
    imageSrc: "/avatar-3.png",
    name: "Morgan Lee",
    username: "@morganleewhiz",
  },
  {
    text: "I was impressed by how fast I felt part of the community. Cuentto makes it effortless to dive into authentic conversations.",
    imageSrc: "/avatar-4.png",
    name: "Casey Jordan",
    username: "@caseyj",
  },
  {
    text: "From sharing random thoughts to deep discussions, Cuentto gives me the perfect space to be myself and stay connected.",
    imageSrc: "/avatar-5.png",
    name: "Taylor Kim",
    username: "@taylorkimm",
  },
  {
    text: "The way I can customize my feed and interact with content on Cuentto is unmatched. It truly fits into my daily routine.",
    imageSrc: "/avatar-6.png",
    name: "Riley Smith",
    username: "@rileysmith1",
  },
  {
    text: "Using Cuentto has brought a sense of community back into my digital life. It’s social media done right.",
    imageSrc: "/avatar-7.png",
    name: "Jordan Patels",
    username: "@jpatelsdesign",
  },
  {
    text: "On Cuentto, I don’t just scroll—I contribute, interact, and build real conversations. It’s like a social home.",
    imageSrc: "/avatar-8.png",
    name: "Sam Dawson",
    username: "@dawsontechtips",
  },
  {
    text: "Cuentto’s sleek design and open space for ideas make it my favorite app to explore, engage, and express.",
    imageSrc: "/avatar-9.png",
    name: "Casey Harper",
    username: "@casey09",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const TestimonialsColumn = (props: {
  className?: string;
  testimonials: typeof testimonials;
  duration?: number;
}) => (
    <div className={props.className}>
    <motion.div
        animate={{
            translateY: "-50%",
        }}
        transition={{
            duration: props.duration || 10,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6">
        {[...new Array(2)].fill(0).map((_, index) => (
            <React.Fragment key={index}>
                {props.testimonials.map(
                    ({ text, imageSrc, name, username }, i) => (
                        <div className="p-10 border border-light-gray rounded-3xl text-[14px] shadow-[0_7px_14px_#EAEAEA] max-w-xs w-full" key={i}>
                            <div>{text}</div>
                            <div className="flex items-center gap-2 mt-5">
                                <Image
                                    src={imageSrc}
                                    alt={name}
                                    width={40}
                                    height={40}
                                    className="h-10 w-10 rounded-full"
                                />
                                <div className="flex flex-col">
                                    <div className="font-medium tracking-tight leading-5">
                                        {name}
                                    </div>
                                    <div className="leading-5 tracking-tight">
                                        {username}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                )}
            </React.Fragment>
        ))}
    </motion.div>
</div>
);

export const Testimonials = () => {
  return (
    <section className="bg-white py-[72px] md:w-[1000px] flex justify-center sm:py-24 mx-auto md:-mt-[10px] mt-[380px]">
      <div className="">
        <div className="flex flex-col justify-center items-center md:w-full w-[400px]">
          <h2 className="text-center md:text-5xl text-3xl font-bold tracking-tighter text-black">What our <span className="text-violet">users say</span></h2>
          <p className="md:text-xl text-md text-center mt-5 md:w-[600px] text-dark-gray">
            From intuitive design to powerful features, our app has become an essential tool for users around the world.
          </p>
        </div>
        <div className="flex justify-center gap-10 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[738px] overflow-hidden">
          <TestimonialsColumn
            testimonials={firstColumn}
            duration={15}
          />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={19}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={17}
          />
        </div>
      </div>
    </section>
  );
}
