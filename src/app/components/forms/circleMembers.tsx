"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { Check, Search } from "lucide-react";
import { toast } from "sonner";
import { SheetTitle } from "@/components/ui/sheet";
import VioletButton from "../buttons/VioletButton";
import { Group } from "@/types/group";
import { addGroupMembers } from "@/lib/api/group";
import {
  FollowUser,
  fetchReferrer,
  fetchUserFollowers,
} from "@/lib/api/profile";
import { getCurrentUserId } from "@/lib/api/auth";

interface CircleMembersProps {
  group: Group;
  /** Called when the user is finished: after saving, or right away when
   * nobody was picked (a circle may have no members). */
  onDone: () => void;
  onCancel: () => void;
}

const avatarSrc = (picture?: string | null) =>
  picture
    ? picture.startsWith("http")
      ? picture
      : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${picture}`
    : "/default-avatar.png";

const matches = (user: FollowUser, query: string) =>
  user.username.toLowerCase().includes(query) ||
  (user.profileName ?? "").toLowerCase().includes(query);

function PersonRow({
  user,
  selected,
  onToggle,
  note,
}: {
  user: FollowUser;
  selected: boolean;
  onToggle: (id: number) => void;
  /** Extra context after the @username, e.g. why they're suggested. */
  note?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const displayName = user.profileName?.trim() || user.username;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={() => onToggle(user.id)}
      className="flex items-center gap-3 w-full p-2 rounded-[8px] text-left cursor-pointer transition-colors hover:bg-gray-6"
    >
      <span className="relative w-[36px] h-[36px] rounded-full overflow-hidden bg-light-gray/40 shrink-0">
        <Image
          src={imgError ? "/default-avatar.png" : avatarSrc(user.profilePicture)}
          alt={displayName}
          fill
          sizes="36px"
          className="object-cover"
          onError={() => setImgError(true)}
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[15px] font-medium text-subtle-black leading-tight">
          {displayName}
        </span>
        <span className="truncate text-[13px] text-gray mt-0.5">
          @{user.username}
          {note && <span className="text-violet"> · {note}</span>}
        </span>
      </span>
      <span
        className={`w-[22px] h-[22px] rounded-full border-2 border-violet flex items-center justify-center shrink-0 transition-colors ${
          selected ? "bg-violet" : "bg-white"
        }`}
      >
        {selected && <Check size={13} strokeWidth={3} className="text-white" />}
      </span>
    </button>
  );
}

function SectionHeader({
  label,
  action,
  onAction,
}: {
  label: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-2">
      <p className="text-[14px] text-gray">{label}</p>
      <button
        type="button"
        onClick={onAction}
        className="text-[14px] font-medium text-violet cursor-pointer hover:underline"
      >
        {action}
      </button>
    </div>
  );
}

const REFERRER_NOTE = "Shared a prompt with you";

/**
 * Second step of "Create New Circle" (mirrors the mobile app): pick which of
 * your followers join the new circle. Picking nobody is fine — the circle is
 * already created. Whoever shared the prompt you signed up from is listed
 * first too, even before they follow you (the backend allows adding them).
 */
export default function CircleMembers({
  group,
  onDone,
  onCancel,
}: CircleMembersProps) {
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [referrer, setReferrer] = useState<FollowUser | null>(null);
  const [loadingFollowers, setLoadingFollowers] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId === null) {
      setLoadingFollowers(false);
      return;
    }
    let active = true;
    // The referrer lookup is a bonus: if it fails the list is just followers.
    Promise.allSettled([fetchUserFollowers(userId), fetchReferrer()]).then(
      ([followersResult, referrerResult]) => {
        if (!active) return;
        if (followersResult.status === "fulfilled") {
          setFollowers(followersResult.value.filter((u) => u.id !== userId));
        } else {
          setLoadError(true);
        }
        if (
          referrerResult.status === "fulfilled" &&
          referrerResult.value &&
          referrerResult.value.id !== userId
        ) {
          setReferrer(referrerResult.value);
        }
        setLoadingFollowers(false);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  // The referrer first (once, even if they already follow you), then followers.
  const people = useMemo(
    () =>
      referrer
        ? [referrer, ...followers.filter((u) => u.id !== referrer.id)]
        : followers,
    [followers, referrer],
  );

  const q = query.trim().toLowerCase();
  const { selected, suggested } = useMemo(() => {
    const visible = q ? people.filter((u) => matches(u, q)) : people;
    return {
      selected: visible.filter((u) => selectedIds.includes(u.id)),
      suggested: visible.filter((u) => !selectedIds.includes(u.id)),
    };
  }, [people, selectedIds, q]);

  const noteFor = (user: FollowUser) =>
    user.id === referrer?.id ? REFERRER_NOTE : undefined;

  const toggle = (id: number) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );

  const selectAll = () =>
    setSelectedIds((prev) => [
      ...prev,
      ...suggested.map((u) => u.id).filter((id) => !prev.includes(id)),
    ]);

  const handleDone = async () => {
    if (selectedIds.length === 0) {
      onDone();
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await addGroupMembers(group.id, selectedIds);
      toast.success(
        `${selectedIds.length} ${selectedIds.length === 1 ? "person" : "people"} added to ${group.name}`,
      );
      onDone();
    } catch (err: unknown) {
      setError(
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Could not add people to the circle. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const count = selectedIds.length;
  const circleLabel = group.emoji ? `${group.emoji} ${group.name}` : group.name;

  return (
    <>
      <div className="flex flex-col justify-start items-start flex-1 min-h-0">
        <p className="text-[14px] font-medium text-gray truncate max-w-full">
          {circleLabel}
        </p>
        <SheetTitle className="text-[22px] font-normal text-subtle-black mt-[10px]">
          Choose who is part of your circle{" "}
          <br className="hidden sm:inline" />
          and share exclusive content with them
        </SheetTitle>

        <div className="relative w-full mt-[32px] shrink-0">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray pointer-events-none"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
            placeholder="Search"
            aria-label="Search followers"
            className="h-[48px] w-full rounded-full border border-gray-9 pl-11 pr-4 text-[16px] text-subtle-black placeholder-gray-7 outline-none transition-colors focus:border-violet focus:ring-2 focus:ring-light-violet"
          />
        </div>

        <div className="flex flex-col gap-5 mt-6 w-full flex-1 min-h-0 overflow-y-auto overscroll-y-contain -mx-1 px-1 pb-6">
          {loadingFollowers ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="w-[36px] h-[36px] rounded-full bg-light-gray/60 animate-pulse" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="h-3 w-32 rounded bg-light-gray/60 animate-pulse" />
                    <div className="h-3 w-20 rounded bg-light-gray/60 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : loadError && people.length === 0 ? (
            <p className="text-[14px] text-gray px-2">
              Could not load your followers. You can still finish and add
              people later.
            </p>
          ) : people.length === 0 ? (
            <p className="text-[14px] text-gray px-2">
              No followers yet. Only people who follow you can be added to a
              circle — you can finish now and add them later.
            </p>
          ) : (
            <>
              <section className="flex flex-col gap-1">
                <SectionHeader
                  label={`${count} ${count > 1 ? "Persons" : "Person"}`}
                  action="Clear all"
                  onAction={() => setSelectedIds([])}
                />
                {selected.map((user) => (
                  <PersonRow
                    key={user.id}
                    user={user}
                    selected
                    onToggle={toggle}
                    note={noteFor(user)}
                  />
                ))}
              </section>
              <section className="flex flex-col gap-1">
                <SectionHeader
                  label="Suggested"
                  action="Select all"
                  onAction={selectAll}
                />
                {suggested.map((user) => (
                  <PersonRow
                    key={user.id}
                    user={user}
                    selected={false}
                    onToggle={toggle}
                    note={noteFor(user)}
                  />
                ))}
                {q && selected.length === 0 && suggested.length === 0 && (
                  <p className="text-[14px] text-gray px-2 py-2">
                    No followers match &ldquo;{query.trim()}&rdquo;.
                  </p>
                )}
                {loadError && (
                  <p className="text-[14px] text-gray px-2 py-2">
                    Could not load your followers. You can still finish and
                    add them later.
                  </p>
                )}
              </section>
            </>
          )}
          {error && <p className="text-red-400 w-full text-left">{error}</p>}
        </div>
      </div>
      <div className="flex flex-row justify-end items-center gap-6">
        <p
          className="text-violet text-[14px] font-medium cursor-pointer"
          onClick={onCancel}
        >
          cancel
        </p>
        <VioletButton
          text="Done"
          className="w-[87px]"
          loading={saving}
          type="button"
          onClick={handleDone}
        />
      </div>
    </>
  );
}
