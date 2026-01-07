"use client";
import { Pause } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SkeletonCuenttoDetail } from "@/app/components/skeletons/CuenttoDetail";
import CustomToast from "@/app/components/toasts/comingSoon";
import { fetchDetailCuentto } from "@/lib/api/cuentto";
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
import { Cuentto } from "@/types/cuentto";

function CuenttoDetailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = useParams();
  const isFeatured = searchParams.get("featured") === "true";
  const [cuentto, setCuentto] = useState<Cuentto | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [needsAuth, setNeedsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    if (!id) return;
    const getCuentto = async () => {
      try {
        setLoading(true);
        const data = await fetchDetailCuentto(Number(id));
        setCuentto(data);

        if (!data.publicLink) {
          const token = localStorage.getItem("authToken");
          if (!token) {
            router.replace("/login");
            return;
          }
          try {
            const payloadBase64 = token.split(".")[1];
            const decodedPayload = atob(payloadBase64);
            const payload = JSON.parse(decodedPayload);
            const isExpired = payload.exp * 1000 < Date.now();
            if (isExpired) {
              localStorage.removeItem("authToken");
              router.replace("/login");
              return;
            }
          } catch (error) {
            console.error("Invalid token", error);
            localStorage.removeItem("authToken");
            router.replace("/login");
            return;
          }
        }
        setNeedsAuth(false);
      } catch (error) {
        console.log(error);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    getCuentto();
  }, [id, router]);

  useEffect(() => {
    const playAudio = async () => {
      if (!loading && audioRef.current) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (err) {
          console.error("Autoplay blocked", err);
          setIsPlaying(false);
        }
      }
    };
    const timeout = setTimeout(() => {
      playAudio();
    }, 1000);
    return () => clearTimeout(timeout);
  }, [loading]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  if (needsAuth === null || loading) {
    return (
      <div className="flex flex-col gap-[30px] w-full py-[60px] px-[110px]">
        <SkeletonCuenttoDetail />
      </div>
    );
  }

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
          onClick={() => CustomToast()}
        />
      </div>
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
        <div
          className="text-[16px] leading-[30x] font-normal text-black"
          dangerouslySetInnerHTML={{ __html: cuentto?.description ?? "" }}
        />
        <span
          className="w-[236px] h-[40px] rounded-[200px] bg-light-violet flex flex-row justify-center items-center gap-[10px] cursor-pointer"
          onClick={() => CustomToast()}
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
          onClick={() => CustomToast()}
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
        <div className="flex flex-row gap-[40px]" onClick={() => CustomToast()}>
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
    </div>
  );
}
export default CuenttoDetailPageContent;
