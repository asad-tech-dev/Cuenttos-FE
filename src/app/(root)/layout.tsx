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
      <body className="relative min-h-screen overflow-y-auto overflow-x-hidden">
        <Image
          src="/onboard-cover.png"
          alt="cover background"
          fill
          className="fixed inset-0 object-cover -z-10"
          priority
          quality={100}
        />

        <div className="fixed inset-0 bg-gradient-to-l from-darkpurple-grad to-purple-grad -z-10"></div>

        <div className="relative z-10">
          <OnboardHeader />
          <main className="flex items-center min-h-screen md:justify-end justify-center w-full py-10 md:pr-[280px] pr-[20px] md:pl-[0px] pl-[20px]">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
