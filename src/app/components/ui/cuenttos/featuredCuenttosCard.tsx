"use client";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, TrendingUp } from "lucide-react";
import { FeaturedCuentto } from "@/types/cuentto";
import CustomToast from "../../toasts/comingSoon";

const GRADIENTS = [
  "linear-gradient(135deg, #FDE2DE 0%, #F7D0C8 45%, #E5B8DF 100%)",
  "linear-gradient(135deg, #CFEDE8 0%, #CFE6DB 45%, #B7E1D2 100%)",
  "linear-gradient(135deg, #FFF1CF 0%, #FFE1AC 45%, #F4C59F 100%)",
  "linear-gradient(135deg, #E5DEFF 0%, #D2C6F6 45%, #B6A6E6 100%)",
  "linear-gradient(135deg, #D4E3FF 0%, #BFD6FB 45%, #A8C2EB 100%)",
  "linear-gradient(135deg, #FFE3E8 0%, #FAC8D1 45%, #E6A7B8 100%)",
];

const AVATAR_COLORS = [
  "#B79FEF",
  "#F0A7A0",
  "#F2B28C",
  "#88C5B9",
  "#F4C77A",
  "#8FB2E3",
];

const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const FeaturedCuenttoFeedCard: React.FC<{
  cuentto: FeaturedCuentto;
  index?: number;
}> = ({ cuentto, index = 0 }) => {
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const displayName = cuentto.user.profileName || cuentto.user.username;

  return (
    <div
      className="relative w-full sm:w-[260px] md:w-[280px] h-[260px] rounded-[20px] p-5 flex flex-col justify-between overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-transform hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)]"
      style={{ background: gradient }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5 text-subtle-black/70">
          <TrendingUp size={14} strokeWidth={2.5} />
          <span className="text-[11px] font-semibold tracking-wide">
            #{index + 1} THIS WEEK
          </span>
        </div>
        <button
          type="button"
          aria-label="Bookmark"
          onClick={(e) => {
            e.preventDefault();
            CustomToast();
          }}
          className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
        >
          <Bookmark size={14} className="text-subtle-black" strokeWidth={2} />
        </button>
      </div>

      <Link
        href={`/cuentto/${cuentto.id}?featured=true`}
        className="flex-1 flex items-end mt-4"
      >
        <h2 className="text-[22px] leading-[1.15] font-bold text-subtle-black line-clamp-3">
          {cuentto.title}
        </h2>
      </Link>

      <div className="flex items-center gap-2.5 mt-4">
        {cuentto.user.profilePicture ? (
          <Image
            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${cuentto.user.profilePicture}`}
            alt={displayName}
            width={28}
            height={28}
            className="w-7 h-7 rounded-full object-cover border border-white/60"
          />
        ) : (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold border border-white/60"
            style={{ backgroundColor: avatarColor }}
          >
            {getInitials(displayName)}
          </div>
        )}
        <span className="text-[13px] font-medium text-subtle-black truncate">
          {displayName}
        </span>
      </div>
    </div>
  );
};

export default FeaturedCuenttoFeedCard;
