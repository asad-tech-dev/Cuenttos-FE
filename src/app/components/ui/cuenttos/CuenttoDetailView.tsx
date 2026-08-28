"use client";
import { Pause, FileQuestion } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { SkeletonCuenttoDetail } from "@/app/components/skeletons/CuenttoDetail";
import { OpenInAppButton } from "@/app/components/buttons/OpenInAppButton";
import CustomToast from "@/app/components/toasts/comingSoon";
import axios from "axios";
import {
  FavouriteIcon,
  CommentIcon,
  OptionIcon,
  BackIcon,
  ShareIcon,
  MusicIcon,
  VolumeIcon,
  PlayIcon,
} from "@/app/components/icons";
import Image from "next/image";
import { Cuentto } from "@/types/cuentto";

const HTML_PATTERN = /<\/?[a-z][\s\S]*>|&[a-z]+;|&#\d+;/i;
function looksLikeHtml(value?: string | null): boolean {
  return typeof value === "string" && HTML_PATTERN.test(value);
}

// `prose` (Tailwind Typography) restyles whatever tags the rich text editor
// produces — headings, lists, blockquotes, tables, code, images, etc. —
// instead of us hand-listing each tag Tailwind's preflight strips styling from.
const HTML_FORMAT_CLASSES =
  "prose max-w-none text-[15px] sm:text-[16px] leading-[28px] sm:leading-[30px] text-black prose-headings:text-black prose-p:text-black prose-li:text-black prose-strong:text-black prose-blockquote:text-black prose-blockquote:border-violet prose-a:text-violet prose-a:break-words";

interface CuenttoDetailViewProps {
  // Fetches the cuentto for whichever URL shape the caller resolved
  // (numeric id, or username/slug) — this view doesn't know or care which.
  fetchCuentto: () => Promise<Cuentto>;
  // False when the route params themselves are malformed (e.g. a non-numeric
  // id), so we can show "not found" without ever calling fetchCuentto.
  paramsValid: boolean;
  isFeatured: boolean;
}

