import AppHeader from "../components/headers/appHeader";
import Sidebar from "../components/sidebar/mainSidebar";
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <html lang="en">
          <body>
            <div className="flex flex-col h-screen">
              <AppHeader />
              <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 ml-[256px] mt-[55px] py-6">{children}</main>
              </div>
            </div>
            <Toaster />
          </body>
        </html>
      );
    }
