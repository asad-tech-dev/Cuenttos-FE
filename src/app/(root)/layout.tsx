import OnboardHeader from "../components/headers/onboardHeader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="h-screen overflow-hidden relative"
        style={{
          backgroundImage: "url('/onboard-cover.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-l h-screen from-darkpurple-grad to-purple-grad z-0"></div>

        <div className="relative z-10">
          <OnboardHeader />
          <main className="flex items-center h-screen justify-end w-full -mt-[55px] pr-[280px]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
