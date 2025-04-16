"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import VioletButton from "@/app/components/buttons/VioletButton";
import { z } from "zod";
import { BackIcon } from "@/app/components/icons";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Eye, EyeOff } from "lucide-react";
import CustomToast from "@/app/components/toasts/toast";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;
function ProfileePage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: "onChange" });
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile/delete`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      CustomToast({ title: "Account deleted successfully." });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Account deletion failed. Please try again."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-[30px] w-full py-[60px] px-[110px]">
      <div className="flex flex-row justify-between">
        <BackIcon
          width={10}
          height={18}
          className="cursor-pointer text-subtle-black"
          onClick={() => router.back()}
        />
      </div>
      <div className="flex flex-row mt-[40px]">
        <div className="flex flex-col gap-[60px] w-[408px]">
          <p className="text-[22px] font-normal text-subtle-black">Account</p>
          <div className="flex flex-row justify-between items-center">
            <p className="text-[18px] font-normal text-subtle-black">
              Delete Account
            </p>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <p className="text-[14px] font-medium text-dark-red cursor-pointer">
                  Delete
                </p>
              </SheetTrigger>
              <SheetContent className="bg-white flex flex-col justify-between border-none !max-w-none !w-[488px] border-l px-[50px] py-[60px] border-light-gray">
                <div className="flex flex-col justify-start items-start">
                  <p className="text-[14px] font-medium text-gray">
                    Delete Account
                  </p>
                  <p className="text-[22px] font-normal text-subtle-black mt-[10px] w-[340px]">
                    Are you sure you want to delete your account?
                  </p>
                  <p className="text-[16px] font-normal text-gray mt-[40px]">
                    Your profile, cuenttos, comments and followers<br></br> will be
                    permanently deleted.
                  </p>
                </div>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col w-full gap-4 -mt-[300px]"
                >
                  <input
                    {...register("email")}
                    placeholder="Email"
                    autoComplete="off"
                    className="border border-light-gray border-[1px] text-subtle-black text-[16px] bg-none outline-none w-[360px] h-[56px] rounded-[8px] w-full px-4 placeholder-subtle-black"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-left w-full">
                      {errors.email.message}
                    </p>
                  )}
                  <div className="relative w-full">
                    <input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      autoComplete="off"
                      className="border border-light-gray border-[1px] text-subtle-black bg-none outline-none text-[16px]  w-[360px] h-[56px] rounded-[8px] w-full px-4 placeholder-subtle-black"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff size={20} className="text-subtle-black" />
                      ) : (
                        <Eye size={20} className="text-subtle-black" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-left w-full">
                      {errors.password.message}
                    </p>
                  )}
                  {error && (
                    <p className="text-red-400 w-full text-left">{error}</p>
                  )}
                  <div className="flex flex-row gap-4 mt-[16px]  justify-start">
                    <VioletButton
                      text="Delete my account"
                      className="w-[176px] text-[14px]"
                      loading={loading}
                      type="submit"
                    />
                  </div>
                </form>
                <div></div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileePage;
