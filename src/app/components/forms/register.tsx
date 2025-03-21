"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { GoogleIcon } from "../icons";
import { Eye, EyeOff, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Checkbox } from "@radix-ui/react-checkbox";
import Spinner from "../ui/Spinner";
import CustomToast from "@/app/components/toasts/comingSoon";

const schema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot be longer than 30 characters")
    .regex(/^\S+$/, "Username cannot contain spaces"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type FormData = z.infer<typeof schema>;

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
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
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      router.push("/interest");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Signup failed. Please try again."
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
        {...register("username")}
        placeholder="Username"
        className="border border-white border-[1px] text-[16px] text-white bg-none outline-none w-[360px] h-[56px] rounded-[8px] px-4 placeholder-white"
      />
      {errors.username && (
        <p className="text-red-400 text-left w-full">
          {errors.username.message}
        </p>
      )}

      <input
        {...register("email")}
        placeholder="Email"
        className="border border-white border-[1px] text-[16px] text-white bg-none outline-none w-[360px] h-[56px] rounded-[8px] px-4 placeholder-white"
      />
      {errors.email && (
        <p className="text-red-400 text-left w-full">{errors.email.message}</p>
      )}

      <div className="relative w-[360px]">
        <input
          {...register("password")}
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="border border-white border-[1px] text-[16px] text-white bg-none outline-none w-[360px] h-[56px] rounded-[8px] px-4 placeholder-white"
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

      <div className="flex items-start mt-[12px] space-x-4">
        <Checkbox
          id="terms"
          className="peer w-[20px] h-[20px] flex justify-center items-center border-[1px] border-white rounded-[4px] text-transparent cursor-pointer
             data-[state=checked]:bg-white data-[state=checked]:text-[20px] data-[state=checked]:text-violet"
          checked={watch("terms") || false}
          onCheckedChange={(checked) => setValue("terms", checked === true)}
        >
          <Check />
        </Checkbox>
        <label htmlFor="terms" className="text-white text-[14px]">
          I agree to the{" "}
          <span className="text-violet cursor-pointer">Terms & Conditions</span>{" "}
          and <br />
          <span className="text-violet cursor-pointer">Privacy Policy</span>
        </label>
      </div>
      {errors.terms && (
        <p className="text-red-400 text-left">{errors.terms.message}</p>
      )}
      {error && <p className="text-red-400 w-full text-left">{error}</p>}
      <div className="flex flex-row gap-4 mt-[16px] justify-start">
        <button
          disabled={loading}
          type="submit"
          className="w-[154px] h-[40px] text-white bg-violet text-[14px] rounded-[8px] font-medium cursor-pointer"
        >
          {loading ? (
            <Spinner
              size="w-6 h-6"
              color="border-white"
              borderSize="border-3"
            />
          ) : (
            "Create Account"
          )}
        </button>

        <button
          className="w-[211px] h-[40px] text-black bg-white cursor-pointer text-[14px] rounded-[8px] font-medium flex gap-4 justify-center items-center"
          type="button"
          onClick={() =>
            CustomToast({
              title: "Coming Soon.",
            })
          }
        >
          <GoogleIcon width={20} height={20} className="text-black" />
          Continue with Google
        </button>
      </div>

      <p className="text-white mt-[16px] text-[14px] font-normal w-full text-left">
        Already have an account?{" "}
        <Link href="/login">
          <span className="text-violet cursor-pointer"> Sign In here </span>
        </Link>
      </p>
    </form>
  );
}
