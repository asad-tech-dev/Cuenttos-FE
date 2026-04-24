"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import Spinner from "./Spinner";

type ConfirmVariant = "danger" | "default";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const isDanger = variant === "danger";

  const confirmBtnClass = isDanger
    ? "bg-red text-white hover:bg-dark-red"
    : "bg-violet text-white hover:bg-violet-3";

  const iconTint = isDanger
    ? "bg-red/10 text-red"
    : "bg-light-violet text-violet";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (loading) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="!max-w-[440px] !rounded-[16px] !border-light-gray !bg-white !p-0">
        <div className="flex flex-col gap-5 p-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-full ${iconTint}`}
            >
              <AlertTriangle size={22} />
            </div>
            <div className="flex flex-col gap-1.5">
              <DialogTitle className="text-[18px] font-semibold text-subtle-black">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-[13px] leading-[20px] text-gray">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={loading}
              onClick={() => onOpenChange(false)}
              className="inline-flex h-[40px] items-center justify-center rounded-[10px] border border-light-gray bg-white px-5 text-[13px] font-semibold text-dark-gray transition-colors duration-200 hover:border-gray-7 hover:text-subtle-black disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => onConfirm()}
              className={`inline-flex h-[40px] min-w-[120px] items-center justify-center rounded-[10px] px-5 text-[13px] font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-80 cursor-pointer ${confirmBtnClass}`}
            >
              {loading ? (
                <Spinner
                  size="w-5 h-5"
                  color="border-white"
                  borderSize="border-2"
                />
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
