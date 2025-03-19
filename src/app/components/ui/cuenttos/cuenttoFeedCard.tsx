import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { FavouriteIcon, CommentIcon, CupIcon, OptionIcon } from "../../icons";

interface Cuentto {
  id: number;
  title: string;
  description: string;
  duration: number;
  createdAt: string;
  mood: {
    title: string;
    color: string;
  };
  user: {
    username: string;
    profileName: string;
    profilePicture?: string;
  };
  _count: {
    comments: number;
  };
}

const CuenttoFeedCard: React.FC<{ cuentto: Cuentto }> = ({ cuentto }) => {
  return (
    <div className="bg-white w-[984px] h-[347px] border border-light-gray rounded-[12px] p-8 flex flex-col justify-between">
      <div>
        <div className="flex flex-row justify-between">
          <div className="flex items-center gap-3">
            <div className="w-[32px] h-[32px]">
              <Image
                src={
                  cuentto.user.profilePicture
                    ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/${cuentto.user.profilePicture}`
                    : "/default-avatar.png"
                }
                alt="user image"
                width={32}
                height={32}
                className="object-cover rounded-full !w-full !h-full border border-white"
              />
            </div>
            <div>
              <p className="font-medium text-[11px] text-black">
                {cuentto.user.username}
              </p>
              <p className="font-normal text-[11px] text-gray">
                {cuentto.createdAt
                  ? formatDistanceToNow(new Date(cuentto.createdAt), {
                      addSuffix: true,
                    })
                  : "Unknown time"}
              </p>
            </div>
            <div className="ml-[20px]">
              <Image
                src="/filter-chip.svg"
                alt="filter"
                width={38}
                height={38}
              />
            </div>
          </div>
          <div>
            <OptionIcon
              width={4}
              height={16}
              className="cursor-pointer text-subtle-black"
            />
          </div>
        </div>

        <div className="mt-[16px]">
          <span
            className="px-3 py-1 font-medium text-[11px] text-gray rounded-full w-fit"
            style={{ backgroundColor: cuentto.mood.color }}
          >
            {cuentto.mood.title}
          </span>
        </div>
        <Link href={`/cuentto/${cuentto.id}`}>
          <h2 className="mt-[10px] text-[22px] font-normal text-black">
            {cuentto.title || "Untitled"}
          </h2>
          <p className="mt-[6px] text-gray text-[16px] leading-[28px] font-normal">
            {cuentto.description
              ? cuentto.description.length > 300
                ? `${cuentto.description.substring(0, 300)}...`
                : cuentto.description
              : "No description available."}
          </p>
        </Link>
        <div className="mt-[6px]">
          <span className=" text-gray text-[11px] font-medium">
            {typeof cuentto.duration === "number"
              ? `${cuentto.duration} min read`
              : "Unknown duration"}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center cursor-pointer gap-2">
          <CommentIcon
            width={18}
            height={18}
            className="cursor-pointer text-black"
          />
          <span className="text-black text-[11px] font-medium">
            {cuentto._count.comments ?? 0} comments
          </span>
        </div>
        <div className="flex flex-row gap-[20px]">
          <CupIcon
            width={18}
            height={18}
            className="cursor-pointer text-subtle-black"
          />
          <FavouriteIcon
            width={14}
            height={17}
            className="cursor-pointer text-subtle-black"
          />
        </div>
      </div>
    </div>
  );
};

export default CuenttoFeedCard;
