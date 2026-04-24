"use client";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  FavouriteIcon,
  CommentIcon,
  ShareIcon,
  MusicIcon,
} from "../../icons";
import CustomToast from "../../toasts/comingSoon";
import { Cuentto } from "@/types/cuentto";

const CuenttoFeedCard: React.FC<{ cuentto: Cuentto }> = ({ cuentto }) => {
  const relativeTime = cuentto.createdAt
    ? formatDistanceToNow(new Date(cuentto.createdAt), { addSuffix: true })
    : "Unknown time";

  return (
    <div className="bg-white w-full max-w-[984px] border border-light-gray rounded-[16px] p-6 sm:p-8 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 bg-[#EEEAFE] text-[#6C5CE7] rounded-full px-3 py-1.5">
          <ShareIcon
            width={12}
            height={14}
            className="text-[#6C5CE7]"
          />
          <span className="text-[12px] font-semibold">
            {cuentto.user.username} shared with you
          </span>
        </div>
        <span className="text-gray text-[12px] font-normal whitespace-nowrap">
          {relativeTime}
        </span>
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
            <CommentIcon
              width={18}
              height={18}
              className="text-subtle-black"
            />
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
    </div>
  );
};

export default CuenttoFeedCard;
