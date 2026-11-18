"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronRight,
  Music2,
  Pause,
  Play,
  Search,
  VolumeX,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Music } from "@/types/music";

interface PromptMusicPickerProps {
  songs: Music[];
  loaded: boolean;
  failed: boolean;
  /** Selected song id as a string, "" for no song. */
  value: string;
  onChange: (value: string) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const coverSrc = (albumArt?: string | null) =>
  albumArt ? `${API_URL}/uploads/${albumArt}` : null;
const songSrc = (musicFile: string) => `${API_URL}/uploads/music/${musicFile}`;

const matches = (song: Music, query: string) =>
  song.name.toLowerCase().includes(query) ||
  (song.artist ?? "").toLowerCase().includes(query);

/**
 * "Background music" for a Today's Prompt. The form shows just the chosen
 * song (or a "Select music" button); the library opens in a drawer with
 * search, a scrolling list and previews, so the form stays tidy however many
 * songs there are. The pick only applies on "Done" — closing the drawer any
 * other way leaves the song as it was. One preview plays at a time.
 */
export default function PromptMusicPicker({
  songs,
  loaded,
  failed,
  value,
  onChange,
}: PromptMusicPickerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  // The drawer's pick until "Done".
  const [draft, setDraft] = useState(value);
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  const stopPreview = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPreviewId(null);
  };

  useEffect(
    () => () => {
      audioRef.current?.pause();
      audioRef.current = null;
    },
    [],
  );

