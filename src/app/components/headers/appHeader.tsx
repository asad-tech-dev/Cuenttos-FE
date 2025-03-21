"use client";
import Image from "next/image";
import Link from "next/link";
import { BellIcon, SearchIcon } from "../icons";
import CustomToast from "../toasts/comingSoon";

export default function AppHeader() {
  return (
    <div className="flex h-[55px] fixed w-full top-0 z-50 px-12 items-center justify-between bg-white border-b border-light-gray">
      <div>
        <Link href="/library">
          <Image
            src="/dark-logo.png"
            alt="Logo"
            width={122}
            height={21}
            className="object-cover cursor-pointer"
          />
        </Link>
      </div>
      <div className="flex flex-row gap-6 items-center justify-end">
        <SearchIcon
          width={17}
          height={17}
          className="cursor-pointer text-subtle-black"
          onClick={() =>
            CustomToast({
              title: "Coming Soon.",
            })
          }
        />
        <BellIcon
          width={20}
          height={20}
          className="cursor-pointer text-subtle-black"
          onClick={() =>
            CustomToast({
              title: "Coming Soon.",
            })
          }
        />
      </div>
    </div>
  );
}
