"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  HomeIcon,
  LibraryIcon,
  WriteIcon,
  FavouriteIcon,
  ProfileIcon,
} from "../icons";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Home",
      href: "/home",
      icon: (isActive: boolean) =>
        isActive ? (
          <Image src="/home.svg" alt="Home" width={16} height={17} />
        ) : (
          <HomeIcon className="text-gray" />
        ),
    },
    {
      name: "Library",
      href: "/library",
      icon: (isActive: boolean) =>
        isActive ? (
          <Image src="/menu_book.svg" alt="Library" width={18} height={16} />
        ) : (
          <LibraryIcon className="text-gray" />
        ),
    },
    {
      name: "Write",
      href: "/write",
      icon: () => <WriteIcon className="text-white" />,
      special: true,
    },
    {
      name: "Favourite",
      href: "/favourite",
      icon: (isActive: boolean) =>
        isActive ? (
          <Image src="/bookmark.svg" alt="Favourite" width={14} height={17} />
        ) : (
          <FavouriteIcon className="text-gray" />
        ),
    },
    {
      name: "Profile",
      href: "/profile",
      icon: (isActive: boolean) =>
        isActive ? (
          <Image src="/person.svg" alt="Profile" width={16} height={16} />
        ) : (
          <ProfileIcon className="text-gray" />
        ),
    },
  ];

  return (
    <div
      className="flex flex-col w-[256px] fixed left-0 top-[55px] justify-center pl-8 bg-white border-r border-light-gray"
      style={{ height: "calc(100vh - 55px)" }}
    >
      {menuItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link key={item.href} href={item.href}>
            <div
              className={`relative flex items-center gap-4 px-4 w-[200px] h-[56px] transition-all duration-300 rounded-[100px] cursor-pointer
                ${
                  item.special
                    ? "bg-violet text-white mt-[8px] mb-[8px]"
                    : isActive
                    ? "text-black font-semibold"
                    : "text-gray"
                }
              `}
            >
              {item.icon(isActive)}
              <p className="text-[14px] font-semibold">{item.name}</p>
              {isActive && (
                <div
                  className={`absolute right-[30px] w-2 h-2 rounded-full ${
                    item.special ? "bg-white" : "bg-violet"
                  }`}
                ></div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