  const togglePreview = async (song: Music) => {
    if (previewId === song.id) {
      stopPreview();
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(songSrc(song.musicFile));
    audio.addEventListener("ended", () =>
      setPreviewId((id) => (id === song.id ? null : id)),
    );
    audioRef.current = audio;
    try {
      await audio.play();
      setPreviewId(song.id);
    } catch (err) {
      console.error("Song preview failed:", err);
      setPreviewId(null);
    }
  };

  const openDrawer = () => {
    setDraft(value);
    setQuery("");
    setOpen(true);
  };

  const closeDrawer = () => {
    stopPreview();
    setOpen(false);
  };

  const confirmDrawer = () => {
    onChange(draft);
    closeDrawer();
  };

  // Bring the picked song into view when the drawer opens on a long list.
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      listRef.current
        ?.querySelector<HTMLElement>('[aria-checked="true"]')
        ?.scrollIntoView?.({ block: "nearest" });
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const selectedSong = songs.find((s) => String(s.id) === value);
  // A song picked earlier that's no longer in the library stays selected,
  // so opening the editor never drops it by accident.
  const missingCurrent = loaded && value !== "" && !selectedSong;

  const q = query.trim().toLowerCase();
  const visibleSongs = useMemo(
    () => (q ? songs.filter((s) => matches(s, q)) : songs),
    [songs, q],
  );

  const songArt = (song: Music, size: "sm" | "md") => {
    const playing = previewId === song.id;
    const cover = coverSrc(song.albumArt);
    const box = size === "md" ? "h-[48px] w-[48px]" : "h-[44px] w-[44px]";
    return (
      <button
        type="button"
        onClick={() => togglePreview(song)}
        aria-label={`${playing ? "Pause" : "Play"} preview: ${song.name}`}
        aria-pressed={playing}
        className={`group/art relative ${box} shrink-0 overflow-hidden rounded-[10px] bg-light-violet cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet/40`}
      >
        {cover ? (
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-violet">
            <Music2 size={18} />
          </span>
        )}
        <span
          className={`absolute inset-0 flex items-center justify-center bg-dark-violet/45 text-white transition-opacity duration-200 ${
            playing
              ? "opacity-100"
              : "opacity-0 group-hover/art:opacity-100 group-focus-visible/art:opacity-100"
          }`}
        >
          {playing ? (
            <Pause size={16} className="fill-current" />
          ) : (
            <Play size={16} className="fill-current" />
          )}
        </span>
      </button>
    );
  };

  const iconArt = (icon: React.ReactNode, tone: "muted" | "violet") => (
    <span
      className={`flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[10px] ${
        tone === "violet"
          ? "bg-light-violet text-violet"
          : "bg-gray-6 text-gray-7"
      }`}
    >
      {icon}
    </span>
  );

  // ---- The field in the form -------------------------------------------
  let field: React.ReactNode;
  if (!loaded) {
    field = failed ? (
      <p className="rounded-[12px] border border-dashed border-light-gray bg-gray-5 px-4 py-4 text-[13px] leading-[20px] text-gray">
        Couldn&apos;t load the songs, so saving keeps the prompt&apos;s song as
        it is.
      </p>
    ) : (
      <div
        aria-label="Loading songs"
        className="h-[66px] animate-pulse rounded-[12px] bg-gray-6"
      />
    );
  } else if (!selectedSong && !missingCurrent) {
    field = (
      <button
        type="button"
        onClick={openDrawer}
        className="group flex w-full items-center gap-3 rounded-[12px] border border-dashed border-violet/40 bg-light-violet/15 p-2.5 text-left transition-colors duration-200 hover:border-violet hover:bg-light-violet/35 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet/30"
      >
        {iconArt(<Music2 size={18} />, "violet")}
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[14px] font-semibold leading-[20px] text-violet">
            Select music
          </span>
          <span className="truncate text-[12px] leading-[18px] text-gray-7">
            {songs.length > 0
              ? `Choose from ${songs.length} ${songs.length === 1 ? "song" : "songs"}`
              : "No songs in the library yet"}
          </span>
        </span>
        <ChevronRight
          size={18}
          className="shrink-0 text-violet transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </button>
    );
  } else {
    field = (
      <div className="flex min-w-0 items-center gap-3 rounded-[12px] border border-violet/40 bg-light-violet/25 p-2.5">
        {selectedSong
          ? songArt(selectedSong, "sm")
          : iconArt(<Music2 size={18} />, "violet")}
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[14px] font-semibold leading-[20px] text-subtle-black">
            {selectedSong ? selectedSong.name : "Current song"}
          </span>
          <span className="truncate text-[12px] leading-[18px] text-gray-7">
            {selectedSong
              ? previewId === selectedSong.id
                ? "Playing preview…"
                : selectedSong.artist
              : "No longer in the library"}
          </span>
        </span>
        <button
          type="button"
          onClick={openDrawer}
          className="shrink-0 rounded-[8px] px-3 py-1.5 text-[13px] font-semibold text-violet transition-colors duration-200 hover:bg-light-violet cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet/30"
        >
          Change
        </button>
        <button
          type="button"
          onClick={() => {
            stopPreview();
            onChange("");
          }}
          aria-label="Remove song"
          title="Remove song"
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-gray-7 transition-colors duration-200 hover:bg-red/10 hover:text-red cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red/30"
        >
          <X size={15} />
        </button>
      </div>
    );
  }

  // ---- A row in the drawer ---------------------------------------------
  const row = ({
    key,
    selected,
    onSelect,
    art,
    title,
    subtitle,
  }: {
    key: string;
    selected: boolean;
    onSelect: () => void;
    art: React.ReactNode;
    title: string;
    subtitle: string;
  }) => (
    <li
      key={key}
      className={`flex min-w-0 items-center gap-3 rounded-[12px] border p-2 transition-colors duration-200 ${
        selected
          ? "border-violet bg-light-violet/40"
          : "border-transparent hover:bg-gray-5"
      }`}
    >
      {art}
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-3 self-stretch text-left cursor-pointer focus:outline-none focus-visible:underline"
      >
        <span className="flex min-w-0 flex-1 flex-col">
          <span
            className={`truncate text-[14px] font-medium leading-[20px] ${
              selected ? "text-violet" : "text-subtle-black"
            }`}
          >
            {title}
          </span>
          <span className="truncate text-[12px] leading-[18px] text-gray-7">
            {subtitle}
          </span>
        </span>
        <span
          aria-hidden
          className={`flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
            selected ? "border-violet bg-violet" : "border-light-gray bg-white"
          }`}
        >
          {selected && <Check size={12} strokeWidth={3} className="text-white" />}
        </span>
      </button>
    </li>
  );

  const draftSong = songs.find((s) => String(s.id) === draft);

  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-2 text-[13px] font-medium text-dark-gray">
        <span>Background music</span>
        <span className="text-[11px] font-normal text-gray-7">(optional)</span>
      </p>
      <div className="sm:max-w-[480px]">{field}</div>
      <p className="text-[12px] leading-[18px] text-gray-7">
        Writing from this prompt starts with this song playing. Writers can
        still change it.
      </p>

      <Sheet open={open} onOpenChange={(next) => !next && closeDrawer()}>
        <SheetContent
          side="right"
          className="!w-full !max-w-none sm:!w-[480px] gap-0 border-light-gray bg-white p-0"
        >
          {/* Header */}
          <div className="shrink-0 px-5 pt-6 pb-4 pr-14 sm:px-7 sm:pt-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-violet">
              Background music
            </p>
            <SheetTitle className="mt-1.5 text-[20px] font-semibold leading-[28px] text-subtle-black">
              Select music
            </SheetTitle>
            <SheetDescription className="mt-1 text-[13px] leading-[20px] text-gray">
              Writing from this prompt starts with this song playing. Tap a
              cover to preview.
            </SheetDescription>
          </div>

          {/* Search */}
          <div className="shrink-0 px-5 pb-3 sm:px-7">
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-7"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
                placeholder="Search songs or artists"
                aria-label="Search songs"
                className="h-[44px] w-full rounded-[10px] border border-light-gray bg-white pl-10 pr-3 text-[15px] text-subtle-black placeholder-gray-7 outline-none transition-colors duration-200 focus:border-violet focus:ring-2 focus:ring-violet/15"
              />
            </div>
            <p className="mt-2 text-[12px] text-gray-7 tabular-nums">
              {q
                ? `${visibleSongs.length} of ${songs.length} songs`
                : `${songs.length} ${songs.length === 1 ? "song" : "songs"}`}
            </p>
          </div>

          {/* List — the only part that scrolls */}
          <div
            ref={listRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain border-t border-light-gray px-3 py-3 sm:px-5"
          >
            <ul
              role="radiogroup"
              aria-label="Songs"
              className="flex flex-col gap-1"
            >
              {!q &&
                row({
                  key: "none",
                  selected: draft === "",
                  onSelect: () => setDraft(""),
                  art: iconArt(<VolumeX size={18} />, "muted"),
                  title: "No song",
                  subtitle: "Writers pick their own",
                })}
              {!q &&
                missingCurrent &&
                row({
                  key: "current",
                  selected: draft === value,
                  onSelect: () => setDraft(value),
                  art: iconArt(<Music2 size={18} />, "violet"),
                  title: "Current song",
                  subtitle: "No longer in the library",
                })}
              {visibleSongs.map((song) =>
                row({
                  key: String(song.id),
                  selected: draft === String(song.id),
                  onSelect: () => setDraft(String(song.id)),
                  art: songArt(song, "md"),
                  title: song.name,
                  subtitle:
                    previewId === song.id ? "Playing preview…" : song.artist,
                }),
              )}
            </ul>
            {q && visibleSongs.length === 0 && (
              <p className="px-2 py-8 text-center text-[14px] text-gray">
                No songs match &ldquo;{query.trim()}&rdquo;.
              </p>
            )}
            {!q && songs.length === 0 && (
              <p className="px-2 py-8 text-center text-[14px] text-gray">
                No songs in the library yet.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 flex flex-col gap-3 border-t border-light-gray bg-white px-5 pt-4 pb-[max(16px,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <p className="min-w-0 truncate text-[13px] text-gray">
              {draftSong ? (
                <>
                  Selected:{" "}
                  <span className="font-semibold text-violet">
                    {draftSong.name}
                  </span>
                </>
              ) : draft !== "" ? (
                "Selected: current song"
              ) : (
                "No song selected"
              )}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={closeDrawer}
                className="inline-flex h-[44px] flex-1 items-center justify-center rounded-[10px] border border-light-gray px-5 text-[14px] font-semibold text-subtle-black transition-colors duration-200 hover:bg-gray-6 cursor-pointer sm:flex-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDrawer}
                className="inline-flex h-[44px] flex-1 items-center justify-center rounded-[10px] bg-violet px-6 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-violet-3 cursor-pointer sm:flex-none"
              >
                Done
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
