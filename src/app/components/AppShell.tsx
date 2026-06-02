"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AppHeader from "./headers/appHeader";
import Sidebar from "./sidebar/mainSidebar";
import { MobileNavProvider } from "./context/MobileNavContext";
import { isAuthenticated } from "@/lib/api/auth";

/**
 * App chrome wrapper. The sidebar (and its mobile drawer / hamburger) is only
 * shown to authenticated users, so a guest opening a public cuentto link sees a
 * clean page with no sidebar on both desktop and mobile. Once they sign in, the
 * app layout remounts and the sidebar appears.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, [pathname]);

  return (
    <MobileNavProvider>
      <div className="flex flex-col h-screen">
        <AppHeader showSidebar={authed} />
        <div className="flex flex-1">
          {authed && <Sidebar />}
          <main
            className={`flex-1 min-w-0 mt-[55px] py-6 ${
              authed ? "ml-0 lg:ml-[256px]" : "ml-0"
            }`}
          >
            {children}
          </main>
        </div>
      </div>
    </MobileNavProvider>
  );
}
