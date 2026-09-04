"use client";
import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, Clock, TrendingUp } from "lucide-react";
import { FeaturedCuentto } from "@/types/cuentto";
import { moodGradient } from "@/lib/utils";
import { getCuenttoPath } from "@/lib/cuenttoLink";
import CustomToast from "../../toasts/comingSoon";

const GRADIENTS = [
  "linear-gradient(135deg, #FDE2DE 0%, #F7D0C8 45%, #E5B8DF 100%)",
  "linear-gradient(135deg, #CFEDE8 0%, #CFE6DB 45%, #B7E1D2 100%)",
  "linear-gradient(135deg, #FFF1CF 0%, #FFE1AC 45%, #F4C59F 100%)",
  "linear-gradient(135deg, #E5DEFF 0%, #D2C6F6 45%, #B6A6E6 100%)",
  "linear-gradient(135deg, #D4E3FF 0%, #BFD6FB 45%, #A8C2EB 100%)",
  "linear-gradient(135deg, #FFE3E8 0%, #FAC8D1 45%, #E6A7B8 100%)",
];

const getInitial = (name: string) => (name.trim().charAt(0) || "?").toUpperCase();

const FeaturedCuenttoFeedCard: React.FC<{
  cuentto: FeaturedCuentto;
  index?: number;
}> = ({ cuentto, index = 0 }) => {
  const gradient = useMemo(
    () => moodGradient(cuentto.mood?.color) ?? GRADIENTS[index % GRADIENTS.length],
    [cuentto.mood?.color, index]
  );
  const displayName = cuentto.user.profileName || cuentto.user.username;

  return (
    <div
      className="relative w-full min-h-[230px] rounded-[20px] p-5 flex flex-col overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-transform hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)]"
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

      <Link href={`${getCuenttoPath(cuentto)}?featured=true`} className="mt-4 block">
        <h2 className="text-[20px] sm:text-[22px] leading-[1.15] font-bold text-subtle-black line-clamp-3">
          {cuentto.title}
        </h2>
      </Link>

      <div className="flex items-center gap-1.5 text-subtle-black/70 mt-3">
        <Clock size={13} strokeWidth={2.5} />
        <span className="text-[12px] font-medium">
          {cuentto.duration} min read
        </span>
      </div>

      <div className="flex items-center gap-2.5 mt-auto pt-4">
        {cuentto.user.profilePicture ? (
          <Image
            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${cuentto.user.profilePicture}`}
            alt={displayName}
            width={28}
            height={28}
            className="w-7 h-7 rounded-full object-cover border border-white/60"
          />
        ) : (
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white text-subtle-black text-[11px] font-bold shadow-sm">
            {getInitial(displayName)}
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
