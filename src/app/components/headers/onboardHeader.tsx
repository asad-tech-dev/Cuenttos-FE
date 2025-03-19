import Image from "next/image";
import Link from "next/link";

export default function OnboardHeader({ showButtons = true }: { showButtons?: boolean }) {
  return (
    <div className="flex h-[55px] px-10 items-center backdrop-blur-sm justify-between bg-[#09090999]">
      <div>
        <Link href="/">
          <Image
            src="/logo-white.png"
            alt="Logo"
            width={117}
            height={21}
            className="object-cover cursor-pointer"
          />
        </Link>
      </div>

      {showButtons && (
        <div className="flex flex-row gap-4 items-center justify-end">
          <Link href="/login">
            <button className="w-[68px] h-[40px] text-white text-[14px] font-medium cursor-pointer">
              Sign in
            </button>
          </Link>
          <Link href="/register">
            <button className="w-[103px] h-[40px] text-violet border border-violet rounded-[8px] cursor-pointer text-[14px] font-medium justify-center items-center">
              Register
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
