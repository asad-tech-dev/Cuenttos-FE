import AppShell from "../components/AppShell";
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <html lang="en">
          <body>
            <AppShell>{children}</AppShell>
            <Toaster />
          </body>
        </html>
      );
    }
