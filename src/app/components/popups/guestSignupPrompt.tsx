import Link from "next/link";
import { Sparkles } from "lucide-react";
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface GuestSignupPromptProps {
  /** Where to land after signing up or in: the share step of this Cuentto. */
  redirectTarget: string;
  onKeepWriting: () => void;
}

/**
 * Shown when a guest writing from a shared prompt taps Share. Replaces the old
 * straight redirect to Sign In, which felt like being kicked out: a short,
 * positive "what Cuentto is" and an invitation to create an account. What
 * they wrote is already saved for the round trip before this opens.
 */
function GuestSignupPrompt({
  redirectTarget,
  onKeepWriting,
}: GuestSignupPromptProps) {
  const redirect = encodeURIComponent(redirectTarget);

  return (
    <DialogContent className="bg-white z-100 border-none w-[calc(100vw-2rem)] max-w-[440px] p-6 sm:p-[30px] rounded-[16px]">
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-light-violet">
          <Sparkles className="text-violet w-7 h-7" />
        </div>
        <div className="flex flex-col gap-3">
          <DialogTitle className="text-[22px] text-subtle-black font-normal leading-[28px]">
            Beautiful words ✨
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-col gap-3 text-[15px] leading-[23px] text-gray">
              <p>
                Cuentto is a space to write freely, feel comfortable with your
                own words, and share them with the people closest to you.
              </p>
              <p className="font-medium text-subtle-black">
                If you want to save or share this, please create an account.
              </p>
            </div>
          </DialogDescription>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        <Link
          href={`/register?redirect=${redirect}&onboarding=1`}
          className="flex items-center justify-center h-[44px] rounded-[8px] bg-violet text-white text-[14px] font-medium cursor-pointer"
        >
          Create account
        </Link>
        <Link
          href={`/login?redirect=${redirect}`}
          className="flex items-center justify-center h-[44px] rounded-[8px] border border-violet text-violet text-[14px] font-medium cursor-pointer"
        >
          I already have an account
        </Link>
        <button
          type="button"
          onClick={onKeepWriting}
          className="h-[36px] text-[14px] font-medium text-gray cursor-pointer hover:text-subtle-black transition-colors"
        >
          Keep writing
        </button>
      </div>
    </DialogContent>
  );
}
export default GuestSignupPrompt;
