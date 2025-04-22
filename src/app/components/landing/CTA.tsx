import AppStoreButton from "./AppStoreButton";
import PlayStoreButton from "./PlayStoreButton";

const CTA: React.FC = () => {
  return (
    <main className="flex justify-center md:-mt-[70px] md:mb-0 mb-[40px]">
    <section className="lg:my-20 w-[80%]">
      <div className="relative h-full w-full z-10 mx-auto py-12 sm:py-20">
        <div className="h-full w-full">
          <div className="rounded-3xl opacity-95 absolute inset-0 -z-10 h-full w-full bg-black  bg-[size:6rem_4rem]">
            <div className="rounded-3xl absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_600px_at_50%_500px,#5d4dbe,transparent)]"></div>
          </div>

          <div className="h-full flex flex-col items-center justify-center text-white text-center px-5">
            <h2 className="text-2xl sm:text-3xl md:text-5xl md:leading-tight font-semibold mb-4 max-w-4xl">
              Join Over Thousands of Users To Transform Your Writing Experience
            </h2>

            <p className="mx-auto max-w-3xl md:px-5">
              Discover a space where your thoughts flow freely. Cuentto empowers
              you to express, connect, and share without limits — all through a
              beautifully crafted social writing platform.
            </p>
            <p className="mx-auto max-w-2xl md:px-5 font-bold text-white text-sm mt-[20px]">
              cuentto © 2025. All rights reserved
            </p>

            <div className="mt-4 flex flex-col sm:flex-row items-center sm:gap-4">
              <AppStoreButton />
              <PlayStoreButton />
            </div>
          </div>
        </div>
      </div>
    </section>
    </main>
  );
};

export default CTA;
