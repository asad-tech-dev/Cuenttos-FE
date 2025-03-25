"use client";
import checkAuth from "@/HOC/checkAuth";
import { useEffect, useState } from "react";
import { PlusIcon } from "@/app/components/icons";
import Link from "next/link";
import CustomToast from "@/app/components/toasts/comingSoon";
import Image from "next/image";
function WritePage() {
  const [username, setUsername] = useState<string | null>(null);

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
  }, []);
  return (
    <div className="flex flex-row  gap-[30px] py-[60px] px-[110px]">
      <div className="flex flex-col gap-[20px] w-[600px]">
        {" "}
        <h2 className="text-subtle-black text-[32px] font-normal">
          {" "}
          Hi {username},
        </h2>
        <p className="text-[16px] text-gray font-normal leading-[24px]">
          Love to see you again! Building a writing habit is <br></br> great for
          a peaceful mind.
        </p>
        <div className="flex mt-[50px] flex-col gap-[20px]">
          <h2 className="text-dark-gray text-[12px] leading-[22px] font-medium">
            WHAT ARE YOU WRITING TODAY?
          </h2>
          <div className="flex flex-row gap-[30px] w-[600px] h-[348px]">
            <Link href="/cuentto/create">
              <div className="relative w-[288px] h-[347px] flex flex-col justify-between px-[40px] py-[40px] bg-white rounded-tl-[10px] rounded-bl-[10px] rounded-tr-[40px] rounded-br-[40px] cursor-pointer bg-gradient-to-br from-[#FBEAE7] via-[#D8EDF6] to-[#FFD6C9]">
                <Image
                  src="/gradient.png"
                  alt="Gradient background"
                  fill
                  className="absolute inset-0 object-cover rounded-tl-[10px] rounded-bl-[10px] rounded-tr-[40px] rounded-br-[40px]"
                  priority
                  quality={100}
                />
                <span className="relative z-10font-normal text-subtle-black  text-[22px] leading-[28px]">
                  Write a new <br></br>Cuentto
                </span>
                <div className="flex z-1000 flex-row justify-end w-full">
                  <PlusIcon
                    width={21}
                    height={21}
                    className="text-subtle-black"
                  />
                </div>
              </div>
            </Link>
            <div
              className="w-[288px] h-[347px] cursor-pointer flex flex-col bg-light-beige justify-between px-[40px] py-[40px] border-l-[5px] border-golden-brown rounded-tr-[10px] rounded-br-[10px]"
              onClick={() =>
                CustomToast({
                  title: "Coming Soon.",
                })
              }
            >
              <span className="font-normal text-subtle-black  text-[22px] leading-[28px]">
                Write a new <br></br>Thought
              </span>
              <div className="flex flex-row justify-end w-full">
                <PlusIcon
                  width={21}
                  height={21}
                  className="text-subtle-black"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div></div>
    </div>
  );
}
export default checkAuth(WritePage);
