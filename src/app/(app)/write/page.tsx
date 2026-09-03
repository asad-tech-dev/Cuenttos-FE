"use client";
import checkAuth from "@/HOC/checkAuth";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, PenLine, Trash2, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getCurrentUserId } from "@/lib/api/auth";
import {
  listLocalDrafts,
  deleteLocalDraft,
  LocalDraft,
} from "@/lib/localDrafts";

function WritePage() {
  const [username, setUsername] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<LocalDraft[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const parsedToken = JSON.parse(atob(token.split(".")[1]));
          setUsername(parsedToken.userName || "User");
        } catch (error) {
          console.error("Error decoding token:", error);
          setUsername("User");
        }
      } else {
        setUsername("User");
      }
    }
    const userId = getCurrentUserId();
    if (userId != null) setDrafts(listLocalDrafts(userId));
  }, []);

  const handleDeleteDraft = (
    event: React.MouseEvent,
    draftId: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const userId = getCurrentUserId();
    if (userId == null) return;
    deleteLocalDraft(userId, draftId);
    setDrafts((prev) => prev.filter((draft) => draft.id !== draftId));
  };

  return (
    <div className="flex flex-col gap-[20px] px-4 sm:px-6 md:px-[60px] lg:px-[110px] py-8 md:py-[60px]">
      <h2 className="text-dark-violet text-[26px] sm:text-[32px] font-normal">
        Hi {username},
      </h2>
      <p className="text-[16px] text-gray font-normal leading-[24px]">
        Love to see you again! Building a writing habit is great for a
        peaceful mind.
      </p>

      <div className="flex mt-[20px] flex-col gap-[20px]">
        <h2 className="text-dark-gray text-[12px] leading-[22px] font-bold">
          WHAT ARE YOU WRITING TODAY?
        </h2>

        <Link href="/mindfulness">
          <div className="relative w-full max-w-[720px] overflow-hidden rounded-[28px] bg-violet px-6 py-8 sm:px-8 sm:py-10 cursor-pointer">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-16 h-[220px] w-[220px] rounded-full bg-violet-3/40"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 bottom-[-60px] h-[180px] w-[180px] rounded-full bg-violet-2/25"
            />

            <div className="relative z-10 flex flex-col gap-5">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold text-white">
                <Sparkles size={13} />
                New
              </span>
              <p className="text-white text-[22px] sm:text-[26px] font-semibold leading-[28px]">
                Write a new Cuentto
              </p>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[14px] font-semibold text-violet">
                <PenLine size={16} />
                Start writing
              </span>
            </div>
          </div>
        </Link>
      </div>

      <div className="flex mt-[20px] flex-col gap-[20px]">
        <h2 className="text-dark-gray text-[12px] leading-[22px] font-bold">
          DRAFTS
        </h2>

        {drafts.length === 0 ? (
          <div className="w-full max-w-[720px] rounded-[16px] bg-gray-6 px-6 py-8 text-center">
            <p className="text-gray text-[14px]">You have no Drafts</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full max-w-[720px]">
            {drafts.map((draft) => (
              <Link
                key={draft.id}
                href={`/cuentto/create?draftId=${draft.id}`}
              >
                <div className="flex flex-row items-center gap-4 rounded-[16px] border border-light-gray bg-white px-4 py-3 cursor-pointer">
                  <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[12px] bg-violet">
                    <PenLine size={20} className="text-white" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-[15px] font-semibold text-subtle-black">
                      {draft.title?.trim() || "Untitled Draft"}
                    </p>
                    <p className="text-[13px] text-gray">
                      Draft ·{" "}
                      {formatDistanceToNow(new Date(draft.updatedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Delete draft"
                    onClick={(event) => handleDeleteDraft(event, draft.id)}
                    className="shrink-0 cursor-pointer text-dark-red"
                  >
                    <Trash2 size={18} />
                  </button>
                  <ChevronRight size={18} className="shrink-0 text-gray-7" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default checkAuth(WritePage);
