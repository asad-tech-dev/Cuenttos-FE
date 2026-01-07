"use client";
import axios from "axios";
import VioletButton from "@/app/components/buttons/VioletButton";

import { verifyOTP } from "@/lib/api/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, Suspense } from "react";

function VerifyOTPContent() {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.push("/forgot-password");
    }
  }, [email, router]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const data = e.clipboardData.getData("text");
    if (data.length === 6 && !isNaN(Number(data))) {
      const newOtp = data.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter a 6-digit OTP.");
      return;
    }

    if (!email) {
      setError("Email is missing. Please start over.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await verifyOTP({ email, otp: otpString });
      router.push(
        `/reset-password?email=${encodeURIComponent(
          email
        )}&otp=${encodeURIComponent(otpString)}`
      );
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Invalid OTP. Please try again."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const maskEmail = (email: string) => {
    if (!email) return "";

    const [name, domain] = email.split("@");

    if (name.length <= 5) {
      return `${name.slice(0, 2)}...@${domain}`;
    }

    return `${name.slice(0, 5)}...@${domain}`;
  };

  return (
    <div className="flex flex-col gap-[20px] w-[360px] h-fit min-h-[480px]">
      <h1 className="text-[45px] text-white font-normal leading-[52px]">
        Verify OTP
      </h1>
      <p className="text-[16px] text-white font-normal leading-[24px]">
        We've sent a 6-digit code to{" "}
        <span className="text-violet font-medium">
          {maskEmail(email || "")}
        </span>
        . Please enter it below.
      </p>

      <form
        onSubmit={onSubmit}
        className="flex flex-col w-full gap-4 mt-[16px]"
      >
        <div className="flex justify-between gap-2">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className="w-[50px] h-[56px] border border-white text-white text-[20px] text-center bg-transparent outline-none rounded-[8px] focus:border-violet"
            />
          ))}
        </div>

        {error && <p className="text-red-400 w-full text-left">{error}</p>}

        <div className="flex flex-row gap-4 mt-[16px] justify-start">
          <VioletButton
            text="Verify OTP"
            className="w-[120px] text-[14px]"
            loading={loading}
            type="submit"
          />
        </div>
      </form>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense>
      <VerifyOTPContent />
    </Suspense>
  );
}
