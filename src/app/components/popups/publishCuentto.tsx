import { DialogContent, DialogClose } from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";

function PublishCuentto() {
  return (
    <DialogContent className="bg-white z-100 border-none w-[408px] h-[340px] p-[30px] rounded-[16px]">
      <div className="flex flex-col justify-center items-center gap-[20px]">
        <Image
          src="/green-check.png"
          alt="Google Icon"
          width={84}
          height={84}
        />
        <p className="text-[22px] text-subtle-black text-center font-normal leading-[28px]">
          Your Cuentto has been <br></br>succesfully published.
        </p>
      </div>

      <div className="flex flex-row items-center justify-end mt-[0px]">
        <Link href="/library">
          <button className="w-[97px] h-[40px] text-white bg-violet text-[14px] rounded-[8px] font-medium cursor-pointer">
            Accept
          </button>
        </Link>
      </div>
      <DialogClose asChild>Close</DialogClose>
    </DialogContent>
  );
}
export default PublishCuentto;
