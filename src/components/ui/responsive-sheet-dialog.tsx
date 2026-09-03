"use client";

import * as React from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

interface ResponsiveSheetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  /** Visually-hidden accessible title (dialogs/sheets require one). */
  title: string;
}

// Mood/Share/Add-Music/Publish all need to look and behave like a native
// bottom sheet on phones (matching the mobile app) but as a centered modal
// on larger screens, where an edge-to-edge sheet reads as a mistake rather
// than a deliberate pattern. One component picks the right primitive so
// every call site gets both for free instead of re-solving it per feature.
export function ResponsiveSheetDialog({
  open,
  onOpenChange,
  children,
  className,
  title,
}: ResponsiveSheetDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(
            "w-[calc(100%-2rem)] sm:max-w-[520px] rounded-[16px] p-[40px] max-h-[85vh] overflow-y-auto",
            className,
          )}
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          "border-none rounded-t-[24px] max-h-[90vh] overflow-y-auto px-6 pt-3 pb-[max(24px,env(safe-area-inset-bottom))]",
          className,
        )}
      >
        <SheetTitle className="sr-only">{title}</SheetTitle>
        <div
          aria-hidden
          className="mx-auto mb-4 h-1.5 w-10 shrink-0 rounded-full bg-gray-9"
        />
        {children}
      </SheetContent>
    </Sheet>
  );
}
