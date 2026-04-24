"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ShieldCheck, ClipboardList, ChevronDown } from "lucide-react";
import {
  LibraryIcon,
  WriteIcon,
  FavouriteIcon,
  ProfileIcon,
  LibraryActive,
  FavouriteActive,
  ProfileActive,
} from "../icons";
import { getIsAdmin } from "@/lib/api/auth";

export default function Sidebar() {
  const pathname = usePathname();

  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    setIsAdmin(getIsAdmin());
  }, [pathname]);

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

  const adminItems = [
    {
      name: "Manage Questions",
      href: "/admin/manage-questions",
      icon: (isActive: boolean) => (
        <ClipboardList
          size={20}
          className={isActive ? "text-black" : "text-gray"}
        />
      ),
    },
  ];

  const isAdminSectionActive = adminItems.some((item) =>
    pathname.startsWith(item.href),
  );

  const [isAdminOpen, setIsAdminOpen] = useState(isAdminSectionActive);

  useEffect(() => {
    if (isAdminSectionActive) setIsAdminOpen(true);
  }, [isAdminSectionActive]);

  return (
    <div
      className="flex flex-col w-[256px] fixed left-0 top-[20px] justify-center pl-8 bg-white border-r border-light-gray overflow-y-auto"
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

        {isAdmin && (
          <div className="mt-[16px]">
            <button
              type="button"
              onClick={() => setIsAdminOpen((prev) => !prev)}
              aria-expanded={isAdminOpen}
              aria-controls="admin-submenu"
              className={`relative flex items-center gap-4 px-4 w-[200px] h-[48px] rounded-[100px] transition-all duration-300 cursor-pointer ${
                isAdminSectionActive
                  ? "text-black font-semibold"
                  : "text-gray hover:text-black"
              }`}
            >
              <ShieldCheck
                size={18}
                className={isAdminSectionActive ? "text-violet" : "text-gray"}
              />
              <p className="text-[14px] font-semibold flex-1 text-left">
                Admin
              </p>
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${
                  isAdminOpen ? "rotate-180 text-violet" : "text-gray-7"
                }`}
              />
            </button>

            <div
              id="admin-submenu"
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                isAdminOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-col gap-1 pt-1 pl-3">
                  {adminItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <Link key={item.href} href={item.href}>
                        <div
                          className={`relative flex items-center gap-3 px-3 w-[188px] h-[44px] rounded-[100px] transition-all duration-300 cursor-pointer ${
                            isActive
                              ? "text-black font-semibold"
                              : "text-gray hover:text-black"
                          }`}
                        >
                          {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 bg-violet" />
                          )}
                          {item.icon(isActive)}
                          <p className="text-[12px] font-semibold">
                            {item.name}
                          </p>
                          {isActive && (
                            <div className="absolute right-[18px] w-2 h-2 rounded-full bg-violet"></div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
