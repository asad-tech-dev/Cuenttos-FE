"use client";
import checkAuth from "@/HOC/checkAuth";
import { Pause } from "lucide-react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SkeletonCuenttoDetail } from "@/app/components/skeletons/CuenttoDetail";
import CustomToast from "@/app/components/toasts/comingSoon";
import {
  FavouriteIcon,
  CommentIcon,
  CupIcon,
  OptionIcon,
  BackIcon,
  EmojiIcon,
  ShareIcon,
  MusicIcon,
  VolumeIcon,
  PlayIcon,
} from "@/app/components/icons";
import Image from "next/image";

interface CuenttoDetail {
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
  music: {
    id: number;
    name: string;
    musicFile: number;
  };
  _count: {
    comments: number;
  };
}

function CuenttoDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = useParams();
  const isFeatured = searchParams.get("featured") === "true";
  const [cuentto, setCuentto] = useState<CuenttoDetail | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (!id) return;
    const fetchCuentto = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/cuentto/detail/${id}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        setCuentto(response.data.cuentto);
      } catch (error) {
        console.error("Error fetching cuentto:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCuentto();
  }, [id]);
  return (
    <div className="flex flex-col gap-[30px] w-full py-[60px] px-[110px]">
      <div className="flex flex-row justify-between">
        <BackIcon
          width={10}
          height={18}
          className="cursor-pointer text-subtle-black"
          onClick={() => router.back()}
        />
        <OptionIcon
          width={4}
          height={16}
          color="black"
          className="cursor-pointer"
          onClick={() =>
            CustomToast({
              title: "Cuentto actions have not been implemented yet.",
            })
          }
        />
      </div>
      {loading ? (
        <SkeletonCuenttoDetail />
      ) : (
        <>
          <div
            className="relative flex flex-col mt-[30px] justify-between rounded-[24px] bg-gray-5 h-[370px] p-[60px]"
            style={{
              backgroundColor: isFeatured ? cuentto?.mood.color : "bg-gray-5",
            }}
          >
            <div className="flex flex-col gap-[16px]">
              <h2 className=" text-[45px] leading-[52px] font-normal text-dark-violet">
                {cuentto?.title}
              </h2>
              <span
                className={`px-3 py-1 font-medium text-[11px] rounded-full w-fit ${
                  isFeatured ? "bg-gray-400 text-white" : "text-dark-violet"
                }`}
                style={{
                  backgroundColor: !isFeatured ? cuentto?.mood.color : "",
                }}
              >
                {cuentto?.mood.title}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-[40px] h-[40px]">
                <Image
                  src={
                    cuentto?.user.profilePicture
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
                <p className="font-medium text-[14px] text-dark-violet">
                  {cuentto?.user.username}
                </p>
                <p className="font-normal text-[14px] text-gray">
                  {cuentto?.createdAt
                    ? formatDistanceToNow(new Date(cuentto.createdAt), {
                        addSuffix: true,
                      })
                    : "Unknown time"}
                </p>
              </div>
            </div>
            {!isFeatured && (
              <div
                className="absolute bottom-0 right-0 w-[276px] h-[158px] rounded-tl-[90px]"
                style={{ backgroundColor: cuentto?.mood.color }}
              ></div>
            )}
          </div>
          <div className="flex flex-row justify-between items-center mt-[20px] border-b border-light-gray pb-[30px]">
            <div className="flex flex-row items-center gap-[40px]">
              <p className="text-[16px] font-medium text-black">
                {cuentto?.duration} min read
              </p>

              <VolumeIcon
                width={18}
                height={16}
                className="cursor-pointer text-gray-9"
              />
            </div>
            {cuentto?.music && (
              <div className="flex flex-row items-center gap-[14px]">
                <span className="w-fit px-4 h-[32px] rounded-[100px] bg-gray-6 flex flex-row justify-center items-center gap-[10px]">
                  <MusicIcon
                    width={9}
                    height={13}
                    className="cursor-pointer text-black"
                  />
                  <p className="text-[14px] font-medium text-black">
                    {cuentto.music.name}
                  </p>
                </span>
                <div
                  className="w-[20px] h-[20px] flex justify-center rounded-full border-[2px] border-violet cursor-pointer items-center"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? (
                    <Pause
                      size={10}
                      stroke="none"
                      className="fill-current text-violet"
                    />
                  ) : (
                    <PlayIcon
                      width={7}
                      height={7}
                      className="cursor-pointer text-violet"
                    />
                  )}
                </div>

                <audio
                  ref={audioRef}
                  src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/music/${cuentto?.music.musicFile}`}
                  onEnded={() => audioRef.current?.play()}
                />
              </div>
            )}
          </div>
          <div className="pt-[40px] flex flex-col gap-[50px] ">
            <p className="text-[16px] font-normal leading-[28px] text-black">
              {cuentto?.description}
            </p>
            <span
              className="w-[236px] h-[40px] rounded-[200px] bg-light-violet flex flex-row justify-center items-center gap-[10px] cursor-pointer"
              onClick={() =>
                CustomToast({
                  title: "Reactions have not been implemented yet.",
                })
              }
            >
              <p className="text-[14px] font-medium text-black">
                This cuentto makes me...
              </p>
              <EmojiIcon
                width={16}
                height={15}
                color="black"
                className="cursor-pointer"
              />
            </span>
          </div>
          <div className="flex flex-row justify-between items-center mt-[20px]">
            <div
              className="flex items-center cursor-pointer gap-[15px]"
              onClick={() =>
                CustomToast({
                  title: "Comments have not been implemented yet.",
                })
              }
            >
              <CommentIcon
                width={18}
                height={18}
                color="black"
                className="cursor-pointer"
              />
              <span className="text-black text-[16px] font-medium">
                {cuentto?._count.comments ?? 0} comments
              </span>
            </div>
            <div
              className="flex flex-row gap-[40px]"
              onClick={() =>
                CustomToast({
                  title: "Cuentto actions have not been implemented yet.",
                })
              }
            >
              <CupIcon
                width={18}
                height={18}
                color="black"
                className="cursor-pointer"
              />
              <FavouriteIcon
                width={14}
                height={17}
                color="black"
                className="cursor-pointer"
              />
              <ShareIcon
                width={16}
                height={20}
                color="black"
                className="cursor-pointer"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export default checkAuth(CuenttoDetailPage);
