"use client";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { BellIcon, SearchIcon } from "../icons";
import CustomToast from "../toasts/comingSoon";
import { useMobileNav } from "../context/MobileNavContext";

export default function AppHeader({ showSidebar = false }: { showSidebar?: boolean }) {
  const { toggle } = useMobileNav();
  return (
    <div className="flex h-[55px] fixed w-full top-0 z-50 px-4 sm:px-6 lg:px-12 items-center justify-between bg-white border-b border-light-gray">
      <div className="flex items-center gap-3">
        {showSidebar && (
          <button
            type="button"
            onClick={toggle}
            aria-label="Open menu"
            className="lg:hidden flex items-center justify-center text-subtle-black cursor-pointer -ml-1"
          >
            <Menu size={22} />
          </button>
        )}
        <Link href="/share">
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
            CustomToast()
          }
        />
        <BellIcon
          width={20}
          height={20}
          className="cursor-pointer text-subtle-black"
          onClick={() =>
            CustomToast()
          }
        />
      </div>
    </div>
  );
}