function CuenttoDetailView({
  fetchCuentto,
  paramsValid,
  isFeatured,
}: CuenttoDetailViewProps) {
  const router = useRouter();
  const [cuentto, setCuentto] = useState<Cuentto | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [needsAuth, setNeedsAuth] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const isTokenValid = useCallback(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 >= Date.now();
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!paramsValid) {
      setIsAuthenticated(isTokenValid());
      setNotFound(true);
      setNeedsAuth(false);
      return;
    }

    const getCuentto = async () => {
      try {
        setLoading(true);
        const data = await fetchCuentto();
        setCuentto(data);

        if (!data.publicLink) {
          const token = localStorage.getItem("authToken");
          if (!token) {
            router.replace(
              `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
            );
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
            router.replace(
              `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
            );
            return;
          }
        }
        setIsAuthenticated(isTokenValid());
        setNeedsAuth(false);
      } catch (error) {
        console.log(error);
        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;
        if (status === 404 || status === 400) {
          setIsAuthenticated(isTokenValid());
          setNotFound(true);
          setNeedsAuth(false);
          return;
        }
        router.replace(
          `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
        );
      } finally {
        setLoading(false);
      }
    };
    getCuentto();
  }, [paramsValid, fetchCuentto, router, isTokenValid]);

  // Browsers block unmuted autoplay until the user has interacted with the
  // page, so a shared link opened in a fresh tab cannot make sound on its
  // own. Try as soon as the track is rendered; if the browser refuses,
  // start at the earliest moment it allows: the first interaction anywhere
  // on the page (pointer, touch, key), or the tab becoming visible/focused
  // (covers links opened in a background tab). All auto-start machinery is
  // torn down after the first successful start or the first use of the
  // play/pause button, so it can never override a manual pause.
  useEffect(() => {
    const audio = audioRef.current;
    if (loading || !cuentto?.music || !audio) return;

    let cancelled = false;
    const gestureEvents = ["pointerdown", "touchend", "keydown", "click"];

    function disarm() {
      gestureEvents.forEach((name) =>
        document.removeEventListener(name, startOnGesture),
      );
      document.removeEventListener("visibilitychange", retryWhenVisible);
      window.removeEventListener("focus", retryWhenVisible);
    }

    function startOnGesture(event: Event) {
      // The play/pause button handles its own gesture — hand control over
      // to it instead of double-firing.
      if ((event.target as HTMLElement | null)?.closest("[data-play-toggle]")) {
        disarm();
        return;
      }
      // Keep listeners armed until a play attempt actually succeeds; some
      // browsers only accept certain gesture types as activation.
      audio?.play().then(disarm).catch(() => {});
    }

    function retryWhenVisible() {
      if (document.visibilityState !== "visible") return;
      audio?.play().then(disarm).catch(() => {});
    }

    audio.play().catch(() => {
      if (cancelled) return;
      setIsPlaying(false);
      gestureEvents.forEach((name) =>
        document.addEventListener(name, startOnGesture),
      );
      document.addEventListener("visibilitychange", retryWhenVisible);
      window.addEventListener("focus", retryWhenVisible);
    });

    return () => {
      cancelled = true;
      disarm();
      audio.pause();
    };
  }, [loading, cuentto]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  if (notFound) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center w-full min-h-[calc(100vh-110px)] px-6 py-16">
        <div className="flex flex-col items-center gap-6 max-w-[440px]">
          <div className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-light-violet">
            <FileQuestion className="text-violet w-9 h-9 sm:w-11 sm:h-11" />
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-[26px] sm:text-[32px] leading-tight font-semibold text-dark-violet">
              Cuentto Not Found
            </h1>
            <p className="text-[15px] sm:text-[16px] leading-[24px] text-gray">
              The Cuentto you are looking for does not exist or may have been
              removed.
            </p>
          </div>
          <Link
            href={isAuthenticated ? "/share" : "/"}
            className="flex items-center justify-center h-[44px] px-6 rounded-[100px] bg-violet text-white text-[14px] font-medium cursor-pointer whitespace-nowrap"
          >
            Go to Cuenttos
          </Link>
        </div>
      </div>
    );
  }

  if (needsAuth === null || loading) {
    return (
      <div className="flex flex-col gap-6 md:gap-[30px] w-full py-8 md:py-[60px] px-4 sm:px-6 md:px-[110px]">
        <SkeletonCuenttoDetail />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:gap-[30px] w-full py-8 md:py-[60px] px-4 sm:px-6 md:px-[110px]">
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
        className="relative overflow-hidden flex flex-col gap-8 md:gap-0 mt-2 md:mt-[30px] justify-between rounded-[24px] bg-gray-5 min-h-[260px] md:h-[370px] p-6 sm:p-10 md:p-[60px]"
        style={{
          backgroundColor: isFeatured ? cuentto?.mood.color : "bg-gray-5",
        }}
      >
        <div className="flex flex-col gap-[16px]">
          <h2 className="text-[28px] leading-[34px] sm:text-[36px] sm:leading-[42px] md:text-[45px] md:leading-[52px] font-normal text-dark-violet break-words">
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
        <div className="relative z-10 flex items-center gap-4">
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
            className="absolute bottom-0 right-0 w-[160px] h-[90px] md:w-[276px] md:h-[158px] rounded-tl-[60px] md:rounded-tl-[90px]"
            style={{ backgroundColor: cuentto?.mood.color }}
          ></div>
        )}
      </div>
      <div className="flex flex-row flex-wrap gap-y-3 justify-between items-center mt-2 md:mt-[20px] border-b border-light-gray pb-5 md:pb-[30px]">
        <div className="flex flex-row items-center gap-5 sm:gap-[40px]">
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
              data-play-toggle
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
              loop
              preload="auto"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-8 md:gap-[50px] ">
        {cuentto?.description &&
          (looksLikeHtml(cuentto.description) ? (
            <div
              className={`font-normal break-words ${HTML_FORMAT_CLASSES}`}
              dangerouslySetInnerHTML={{ __html: cuentto.description }}
            />
          ) : (
            <div className="text-[15px] sm:text-[16px] leading-[28px] sm:leading-[30px] font-normal text-black break-words whitespace-pre-line">
              {cuentto.description}
            </div>
          ))}
      </div>
      <div className="flex flex-row justify-between items-center mt-2 md:mt-[20px]">
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
          <span className="text-black text-[14px] sm:text-[16px] font-medium">
            {cuentto?._count.comments ?? 0} comments
          </span>
        </div>
        <div
          className="flex flex-row gap-7 sm:gap-[40px]"
          onClick={() => CustomToast()}
        >
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

      {!isAuthenticated && cuentto && (
        <div className="mt-4 md:mt-[20px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[20px] bg-light-violet px-6 py-6 sm:py-5">
          <div className="flex flex-col gap-1">
            <p className="text-[16px] sm:text-[18px] font-semibold text-dark-violet">
              Join Cuentto
            </p>
            <p className="text-[13px] sm:text-[14px] font-normal text-dark-violet/70">
              Free your mind. Read, write and share more cuenttos.
            </p>
          </div>
          <div className="flex flex-row gap-3 shrink-0">
            {cuentto.slug && (
              <OpenInAppButton
                target={{
                  kind: "cuentto",
                  username: cuentto.user.username,
                  slug: cuentto.slug,
                }}
                className="flex items-center justify-center h-[40px] px-5 rounded-[100px] bg-violet text-white text-[14px] font-medium cursor-pointer whitespace-nowrap"
              />
            )}
            <Link
              href={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}
              className="flex items-center justify-center h-[40px] px-5 rounded-[100px] border border-violet text-violet text-[14px] font-medium cursor-pointer whitespace-nowrap"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
export default CuenttoDetailView;
