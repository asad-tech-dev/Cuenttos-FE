"use client"
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import AnimatedGradientText from "./animatedgradienttext";

export function AnimatedGradientTextDemo() {
  return (
    <div className="z-10 flex -mt-9 items-center justify-center">
      <AnimatedGradientText>
        <span
          className={cn(
            `inline animate-gradient bg-gradient-to-r from-[#ffffff] via-[#5d4dbe] to-[#ffffff] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
          )}
        >
          Get on Apple and Play store
        </span>
        <ChevronRight className="ml-1 size-3 text-white transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
      </AnimatedGradientText>
    </div>
  );
}
