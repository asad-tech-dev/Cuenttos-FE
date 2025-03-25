import OnboardHeader from "../components/headers/onboardHeader";
import { Toaster } from "@/components/ui/sonner";
import Image from "next/image";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className=" relative h-screen overflow-hidden relative">
        <Image
          src="/onboard-cover.png"
          alt="cover background"
          fill
          className="absolute inset-0 object-cover"
          priority
          quality={100}
        />

        <div className="absolute inset-0 bg-gradient-to-l h-screen from-darkpurple-grad to-purple-grad z-0"></div>

        <div className="relative z-10">
          <OnboardHeader />
          <main className="flex items-center h-screen md:justify-end justify-center w-full -mt-[55px] md:pr-[280px]">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
