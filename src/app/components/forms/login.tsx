"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { z } from "zod";
import { GoogleIcon } from "../icons";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CustomToast from "@/app/components/toasts/comingSoon";
import VioletButton from "../buttons/VioletButton";
import GoogleButton from "../buttons/GoogleButton";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: "onChange" });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const token = response.data.token;
      if (token) {
        localStorage.setItem("authToken", token);
      }
      router.push("/library");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Login failed. Please try again."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col w-full gap-4"
    >
      <input
        {...register("email")}
        placeholder="Email"
        className="border border-white border-[1px] text-white text-[16px] bg-none outline-none w-[360px] h-[56px] rounded-[8px] w-full px-4 placeholder-white"
      />
      {errors.email && (
        <p className="text-red-400 text-left w-full">{errors.email.message}</p>
      )}

      <div className="relative w-full">
        <input
          {...register("password")}
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="border border-white border-[1px] text-white bg-none outline-none text-[16px]  w-[360px] h-[56px] rounded-[8px] w-full px-4 placeholder-white"
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
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
      {error && <p className="text-red-400 w-full text-left">{error}</p>}
      <p className="text-violet mt-[10px] text-[14px] font-medium w-full text-right cursor-pointer">
        Forgot Your Password?
      </p>
      <div className="flex flex-row gap-4 mt-[16px]  justify-start">
        <VioletButton
          text="Sign In"
          className="w-[92px] text-[14px]"
          loading={loading}
          type="submit"
        />

        <GoogleButton
          text="Continue with Google"
          type="button"
          className=""
          icon={<GoogleIcon width={20} height={20} className="text-black" />}
          onClick={() => CustomToast({ title: "Coming Soon." })}
        />
      </div>
      <p className="text-white mt-[16px] text-[14px] font-normal w-full text-left">
        Don’t have an account?{" "}
        <Link href="/register">
          <span className="text-violet cursor-pointer">Register here </span>
        </Link>
      </p>
    </form>
  );
}
