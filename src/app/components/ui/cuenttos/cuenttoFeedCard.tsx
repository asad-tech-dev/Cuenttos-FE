"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import {
  FavouriteIcon,
  CommentIcon,
  ShareIcon,
  MusicIcon,
  OptionIcon,
} from "../../icons";
import CustomToast from "../../toasts/comingSoon";
import ConfirmDialog from "../ConfirmDialog";
import { Cuentto } from "@/types/cuentto";
import { getCurrentUserId } from "@/lib/api/auth";
import { deleteCuentto } from "@/lib/api/cuentto";

interface CuenttoFeedCardProps {
  cuentto: Cuentto;
  onDeleted?: (id: number) => void;
}

const CuenttoFeedCard: React.FC<CuenttoFeedCardProps> = ({
  cuentto,
  onDeleted,
}) => {
  const relativeTime = cuentto.createdAt
    ? formatDistanceToNow(new Date(cuentto.createdAt), { addSuffix: true })
    : "Unknown time";

  const isOwnCuentto = getCurrentUserId() === cuentto.user.id;
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handlePointer = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteCuentto(cuentto.id);
      toast.success("Cuentto deleted successfully");
      setConfirmOpen(false);
      onDeleted?.(cuentto.id);
    } catch (error: unknown) {
      let message = "Could not delete this Cuentto. Please try again.";
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as { message?: string } | undefined;
        message = data?.message ?? message;
      }
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white w-full max-w-[984px] border border-light-gray rounded-[16px] p-6 sm:p-8 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        {!isOwnCuentto ? (
          <div className="inline-flex items-center gap-2 bg-[#EEEAFE] text-[#6C5CE7] rounded-full px-3 py-1.5">
            <ShareIcon width={12} height={14} className="text-[#6C5CE7]" />
            <span className="text-[12px] font-semibold">
              {cuentto.user.username} shared with you
            </span>
          </div>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-3">
          <span className="text-gray text-[12px] font-normal whitespace-nowrap">
            {relativeTime}
          </span>
          {isOwnCuentto && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-label="Cuentto actions"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
                className="flex h-[28px] w-[28px] items-center justify-center rounded-full text-subtle-black transition-colors duration-200 hover:bg-light-gray cursor-pointer"
              >
                <OptionIcon width={4} height={16} />
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[34px] z-20 min-w-[180px] overflow-hidden rounded-[12px] border border-light-gray bg-white shadow-[0_12px_32px_rgba(15,15,15,0.08)]"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push(`/cuentto/edit/${cuentto.id}`);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-[14px] font-medium text-subtle-black transition-colors duration-150 hover:bg-light-gray/60 cursor-pointer"
                  >
                    <Pencil size={16} className="text-subtle-black" />
                    Edit Cuentto
                  </button>
                  <div className="h-px bg-light-gray" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmOpen(true);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-[14px] font-medium text-subtle-black transition-colors duration-150 hover:bg-red/5 hover:text-red cursor-pointer"
                  >
                    <Trash2 size={16} />
                    Delete Cuentto
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-[40px] h-[40px] shrink-0">
            <Image
              src={
                cuentto.user.profilePicture
                  ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/${cuentto.user.profilePicture}`
                  : "/default-avatar.png"
              }
              alt="user image"
              width={40}
              height={40}
              className="object-cover rounded-full !w-full !h-full border border-white"
            />
          </div>
          <div>
            <p className="font-semibold text-[14px] text-black leading-tight">
              {cuentto.user.profileName || cuentto.user.username}
            </p>
            <p className="font-normal text-[12px] text-gray mt-0.5">
              {relativeTime}
            </p>
          </div>
        </div>
        {cuentto.music?.name && (
          <div className="flex items-center gap-1.5 text-gray shrink-0">
            <MusicIcon width={12} height={14} className="text-gray" />
            <span className="text-[13px] font-normal truncate max-w-[180px]">
              {cuentto.music.name}
            </span>
          </div>
        )}
      </div>

      <Link href={`/cuentto/${cuentto.id}`} className="flex flex-col gap-3">
        <span className="text-gray text-[12px] font-normal">
          Reading time ·{" "}
          <span className="text-black font-semibold">
            {typeof cuentto.duration === "number"
              ? `${cuentto.duration} min`
              : "—"}
          </span>
        </span>
        {cuentto.mood?.title && (
          <span
            className="self-start rounded-full px-3 py-1 text-[12px] font-medium text-black"
            style={{ backgroundColor: cuentto.mood.color || "#EEEAFE" }}
          >
            {cuentto.mood.title}
          </span>
        )}
        <h2 className="font-serif text-[22px] sm:text-[24px] leading-[1.3] font-bold text-black">
          {cuentto.title || "Untitled"}
        </h2>
      </Link>

      <div className="flex justify-between items-center pt-1">
        <div className="flex items-center gap-5">
          <div
            className="flex items-center cursor-pointer gap-2"
            onClick={() => CustomToast()}
          >
            <CommentIcon width={18} height={18} className="text-subtle-black" />
            <span className="text-subtle-black text-[13px] font-medium">
              {cuentto._count.comments ?? 0}
            </span>
          </div>
          <ShareIcon
            width={16}
            height={20}
            className="cursor-pointer text-subtle-black"
            onClick={() => CustomToast()}
          />
        </div>
        <FavouriteIcon
          width={14}
          height={17}
          className="cursor-pointer text-subtle-black"
          onClick={() => CustomToast()}
        />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(next) => {
          if (!deleting) setConfirmOpen(next);
        }}
        title="Delete Cuentto?"
        description={
          <>
            This will permanently delete{" "}
            <span className="font-semibold text-subtle-black">
              “{cuentto.title || "Untitled"}”
            </span>
            . This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default CuenttoFeedCard;
