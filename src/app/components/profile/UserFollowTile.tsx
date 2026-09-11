"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FollowUser, toggleFollowUser } from "@/lib/api/profile";
import { toast } from "sonner";
import { Check, UserPlus } from "lucide-react";

interface UserFollowTileProps {
  user: FollowUser;
  onFollowChange?: (userId: number, isFollowing: boolean) => void;
}

export default function UserFollowTile({
  user,
  onFollowChange,
}: UserFollowTileProps) {
  const [isFollowing, setIsFollowing] = useState(Boolean(user.isFollowing));
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const displayName = user.profileName?.trim() || user.username;
  const rawPicture = user.profilePicture;
  const avatarUrl =
    rawPicture && !imgError
      ? rawPicture.startsWith("http")
        ? rawPicture
        : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${rawPicture}`
      : "/default-avatar.png";

  const handleToggleFollow = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await toggleFollowUser(user.id);
      const nextStatus = !isFollowing;
      setIsFollowing(nextStatus);
      onFollowChange?.(user.id, nextStatus);
      if (nextStatus) {
        toast.success(`Following @${user.username}`);
      } else {
        toast.info(`Unfollowed @${user.username}`);
      }
    } catch (err: unknown) {
      console.error("Error toggling follow:", err);
      toast.error("Could not update follow status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-[14px] sm:rounded-[16px] border border-light-gray/60 bg-white hover:border-violet/40 hover:shadow-[0_4px_16px_rgba(93,77,190,0.06)] transition-all duration-200">
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
        <div className="relative w-[38px] h-[38px] sm:w-[44px] sm:h-[44px] rounded-full overflow-hidden border-2 border-white shadow-xs bg-light-gray/40 shrink-0">
          <Image
            src={avatarUrl}
            alt={displayName}
            fill
            sizes="(max-width: 640px) 38px, 44px"
            className="object-cover"
            onError={() => setImgError(true)}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-[13px] sm:text-[15px] font-semibold text-subtle-black leading-tight">
            {displayName}
          </p>
          <p className="truncate text-[11px] sm:text-[13px] text-gray mt-0.5">
            @{user.username}
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={handleToggleFollow}
        className={`inline-flex items-center justify-center gap-1 shrink-0 cursor-pointer text-[11px] sm:text-[13px] font-semibold rounded-full px-3 sm:px-4 min-w-[76px] sm:min-w-[96px] h-[30px] sm:h-[34px] transition-all duration-200 ${
          isFollowing
            ? "border border-light-gray bg-white text-subtle-black hover:border-red hover:text-red hover:bg-red/5"
            : "bg-violet text-white hover:bg-dark-violet shadow-[0_2px_8px_rgba(93,77,190,0.25)] hover:shadow-[0_4px_12px_rgba(93,77,190,0.35)]"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <span className="inline-block h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isFollowing ? (
          <>
            <Check size={12} className="text-violet" />
            <span>Following</span>
          </>
        ) : (
          <>
            <UserPlus size={12} />
            <span>Follow</span>
          </>
        )}
      </button>
    </div>
  );
}
