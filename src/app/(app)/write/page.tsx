"use client";
import checkAuth from "@/HOC/checkAuth";
import { useEffect, useState } from "react";
import { PlusIcon } from "@/app/components/icons";
import { Pencil } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { dmSans } from "@/lib/fonts";
import { getCurrentUserId } from "@/lib/api/auth";
import { listLocalDrafts, LocalDraft } from "@/lib/localDrafts";

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
    if (userId != null) {
      setDrafts(listLocalDrafts(userId));
    }
  }, []);

  return (
    <div
      className={`${dmSans.className} flex flex-col gap-[20px] px-4 sm:px-6 md:px-[60px] lg:px-[110px] py-8 md:py-[60px]`}
    >
      <h2 className="text-dark-violet text-[26px] sm:text-[32px] font-normal">
        Hi {username},
      </h2>
      <p className="text-[16px] text-gray font-normal leading-[24px]">
        Love to see you again! Building a writing habit is great for a
        peaceful mind.
      </p>

      <div className="flex mt-[30px] md:mt-[50px] flex-col gap-[20px]">
        <h2 className="text-dark-gray text-[12px] leading-[22px] font-bold">
          WHAT ARE YOU WRITING TODAY?
        </h2>
        <div className="flex flex-row gap-[30px]">
          <Link href="/cuentto/create">
            <div className="relative w-[220px] h-[260px] sm:w-[260px] sm:h-[300px] lg:w-[288px] lg:h-[347px] flex flex-col justify-between px-6 py-6 sm:px-[40px] sm:py-[40px] bg-white rounded-tl-[12px] rounded-bl-[12px] rounded-tr-[50px] rounded-br-[50px] cursor-pointer">
              <Image
                src="/gradient.png"
                alt="Gradient background"
                fill
                className="absolute inset-0 object-cover rounded-tl-[12px] rounded-bl-[12px] rounded-tr-[50px] rounded-br-[50px]"
                priority
                quality={100}
              />
              <span className="relative z-10 font-normal text-subtle-black text-[20px] sm:text-[22px] leading-[28px]">
                Write a new <br></br>Cuentto
              </span>
              <div className="flex z-10 flex-row justify-end w-full">
                <PlusIcon
                  width={21}
                  height={21}
                  className="text-subtle-black"
                />
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="flex mt-[30px] md:mt-[50px] flex-col gap-[20px]">
        <h2 className="text-dark-gray text-[12px] leading-[22px] font-bold">
          DRAFTS
        </h2>
        {drafts.length === 0 ? (
          <p className="text-gray text-[14px]">You have no Drafts</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {drafts.map((draft) => (
              <Link key={draft.id} href={`/cuentto/create?draftId=${draft.id}`}>
                <div className="flex flex-row bg-gray-6 rounded-tr-[12px] rounded-br-[12px] h-[120px] cursor-pointer overflow-hidden">
                  <div className="w-[6px] bg-gray-7 shrink-0" />
                  <div className="flex flex-col justify-between p-4 min-w-0 flex-1">
                    <p className="text-black text-[14px] line-clamp-4 break-words">
                      {draft.title?.trim() || "Untitled Draft"}
                    </p>
                    <div className="flex flex-row justify-end">
                      <Pencil size={18} className="text-black" />
                    </div>
                  </div>
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
