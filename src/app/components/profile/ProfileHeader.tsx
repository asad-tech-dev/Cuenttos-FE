"use client";

import React, { useState } from "react";
import Image from "next/image";
import { UserProfile, formatUsername } from "@/lib/api/profile";
import { Pencil } from "lucide-react";

interface ProfileHeaderProps {
  user: UserProfile | null;
  loading?: boolean;
  cuenttosCount?: number;
  followersCount?: number;
  followingCount?: number;
  onTabSelect?: (tab: "about" | "followers" | "following") => void;
  onEditClick?: () => void;
}

export default function ProfileHeader({
  user,
  loading,
  cuenttosCount = 0,
  followersCount = 0,
  followingCount = 0,
  onTabSelect,
  onEditClick,
}: ProfileHeaderProps) {
  const [imgError, setImgError] = useState(false);

  const displayName = user?.profileName?.trim() || user?.username || "User";
  const bio = user?.profileDescription?.trim();
  const label = user?.profileLabel?.trim() || "Funny Cuentter";

  const rawPicture = user?.profilePicture;
  const avatarUrl =
    rawPicture && !imgError
      ? rawPicture.startsWith("http")
        ? rawPicture
        : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${rawPicture}`
      : "/default-avatar.png";

  if (loading) {
    return (
      <div className="relative w-full overflow-hidden rounded-[20px] sm:rounded-[28px] border border-light-gray/60 bg-white p-4 sm:p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] animate-pulse">
        <div className="flex flex-row items-start gap-3.5 sm:gap-6 md:gap-8">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-[76px] h-[76px] sm:w-[96px] sm:h-[96px] md:w-[104px] md:h-[104px] rounded-full bg-light-gray" />
            <div className="w-[80px] sm:w-[90px] h-[20px] sm:h-[24px] rounded-full bg-light-gray" />
          </div>
          <div className="flex flex-col gap-2.5 flex-1 pt-1 sm:pt-2">
            <div className="w-36 sm:w-48 h-6 sm:h-7 rounded-md bg-light-gray" />
            <div className="w-24 sm:w-28 h-4 rounded-md bg-light-gray" />
            <div className="w-full max-w-md h-4 rounded-md bg-light-gray mt-1" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-[20px] sm:rounded-[28px] border border-light-gray/70 bg-gradient-to-r from-[#FFF8F3] via-white to-white p-4 sm:p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
      {/* Peach decorative curved shape behind avatar matching mobile app styling */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-8 sm:-left-10 md:-left-8 top-0 bottom-0 w-[110px] sm:w-[145px] md:w-[170px] bg-[#FFD5BF] rounded-r-[100px] sm:rounded-r-[130px] opacity-90 z-0"
      />

      <div className="relative z-10 flex flex-col gap-4 sm:gap-5">
        {/* Main row: Avatar + Pill on Left, Details on Right (Consistent across Mobile, Tablet, Desktop) */}
        <div className="flex flex-row items-start gap-3.5 sm:gap-6 md:gap-8">
          {/* Left Column: Avatar + Persona Pill */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="relative w-[76px] h-[76px] sm:w-[96px] sm:h-[96px] md:w-[104px] md:h-[104px] rounded-full border-[3px] sm:border-4 border-white shadow-[0_6px_20px_rgba(0,0,0,0.1)] bg-white overflow-hidden shrink-0">
              <Image
                src={avatarUrl}
                alt={displayName}
                fill
                sizes="(max-width: 640px) 76px, (max-width: 768px) 96px, 104px"
                priority
                className="object-cover"
                onError={() => setImgError(true)}
              />
            </div>

            {/* Persona / Category pill */}
            <span className="inline-flex items-center justify-center rounded-full bg-[#806A60] px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] md:text-[12px] font-medium text-white tracking-wide shadow-xs max-w-[100px] sm:max-w-[130px] truncate text-center">
              {label}
            </span>
          </div>

          {/* Right Column: Name, Handle, Bio, and Edit Button */}
          <div className="flex min-w-0 flex-1 flex-col justify-center pt-0.5 sm:pt-1">
            <div className="flex items-start justify-between gap-2 sm:gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-[18px] sm:text-[24px] md:text-[28px] font-bold text-subtle-black leading-tight tracking-tight break-words">
                  {displayName}
                </h1>
                {user?.username && (
                  <p className="text-[12px] sm:text-[13px] md:text-[14px] font-medium text-gray mt-0.5 break-words">
                    {formatUsername(user.username)}
                  </p>
                )}
              </div>

              {/* Edit Profile button - Desktop & Tablet */}
              {onEditClick && (
                <button
                  type="button"
                  onClick={onEditClick}
                  aria-label="Edit Profile"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-[12px] border border-light-gray bg-white px-3.5 py-2 text-[13px] font-semibold text-subtle-black shadow-xs transition-all duration-150 hover:border-violet hover:text-violet hover:shadow-[0_4px_12px_rgba(93,77,190,0.1)] shrink-0 cursor-pointer"
                >
                  <Pencil size={13} className="shrink-0" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {/* Bio text */}
            <div className="mt-1.5 sm:mt-2.5">
              {bio ? (
                <p className="text-[13px] sm:text-[14px] leading-relaxed text-dark-gray whitespace-pre-line break-words max-w-[620px]">
                  {bio}
                </p>
              ) : (
                <p className="text-[12px] sm:text-[13px] text-gray/60 italic">
                  No bio added yet. Tell others a little about yourself!
                </p>
              )}
            </div>

            {/* Edit Profile button - Mobile only (placed cleanly below name/bio so it never squishes the name) */}
            {onEditClick && (
              <div className="mt-2.5 sm:hidden">
                <button
                  type="button"
                  onClick={onEditClick}
                  aria-label="Edit Profile"
                  className="inline-flex items-center gap-1.5 rounded-[10px] border border-light-gray bg-white px-3 py-1.5 text-[12px] font-semibold text-subtle-black shadow-xs transition-all duration-150 hover:border-violet hover:text-violet hover:bg-light-beige/30 cursor-pointer"
                >
                  <Pencil size={12} className="shrink-0" />
                  <span>Edit Profile</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Bar: Responsive on Mobile (evenly distributed), Tablet, and Desktop */}
        <div className="flex items-center justify-around sm:justify-start gap-3 sm:gap-8 pt-3 sm:pt-4 border-t border-light-gray/60 w-full">
          <button
            type="button"
            onClick={() => onTabSelect?.("about")}
            className="flex flex-col sm:flex-row items-center sm:items-baseline gap-0.5 sm:gap-1.5 cursor-pointer text-center sm:text-left group transition-colors"
          >
            <span className="text-[15px] sm:text-[17px] md:text-[18px] font-bold text-subtle-black group-hover:text-violet transition-colors">
              {cuenttosCount}
            </span>
            <span className="text-[11px] sm:text-[13px] text-gray group-hover:text-subtle-black transition-colors">
              {cuenttosCount === 1 ? "Story" : "Stories"}
            </span>
          </button>

          <div className="h-4 w-px bg-light-gray sm:hidden" />

          <button
            type="button"
            onClick={() => onTabSelect?.("followers")}
            className="flex flex-col sm:flex-row items-center sm:items-baseline gap-0.5 sm:gap-1.5 cursor-pointer text-center sm:text-left group transition-colors"
          >
            <span className="text-[15px] sm:text-[17px] md:text-[18px] font-bold text-subtle-black group-hover:text-violet transition-colors">
              {followersCount}
            </span>
            <span className="text-[11px] sm:text-[13px] text-gray group-hover:text-subtle-black transition-colors">
              {followersCount === 1 ? "Follower" : "Followers"}
            </span>
          </button>

          <div className="h-4 w-px bg-light-gray sm:hidden" />

          <button
            type="button"
            onClick={() => onTabSelect?.("following")}
            className="flex flex-col sm:flex-row items-center sm:items-baseline gap-0.5 sm:gap-1.5 cursor-pointer text-center sm:text-left group transition-colors"
          >
            <span className="text-[15px] sm:text-[17px] md:text-[18px] font-bold text-subtle-black group-hover:text-violet transition-colors">
              {followingCount}
            </span>
            <span className="text-[11px] sm:text-[13px] text-gray group-hover:text-subtle-black transition-colors">
              Following
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
