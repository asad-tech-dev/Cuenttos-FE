import Image from "next/image";
import Link from "next/link";

interface PublishCuenttoProps {
  message?: React.ReactNode;
  redirectHref?: string;
}

// Rendered as the children of a ResponsiveSheetDialog (bottom sheet on
// mobile, centered dialog on desktop) — no dialog/sheet chrome of its own.
function PublishCuentto({
  message,
  redirectHref = "/share",
}: PublishCuenttoProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-center items-center gap-[20px]">
        <Image
          src="/green-check.png"
          alt="Google Icon"
          width={84}
          height={84}
        />
        <p className="text-[22px] text-subtle-black text-center font-normal leading-[28px]">
          {message ?? (
            <>
              Your Cuentto has been <br></br>succesfully published.
            </>
          )}
        </p>
      </div>

      <div className="flex flex-row items-center justify-end">
        <Link href={redirectHref}>
          <button className="w-[97px] h-[40px] text-white bg-violet text-[14px] rounded-[8px] font-medium cursor-pointer">
            Accept
          </button>
        </Link>
      </div>
    </div>
  );
}
export default PublishCuentto;
