"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import VioletButton from "@/app/components/buttons/VioletButton";
import { z } from "zod";
import { BackIcon } from "@/app/components/icons";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ChevronDown, Eye, EyeOff, Trash2, UserCog } from "lucide-react";
import CustomToast from "@/app/components/toasts/toast";
import CuenttoFeedCard from "@/app/components/ui/cuenttos/cuenttoFeedCard";
import { SkeletonCuenttoFeed } from "@/app/components/skeletons/CuenttoFeed";
import { Cuentto } from "@/types/cuentto";
import { fetchMyCuenttos } from "@/lib/api/cuentto";

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

  const [myCuenttos, setMyCuenttos] = useState<Cuentto[]>([]);
  const [cuenttosLoading, setCuenttosLoading] = useState(true);
  const [cuenttosError, setCuenttosError] = useState<string | null>(null);
  const [selectedMoodId, setSelectedMoodId] = useState<number | null>(null);

  const availableMoods = useMemo(() => {
    const seen = new Map<
      number,
      { id: number; title: string; color: string }
    >();
    for (const c of myCuenttos) {
      const m = c.mood;
      if (m?.id != null && !seen.has(m.id)) {
        seen.set(m.id, { id: m.id, title: m.title, color: m.color });
      }
    }
    return Array.from(seen.values());
  }, [myCuenttos]);

  const filteredCuenttos = useMemo(() => {
    if (selectedMoodId == null) return myCuenttos;
    return myCuenttos.filter((c) => c.mood?.id === selectedMoodId);
  }, [myCuenttos, selectedMoodId]);

  useEffect(() => {
    if (
      selectedMoodId != null &&
      !availableMoods.some((m) => m.id === selectedMoodId)
    ) {
      setSelectedMoodId(null);
    }
  }, [availableMoods, selectedMoodId]);

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const handlePointer = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountMenuOpen(false);
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [accountMenuOpen]);

  useEffect(() => {
    const loadMyCuenttos = async () => {
      try {
        setCuenttosLoading(true);
        setCuenttosError(null);
        const data = await fetchMyCuenttos();
        setMyCuenttos(data);
      } catch (err: unknown) {
        const message =
          axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : "Could not load your cuenttos. Please try again.";
        setCuenttosError(message);
      } finally {
        setCuenttosLoading(false);
      }
    };
    loadMyCuenttos();
  }, []);

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
      <div className="flex flex-row items-center justify-between">
        <BackIcon
          width={10}
          height={18}
          className="cursor-pointer text-subtle-black"
          onClick={() => router.back()}
        />

        <div className="relative" ref={accountMenuRef}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={accountMenuOpen}
            onClick={() => setAccountMenuOpen((open) => !open)}
            className="inline-flex h-[40px] cursor-pointer items-center gap-2 rounded-[10px] border border-light-gray bg-white px-4 text-[14px] font-semibold text-subtle-black transition-all duration-200 hover:border-violet hover:text-violet hover:shadow-[0_4px_14px_rgba(93,77,190,0.12)]"
          >
            <UserCog size={16} />
            Account
            <motion.span
              animate={{ rotate: accountMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex"
            >
              <ChevronDown size={14} />
            </motion.span>
          </button>

          <AnimatePresence>
            {accountMenuOpen && (
              <motion.div
                role="menu"
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 top-[48px] z-20 min-w-[220px] origin-top-right overflow-hidden rounded-[12px] border border-light-gray bg-white shadow-[0_12px_32px_rgba(15,15,15,0.08)]"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    setIsSheetOpen(true);
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-[14px] font-medium text-subtle-black transition-colors duration-150 hover:bg-red/5 hover:text-red"
                >
                  <Trash2 size={16} />
                  Delete Account
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <section className="flex flex-col gap-[16px] mt-[40px]">
        <h2 className="text-dark-gray text-[12px] font-medium flex items-center gap-1.5">
          <span aria-hidden>📓</span> MY CUENTTOS
        </h2>
        {cuenttosLoading ? (
          <SkeletonCuenttoFeed />
        ) : cuenttosError ? (
          <div className="flex w-full max-w-[984px] items-center justify-center rounded-[16px] border border-dashed border-red/40 bg-red/5 px-6 py-10 text-[14px] text-red">
            {cuenttosError}
          </div>
        ) : myCuenttos.length === 0 ? (
          <div className="flex w-full max-w-[984px] items-center justify-center rounded-[16px] border border-dashed border-light-gray bg-white px-6 py-10 text-[14px] text-gray">
            You haven&apos;t created any cuenttos yet.
          </div>
        ) : (
          <>
            <div
              role="tablist"
              aria-label="Filter cuenttos by mood"
              className="flex flex-wrap items-center gap-2"
            >
              <motion.button
                type="button"
                role="tab"
                aria-selected={selectedMoodId == null}
                onClick={() => setSelectedMoodId(null)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.95 }}
                className={`rounded-full border px-4 py-1.5 text-[12px] font-semibold transition-colors duration-200 cursor-pointer ${
                  selectedMoodId == null
                    ? "border-violet bg-violet text-white shadow-[0_4px_12px_rgba(93,77,190,0.25)]"
                    : "border-light-gray bg-white text-subtle-black hover:border-violet/60 hover:text-violet"
                }`}
              >
                All
              </motion.button>
              {availableMoods.map((mood) => {
                const isActive = selectedMoodId === mood.id;
                return (
                  <motion.button
                    key={mood.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedMoodId(mood.id)}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`rounded-full border px-4 py-1.5 text-[12px] font-semibold transition-colors duration-200 cursor-pointer ${
                      isActive
                        ? "border-transparent text-subtle-black shadow-[0_4px_12px_rgba(15,15,15,0.08)]"
                        : "border-light-gray bg-white text-subtle-black hover:border-subtle-black"
                    }`}
                    style={
                      isActive ? { backgroundColor: mood.color } : undefined
                    }
                  >
                    {mood.title}
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedMoodId ?? "all"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex flex-col gap-[20px]"
              >
                {filteredCuenttos.map((cuentto) => (
                  <CuenttoFeedCard
                    key={cuentto.id}
                    cuentto={cuentto}
                    onDeleted={(id) =>
                      setMyCuenttos((prev) =>
                        prev.filter((c) => c.id !== id)
                      )
                    }
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </section>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="bg-white flex flex-col justify-between border-none !max-w-none !w-[488px] border-l px-[50px] py-[60px] border-light-gray">
          <div className="flex flex-col justify-start items-start">
            <p className="text-[14px] font-medium text-gray">Delete Account</p>
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
              className="border border-light-gray text-subtle-black text-[16px] bg-none outline-none h-[56px] rounded-[8px] w-full px-4 placeholder-subtle-black"
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
                className="border border-light-gray text-subtle-black bg-none outline-none text-[16px] h-[56px] rounded-[8px] w-full px-4 placeholder-subtle-black"
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
            {error && <p className="text-red-400 w-full text-left">{error}</p>}
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
  );
}

export default ProfileePage;
