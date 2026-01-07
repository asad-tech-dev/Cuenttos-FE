"use client";
import axios from "axios";
import VioletButton from "@/app/components/buttons/VioletButton";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPassword } from "@/lib/api/auth";

import {
  ForgotPasswordFormData,
  forgotPasswordSchema,
} from "@/lib/formSchemas/auth";

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setError(null);
    try {
      await forgotPassword(data);
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Failed to send OTP. Please try again."
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
        Forgot Password
      </h1>
      <p className="text-[16px] text-white font-normal leading-[24px]">
        Enter your email address and we'll send you an OTP to reset your
        password.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col w-full gap-4 mt-[16px]"
      >
        <input
          {...register("email")}
          placeholder="Email"
          className="border border-white text-white text-[16px] bg-none outline-none w-full h-[56px] rounded-[8px] px-4 placeholder-white"
        />
        {errors.email && (
          <p className="text-red-400 text-left w-full">
            {errors.email.message}
          </p>
        )}
        {error && <p className="text-red-400 w-full text-left">{error}</p>}

        <div className="flex flex-row gap-4 mt-[16px] justify-start">
          <VioletButton
            text="Submit"
            className="w-[92px] text-[14px]"
            loading={loading}
            type="submit"
          />
        </div>
      </form>
    </div>
  );
}
