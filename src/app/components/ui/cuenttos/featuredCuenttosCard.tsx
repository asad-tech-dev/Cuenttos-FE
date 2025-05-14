import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { FeaturedCuentto } from "@/types/cuentto";

const FeaturedCuenttoFeedCard: React.FC<{ cuentto: FeaturedCuentto }> = ({
  cuentto,
}) => {
  return (
    <div
      className=" w-[278px] h-[290px] rounded-tl-[10px] rounded-bl-[10px] rounded-tr-[40px] rounded-br-[40px] p-8 flex flex-col justify-between"
      style={{ backgroundColor: cuentto.mood.color }}
    >
      <Link href={`/cuentto/${cuentto.id}?featured=true`}>
        <div>
          <h2 className=" text-[22px] font-normal text-black">
            {cuentto.title}
          </h2>

          <span className=" text-gray text-[11px] font-medium">
            {typeof cuentto.duration === "number"
              ? `${cuentto.duration} min read`
              : "Unknown duration"}
          </span>
        </div>
      </Link>

      <div className="flex flex-col">
        <span className="px-3 py-1 font-medium text-[11px] bg-gray-4 text-white rounded-full w-fit">
          {cuentto.mood.title}
        </span>
        <div className="flex items-center mt-[10px] gap-3">
          <div className="w-[32px] h-[32px] ">
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
            <p className="font-normal text-[11px] text-subtle-black">
              {cuentto.createdAt
                ? formatDistanceToNow(new Date(cuentto.createdAt), {
                    addSuffix: true,
                  })
                : "Unknown time"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCuenttoFeedCard;
