import AppShell from "../components/AppShell";
import { Toaster } from "@/components/ui/sonner"

// Route-group layout for the authenticated app shell. It must NOT render its
// own <html>/<body> — those belong solely to the root app/layout.tsx.
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AppShell>{children}</AppShell>
      <Toaster />
    </>
  );
}
