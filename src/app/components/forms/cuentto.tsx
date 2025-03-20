"use client";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pause } from "lucide-react";
import axios from "axios";
import PublishCuentto from "../popups/publishCuentto";
import Image from "next/image";
import { CheckIcon, CloseIcon, MicIcon, MusicIcon, PlayIcon } from "../icons";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import CustomRadioButtonGroup from "../ui/CustomRadioButtonGroup";
import { Dialog } from "@/components/ui/dialog";
import Spinner from "../ui/Spinner";

type Mood = {
  id: number;
  title: string;
  color: string;
};
type Group = {
  id: number;
  name: string;
};
type Music = {
  id: number;
  name: string;
  artist: string;
  albumArt: string;
  musicFile: string;
  length: number;
};
type Durations = {
  [key: string]: string;
};

const schema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(150, "Title cannot be longer than 80 characters"),
  description: z.string().min(1, "Description is required"),
  duration: z.coerce.number().min(1, "Duration is required"),
  moodId: z.coerce.number().min(1, "Select at least one emotion"),
  musicId: z.coerce.number().optional(),
  groupIds: z.array(z.number()).optional(),
});

type FormData = z.infer<typeof schema>;

export default function CuenttoForm() {
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: "onChange" });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sidebarContent, setSidebarContent] = useState("music");
  const [error, setError] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedMusic, setSelectedMusic] = useState<{
    id: number;
    name: string;
    musicFile: string;
    albumArt: string;
    artist: string;
  } | null>(null);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [musics, setMusics] = useState<Music[]>([]);
  const [durations, setDurations] = useState<Durations>({});
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playingMusicId, setPlayingMusicId] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchDurations = async () => {
      const tempDurations: Durations = {};
      await Promise.all(
        musics.map((musics) => {
          return new Promise<void>((resolve) => {
            if (!musics.musicFile) {
              resolve();
              return;
            }
            const audio = new Audio(
              `${process.env.NEXT_PUBLIC_API_URL}/uploads/music/${musics.musicFile}`
            );
            audio.addEventListener("loadedmetadata", () => {
              tempDurations[musics.id] = formatTime(audio.duration);
              resolve();
            });
            audio.addEventListener("error", () => {
              tempDurations[musics.id] = "0:00";
              resolve();
            });
          });
        })
      );
      setDurations(tempDurations);
    };
    if (musics.length > 0) {
      fetchDurations();
    }
  }, [musics]);
  const formatTime = (seconds: number): string => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };
  const togglePlayPause = async (musicId: number, musicFile: string) => {
    if (!audioRef.current) return;
    if (playingMusicId === musicId) {
      audioRef.current.pause();
      setPlayingMusicId(null);
    } else {
      if (
        audioRef.current.src !==
        `${process.env.NEXT_PUBLIC_API_URL}/uploads/music/${musicFile}`
      ) {
        audioRef.current.src = `${process.env.NEXT_PUBLIC_API_URL}/uploads/music/${musicFile}`;
        audioRef.current.currentTime = 0;
      }
      try {
        await audioRef.current.play();
        setPlayingMusicId(musicId);
      } catch (error) {
        console.error("Audio playback failed:", error);
      }
    }
  };
  const selectMood = (id: number, label: string) => {
    if (selectedMood === label) {
      setValue("moodId", 0);
      setSelectedMood(null);
    } else {
      setValue("moodId", id);
      setSelectedMood(label);
    }
  };
  const selectMusic = (
    id: number,
    name: string,
    musicFile: string,
    albumArt: string,
    artist: string
  ) => {
    {
      setValue("musicId", id);
      setSelectedMusic({ id, name, musicFile, albumArt, artist });
    }
  };
  const handleFirstStep = async () => {
    const isFormValid = await trigger(["duration", "title", "description"]);
    if (isFormValid) {
      setStep(2);
    }
  };
  const handleNextStep = async () => {
    const isMoodValid = await trigger(["moodId"]);
    if (isMoodValid) {
      setStep(3);
    }
  };
  useEffect(() => {
    const fetchMoods = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/moods`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        setMoods(response.data.moods);
      } catch (error) {
        console.error("Error fetching moods:", error);
      }
    };
    fetchMoods();
  }, []);

  useEffect(() => {
    const fetchMusics = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/music?limit=4`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        setMusics(response.data.musics.slice(0, 4));
      } catch (error) {
        console.error("Error fetching moods:", error);
      }
    };
    fetchMusics();
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/group/user`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        setGroups(response.data.groups);
      } catch (error) {
        console.error("Error fetching moods:", error);
      }
    };
    fetchGroups();
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/cuentto`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Cuentto creation failed. Please try again."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
      setStep(1);
      setTimeout(() => {
        setOpenDialog(true);
      }, 500);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col w-full mt-10"
    >
      <div className="flex w-full justify-between pb-[20px] border-b border-light-gray">
        <div className="">
          <input
            {...register("duration")}
            type="number"
            placeholder="2 min read"
            className="text-dark-violet placeholder-dark-violet w-[1100px] text-[16px] bg-none outline-none  placeholder-black no-spinner"
          />
          {errors.duration && (
            <p className="text-red-400 text-left w-full">
              {errors.duration.message}
            </p>
          )}
        </div>
        <div className="flex flex-row items-center gap-[40px]">
          <MicIcon
            width={14}
            height={19}
            className="cursor-pointer text-gray-9"
          />
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <button type="button" onClick={() => setSidebarContent("music")}>
                {selectedMusic ? (
                  <span className="w-fit px-4 h-[32px] rounded-[100px] cursor-pointer bg-white border border-violet flex flex-row justify-center items-center gap-[10px]">
                    <MusicIcon
                      width={9}
                      height={13}
                      className="cursor-pointer text-violet"
                    />
                    <p className="text-[14px] font-medium text-violet">
                      {selectedMusic.name}
                    </p>
                  </span>
                ) : (
                  <Image
                    src="/media.svg"
                    alt="Music Icon"
                    width={24}
                    height={24}
                    className="cursor-pointer"
                  />
                )}
              </button>
            </SheetTrigger>
            <SheetContent className="bg-white flex flex-col justify-between border-none !max-w-none !w-[588px] border-l px-[50px] py-[60px] border-light-gray">
              {sidebarContent === "music" && (
                <>
                  <div className="flex flex-col justify-start items-start">
                    <p className="text-[14px] font-medium text-gray">
                      Add music
                    </p>
                    <p className="text-[22px] font-normal text-subtle-black mt-[10px]">
                      Select a background music
                    </p>
                    <div className=" flex flex-col h-[448px] mt-[50px] gap-4 w-full justify-start ">
                      {musics.map((music, index) => (
                        <div
                          key={music.id}
                          className={`flex flex-row justify-between items-center w-full pb-[35px] pt-[20px]
                            ${
                              index !== musics.length - 1
                                ? "border-b border-light-gray"
                                : "border-none"
                            }`}
                          onClick={() =>
                            selectMusic(
                              music.id,
                              music.name,
                              music.musicFile,
                              music.albumArt,
                              music.artist
                            )
                          }
                        >
                          <div className="flex flex-row items-center gap-[30px]">
                            <div
                              className="relative cursor-pointer"
                              onClick={() =>
                                togglePlayPause(music.id, music.musicFile)
                              }
                            >
                              <Image
                                src={
                                  music.albumArt
                                    ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/${music.albumArt}`
                                    : "/default-avatar.png"
                                }
                                alt="music cover"
                                width={24}
                                height={24}
                                className="cursor-pointer w-[56px] h-[56px] rounded-[8px] backdrop-blur-2xl object-cover object-center"
                              />
                              <div className="w-[29px] h-[29px] absolute z-100 rounded-full flex justify-center items-center border-[1px] border-white cursor-pointer top-3.5 right-3.5">
                                {playingMusicId === music.id ? (
                                  <Pause
                                    size={18}
                                    stroke="none"
                                    className="fill-current text-white"
                                  />
                                ) : (
                                  <PlayIcon
                                    width={13}
                                    height={13}
                                    className="cursor-pointer text-white"
                                  />
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <p className="text-[18px] font-normal text-dark-violet">
                                {music.name}
                              </p>
                              <p className="text-[14px] font-medium text-gray-8">
                                {music.artist}
                              </p>
                            </div>
                          </div>
                          <p className="text-[18px] font-normal text-dark-violet">
                            {durations[music.id]}
                          </p>
                        </div>
                      ))}
                    </div>
                    <input type="hidden" {...register("musicId")} />
                  </div>
                  <div>
                    {selectedMusic && (
                      <div className="flex flex-row">
                        <Image
                          src={
                            selectedMusic.albumArt
                              ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/${selectedMusic.albumArt}`
                              : "/default-avatar.png"
                          }
                          alt="music cover"
                          width={24}
                          height={24}
                          className="cursor-pointer w-[65px] rounded-tl-[4px] rounded-bl-[4px] h-[65px] object-cover object-center"
                        />
                        <div className=" w-full relative bg-violet-4 px-[20px] rounded-tr-[4px] rounded-br-[4px] flex justify-between">
                          <CloseIcon
                            width={23}
                            height={23}
                            className="cursor-pointer absolute -right-3 -top-3 text-red"
                            onClick={() => setSelectedMusic(null)}
                          />
                          <div className="w-full h-[6px] bg-violet-2 overflow-hidden rounded-br-[4px] absolute bottom-0 left-0">
                            <div
                              className="h-full bg-violet-3 transition-all"
                              style={{
                                width: `${(currentTime / duration) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                              <p className="text-[14px] font-medium text-dark-violet">
                                {selectedMusic.name} - {selectedMusic.artist}
                              </p>
                              <span className="text-[12px] font-medium text-gray-8">
                                {formatTime(currentTime)} /{" "}
                                {formatTime(duration)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <button
                              onClick={() =>
                                togglePlayPause(
                                  selectedMusic.id,
                                  selectedMusic.musicFile
                                )
                              }
                            >
                              {playingMusicId === selectedMusic.id ? (
                                <Pause
                                  size={26}
                                  stroke="none"
                                  className="fill-current cursor-pointer text-dark-violet"
                                />
                              ) : (
                                <PlayIcon
                                  width={18}
                                  height={18}
                                  className="cursor-pointer text-dark-violet"
                                />
                              )}
                            </button>

                            <audio
                              ref={audioRef}
                              onTimeUpdate={() =>
                                setCurrentTime(
                                  audioRef.current?.currentTime || 0
                                )
                              }
                              onLoadedMetadata={() =>
                                setDuration(audioRef.current?.duration || 0)
                              }
                              onEnded={() => setPlayingMusicId(null)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-row justify-end items-center">
                    <button
                      type="button"
                      className="bg-violet w-[120px] h-[40px] rounded-[8px] text-white cursor-pointer"
                      onClick={() => setIsSheetOpen(false)}
                    >
                      Add Music
                    </button>
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="w-full pt-[70px] pb-[40px] border-gray-7 border-b">
        <input
          {...register("title")}
          placeholder="Title goes here (no need to put it first)"
          className="text-dark-violet placeholder-gray-7 w-full text-[24px] font-normal bg-none outline-none"
        />
        {errors.title && (
          <p className="text-red-400 text-left w-full">
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="w-full pt-[70px] pb-[40px] border-gray-7 border-b overflow-hidden ">
        <textarea
          {...register("description")}
          rows={8}
          placeholder="Start typing here (Doesn’t have to be a large cuentto)"
          className="text-subtle-black placeholder-gray-7 w-full text-[16px] font-normal bg-none outline-none resize-none"
        />
        {errors.description && (
          <p className="text-red-400 text-left w-full">
            {errors.description.message}
          </p>
        )}
      </div>
      <div className=" w-full mt-[50px] flex flex-row ml-auto justify-end items-end">
        {step === 1 && (
          <button
            type="button"
            onClick={handleFirstStep}
            className="w-[80px] h-[40px] text-[14px] rounded-[8px] font-medium bg-violet text-white cursor-pointer"
          >
            Next
          </button>
        )}
      </div>

      <Sheet
        open={step > 1}
        onOpenChange={(isOpen) => {
          if (!isOpen) setStep(1);
        }}
      >
        <SheetContent className="bg-white flex flex-col justify-between border-none !max-w-none !w-[588px] border-l px-[50px] py-[60px] border-light-gray">
          {step === 2 && (
            <>
              <div className="flex flex-col justify-start items start">
                <p className="text-[14px] font-medium text-gray">Emotions</p>
                <p className="text-[22px] font-normal text-subtle-black mt-[10px]">
                  Select an emotion for your <br></br>Cuentto:
                </p>
                <div className=" flex flex-row flex-wrap  mt-[40px] gap-4 w-full justify-start ">
                  {moods.map((moods) => (
                    <button
                      key={moods.id}
                      onClick={() => selectMood(moods.id, moods.title)}
                      className={`py-3 px-[20px] flex items-center justify-center gap-2.5 text-black rounded-[100px] cursor-pointer text-[14px] font-medium transition-all duration-300 ease-in-out ${
                        selectedMood === moods.title
                          ? "border border-light-black"
                          : "border border-white px-2"
                      }`}
                      style={{ backgroundColor: moods.color || "#ccc" }}
                    >
                      {selectedMood === moods.title && (
                        <CheckIcon width={18} height={18} color="black" />
                      )}
                      {moods.title}
                    </button>
                  ))}
                </div>
                {errors.moodId && !selectedMood && (
                  <p className="text-red-400 mt-[50px] text-left w-full">
                    {errors.moodId.message}
                  </p>
                )}
              </div>
              <input type="hidden" {...register("moodId")} />

              <div className="flex flex-row justify-end items-center gap-6">
                <p
                  className="text-violet text-[14px] font-medium cursor-pointer"
                  onClick={() => setStep((prev) => Math.max(prev - 1, 1))}
                >
                  previous step
                </p>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-violet w-[80px] h-[40px] rounded-[8px] text-white cursor-pointer"
                >
                  Next
                </button>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div className="flex flex-col justify-start items-start">
                <p className="text-[14px] font-medium text-gray">Share</p>
                <p className="text-[22px] font-normal text-subtle-black mt-[10px]">
                  Select with who to share your <br></br>Cuentto:
                </p>
                <div className="flex flex-col mt-[40px] gap-4 w-full justify-start">
                  <CustomRadioButtonGroup
                    className="flex flex-col gap-4 w-full justify-start"
                    onChange={(values) => {
                      let groupIds: number[] = [];
                      if (values.includes("all")) {
                        groupIds = [];
                      } else {
                        groupIds = values.map((value) =>
                          parseInt(value.toString(), 10)
                        );
                      }
                      setValue("groupIds", groupIds);
                    }}
                    options={[
                      { value: "all", label: "All" },
                      ...groups.map((group) => ({
                        value: group.id,
                        label: group.name,
                      })),
                    ]}
                    defaultValue={["all"]}
                  />
                </div>
                {error && (
                  <p className="text-red-400 w-full text-left">{error}</p>
                )}
              </div>
              <div className="flex flex-row justify-end items-center gap-6">
                <p
                  className="text-violet text-[14px] font-medium cursor-pointer"
                  onClick={() => setStep((prev) => Math.max(prev - 1, 1))}
                >
                  previous step
                </p>
                <button
                  type="submit"
                  onClick={handleSubmit(onSubmit)}
                  className="bg-violet w-[87px] h-[40px] rounded-[8px] text-white cursor-pointer"
                >
                  {loading ? (
                    <Spinner
                      size="w-6 h-6"
                      color="border-white"
                      borderSize="border-3"
                    />
                  ) : (
                    "Share"
                  )}
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <PublishCuentto />
      </Dialog>
    </form>
  );
}
