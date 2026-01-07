"use client";
import axios from "axios";
import VioletButton from "@/app/components/buttons/VioletButton";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword } from "@/lib/api/auth";

import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  resetPasswordSchema,
  ResetPasswordFormData,
} from "@/lib/formSchemas/auth";

import { useState, Suspense, useEffect } from "react";

function ResetPasswordContent() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const otp = searchParams.get("otp");

  useEffect(() => {
    if (!email || !otp) {
      router.push("/forgot-password");
    }
  }, [email, otp, router]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!email || !otp) {
      setError("Missing information. Please start over.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await resetPassword({
        email,
        otp,
        password: data.password,
      });
      router.push("/login");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Failed to reset password. Please try again."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-[20px] w-[360px] h-fit min-h-[480px]">
      <h1 className="text-[45px] text-white font-normal leading-[52px]">
        Reset Password
      </h1>
      <p className="text-[16px] text-white font-normal leading-[24px]">
        Choose a strong password for your account.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col w-full gap-4 mt-[16px]"
      >
        <div className="relative w-full">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            className="border border-white text-white text-[16px] bg-none outline-none w-full h-[56px] rounded-[8px] px-4 placeholder-white"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white cursor-pointer"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-400 text-left w-full">
            {errors.password.message}
          </p>
        )}

        <div className="relative w-full">
          <input
            {...register("confirmPassword")}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            className="border border-white text-white text-[16px] bg-none outline-none w-full h-[56px] rounded-[8px] px-4 placeholder-white"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white cursor-pointer"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-400 text-left w-full">
            {errors.confirmPassword.message}
          </p>
        )}

        {error && <p className="text-red-400 w-full text-left">{error}</p>}

        <div className="flex flex-row gap-4 mt-[16px] justify-start">
          <VioletButton
            text="Reset Password"
            className="w-[140px] text-[14px]"
            loading={loading}
            type="submit"
          />
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
