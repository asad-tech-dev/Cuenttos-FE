"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LibraryIcon,
  WriteIcon,
  FavouriteIcon,
  ProfileIcon,
  LibraryActive,
  FavouriteActive,
  ProfileActive,
} from "../icons";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Library",
      href: "/library",
      icon: (isActive: boolean) =>
        isActive ? (
          <LibraryActive className="text-black" />
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
      name: "Saved Cuentto",
      href: "/saved",
      icon: (isActive: boolean) =>
        isActive ? (
          <FavouriteActive className="text-black" />
        ) : (
          <FavouriteIcon className="text-gray" />
        ),
    },
    {
      name: "Profile",
      href: "/profile",
      icon: (isActive: boolean) =>
        isActive ? (
          <ProfileActive className="text-black" />
        ) : (
          <ProfileIcon className="text-gray" />
        ),
    },
  ];

  return (
    <div
      className="flex flex-col w-[256px] fixed left-0 top-[55px] justify-start  pl-8 bg-white border-r border-light-gray"
      style={{ height: "calc(100vh - 55px)" }}
    >
      <div className="mt-[10px]">
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
    </div>
  );
}
