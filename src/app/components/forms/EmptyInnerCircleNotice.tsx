"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Info, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Group } from "@/types/group";
import { addGroupMembers, fetchGroupMemberIds } from "@/lib/api/group";
import { FollowUser, fetchReferrer } from "@/lib/api/profile";
import { getCurrentUserId } from "@/lib/api/auth";

interface EmptyInnerCircleNoticeProps {
  /** The user's default circle (Inner Circle). */
  circle: Group;
  /** Whether that circle is currently picked in the share options. */
  selected: boolean;
}

type Load =
  | { status: "loading" }
  | { status: "failed" }
  | { status: "ready"; memberIds: number[]; referrer: FollowUser | null };

/**
 * Shown under the share options while the Inner Circle is picked but has
 * nobody in it, so a new user doesn't share to an empty circle without
 * realising no one will read it. When someone shared a prompt that brought
 * them here, offers to add that person in one tap (the backend lets a user
 * add whoever referred them, even before they follow each other).
 * Renders nothing until it knows the circle is empty — and nothing if that
 * can't be checked, so it never warns by mistake.
 */
export default function EmptyInnerCircleNotice({
  circle,
  selected,
}: EmptyInnerCircleNoticeProps) {
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoad({ status: "loading" });
    const userId = getCurrentUserId();
    // The referrer is a bonus: without it the notice still explains.
    Promise.allSettled([fetchGroupMemberIds(circle.id), fetchReferrer()]).then(
      ([membersResult, referrerResult]) => {
        if (!active) return;
        if (membersResult.status !== "fulfilled") {
          setLoad({ status: "failed" });
          return;
        }
        const referrer =
          referrerResult.status === "fulfilled" &&
          referrerResult.value &&
          referrerResult.value.id !== userId
            ? referrerResult.value
            : null;
        setLoad({ status: "ready", memberIds: membersResult.value, referrer });
      },
    );
    return () => {
      active = false;
    };
  }, [circle.id]);

  if (!selected || load.status !== "ready" || load.memberIds.length > 0) {
    return null;
  }

  const { memberIds, referrer } = load;
  const referrerName = referrer
    ? referrer.profileName?.trim() || referrer.username
    : null;

  const handleAddReferrer = async () => {
    if (!referrer || !referrerName) return;
    try {
      setAdding(true);
      setAddError(null);
      // The call sets the full member list, so keep everyone already in it.
      await addGroupMembers(circle.id, [...memberIds, referrer.id]);
      // The backend skips people it won't allow without failing, so check
      // they actually joined before saying so.
      const updated = await fetchGroupMemberIds(circle.id);
      if (!updated.includes(referrer.id)) {
        setAddError(`Could not add ${referrerName}. Please try again.`);
        return;
      }
      toast.success(`${referrerName} added to ${circle.name}`);
      setLoad({ status: "ready", memberIds: updated, referrer });
    } catch (err: unknown) {
      setAddError(
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : `Could not add ${referrerName}. Please try again.`,
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      role="status"
      className="w-full shrink-0 mt-3 flex items-start gap-2 rounded-[8px] bg-light-violet/40 px-3 py-3 text-[14px] leading-[20px] text-subtle-black"
    >
      <Info size={16} aria-hidden className="shrink-0 mt-[2px] text-violet" />
      <div className="flex flex-col gap-2 min-w-0">
        <p>
          Your {circle.name} is empty, so no one will see this Cuentto yet.{" "}
          {referrerName
            ? `${referrerName} shared a prompt with you — add them so they can read it.`
            : "Select Public as well if you'd like others to read it."}
        </p>
        {referrer && referrerName && (
          <button
            type="button"
            onClick={handleAddReferrer}
            disabled={adding}
            className="inline-flex items-center gap-1.5 w-fit text-violet font-medium cursor-pointer hover:underline disabled:opacity-60 disabled:cursor-default disabled:no-underline"
          >
            <UserPlus size={16} aria-hidden className="shrink-0" />
            <span className="truncate">
              {adding
                ? "Adding…"
                : `Add ${referrerName} to your ${circle.name}`}
            </span>
          </button>
        )}
        {addError && <p className="text-red-400">{addError}</p>}
      </div>
    </div>
  );
}
