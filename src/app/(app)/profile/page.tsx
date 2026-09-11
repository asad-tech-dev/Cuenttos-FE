"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import VioletButton from "@/app/components/buttons/VioletButton";
import { z } from "zod";
import { BackIcon } from "@/app/components/icons";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  BookOpen,
  Compass,
  Eye,
  EyeOff,
  LogOut,
  MoreVertical,
  Pencil,
  PenLine,
  Trash2,
  Users,
} from "lucide-react";
import CustomToast from "@/app/components/toasts/toast";
import CuenttoFeedCard from "@/app/components/ui/cuenttos/cuenttoFeedCard";
import { SkeletonCuenttoFeed } from "@/app/components/skeletons/CuenttoFeed";
import { Cuentto } from "@/types/cuentto";
import { fetchMyCuenttos } from "@/lib/api/cuentto";
import {
  fetchUserProfile,
  fetchUserFollowers,
  fetchUserFollowings,
  formatUsername,
  FollowUser,
  UserProfile,
} from "@/lib/api/profile";
import { clearAuth, getCurrentUserId, logoutUser } from "@/lib/api/auth";
import ProfileHeader from "@/app/components/profile/ProfileHeader";
import UserFollowTile from "@/app/components/profile/UserFollowTile";
import EditProfileModal from "@/app/components/profile/EditProfileModal";
import checkAuth from "@/HOC/checkAuth";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

type TabType = "about" | "followers" | "following";

function ProfilePage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: "onChange" });
  const router = useRouter();

  // Dialog & menu states
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState<TabType>("about");

  // User Profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // Cuenttos (About tab) state
  const [myCuenttos, setMyCuenttos] = useState<Cuentto[]>([]);
  const [cuenttosLoading, setCuenttosLoading] = useState(true);
  const [cuenttosError, setCuenttosError] = useState<string | null>(null);
  const [selectedMoodId, setSelectedMoodId] = useState<number | null>(null);

  // Followers & Following state
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followersLoaded, setFollowersLoaded] = useState(false);

  const [followings, setFollowings] = useState<FollowUser[]>([]);
  const [followingsLoading, setFollowingsLoading] = useState(false);
  const [followingsLoaded, setFollowingsLoaded] = useState(false);

  // 3-dots actions menu
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!actionsMenuOpen) return;
    const handlePointer = (event: MouseEvent) => {
      if (!actionsMenuRef.current?.contains(event.target as Node)) {
        setActionsMenuOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActionsMenuOpen(false);
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [actionsMenuOpen]);

  // Load User Profile, Cuenttos, and initial counts on mount
  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId != null) {
      // Fetch user profile info
      fetchUserProfile(userId)
        .then((data) => setUserProfile(data))
        .catch((err) => {
          console.error("Failed to load user profile:", err);
          const token = localStorage.getItem("authToken");
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split(".")[1]));
              setUserProfile({
                id: userId,
                username: payload.userName || "User",
                profileName: payload.userName || "User",
              });
            } catch {
              // ignore
            }
          }
        })
        .finally(() => setUserLoading(false));

      // Fetch user's cuenttos
      setCuenttosLoading(true);
      fetchMyCuenttos()
        .then((data) => setMyCuenttos(data))
        .catch((err: unknown) => {
          const message =
            axios.isAxiosError(err) && err.response?.data?.message
              ? err.response.data.message
              : "Could not load your cuenttos. Please try again.";
          setCuenttosError(message);
        })
        .finally(() => setCuenttosLoading(false));

      // Fetch follower & following initial counts
      fetchUserFollowers(userId)
        .then((data) => {
          setFollowers(data);
          setFollowersLoaded(true);
        })
        .catch(() => {});

      fetchUserFollowings(userId)
        .then((data) => {
          setFollowings(data);
          setFollowingsLoaded(true);
        })
        .catch(() => {});
    } else {
      setUserLoading(false);
      setCuenttosLoading(false);
    }
  }, []);

  // Mood filters for Cuenttos (About tab)
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

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleLogout = async () => {
    setActionsMenuOpen(false);
    try {
      await logoutUser();
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

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
      clearAuth();
      router.push("/login");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Account deletion failed. Please try again."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 w-full max-w-[960px] mx-auto min-w-0 px-3.5 sm:px-6 md:px-8 py-2 sm:py-4 md:py-6 overflow-x-hidden">
      {/* Top Header Bar: Back button, centered username, 3-dots actions menu */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-light-gray/60 w-full min-w-0">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-[13px] sm:text-[14px] font-semibold text-gray hover:text-subtle-black transition-colors cursor-pointer py-1 shrink-0"
        >
          <BackIcon width={9} height={16} className="text-current" />
          <span className="hidden xs:inline sm:inline">Back</span>
        </button>

        <p className="text-[15px] sm:text-[17px] font-semibold text-subtle-black tracking-tight truncate text-center flex-1 min-w-0 px-2">
          {userProfile?.username ? formatUsername(userProfile.username) : "Profile"}
        </p>

        <div className="relative shrink-0" ref={actionsMenuRef}>
          <button
            type="button"
            aria-label="Profile actions"
            aria-haspopup="menu"
            aria-expanded={actionsMenuOpen}
            onClick={() => setActionsMenuOpen((open) => !open)}
            className="flex h-[36px] w-[36px] sm:h-[38px] sm:w-[38px] cursor-pointer items-center justify-center rounded-full border border-light-gray/70 bg-white text-subtle-black shadow-xs transition-all duration-150 hover:border-violet hover:text-violet hover:bg-light-beige/30"
          >
            <MoreVertical size={18} />
          </button>

          <AnimatePresence>
            {actionsMenuOpen && (
              <motion.div
                role="menu"
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 top-[42px] z-30 min-w-[200px] origin-top-right overflow-hidden rounded-[14px] border border-light-gray bg-white shadow-[0_12px_36px_rgba(15,15,15,0.12)] p-1.5"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setActionsMenuOpen(false);
                    setIsEditModalOpen(true);
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] sm:text-[14px] font-medium text-subtle-black transition-colors duration-150 hover:bg-light-beige/70 hover:text-violet"
                >
                  <Pencil size={15} />
                  Edit Profile
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] sm:text-[14px] font-medium text-subtle-black transition-colors duration-150 hover:bg-light-beige/70 hover:text-violet"
                >
                  <LogOut size={15} />
                  Log Out
                </button>

                <div className="my-1 border-t border-light-gray/80" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setActionsMenuOpen(false);
                    setIsSheetOpen(true);
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] sm:text-[14px] font-medium text-red transition-colors duration-150 hover:bg-red/10"
                >
                  <Trash2 size={15} />
                  Delete Account
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Profile Header (Hero card with peach accent, avatar, badge, bio, stats) */}
      <ProfileHeader
        user={userProfile}
        loading={userLoading}
        cuenttosCount={myCuenttos.length}
        followersCount={followers.length}
        followingCount={followings.length}
        onTabSelect={(tab) => setActiveTab(tab)}
        onEditClick={() => setIsEditModalOpen(true)}
      />

      {/* Tabs Navigation: About, Followers, Following */}
      <div className="flex flex-col gap-4 sm:gap-6 w-full min-w-0">
        <div
          role="tablist"
          aria-label="Profile tabs"
          className="flex items-center gap-4 sm:gap-8 md:gap-10 overflow-x-auto hide-scrollbar w-full py-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "about"}
            onClick={() => setActiveTab("about")}
            className={`flex items-center gap-1.5 sm:gap-2 pb-2.5 text-[14px] sm:text-[16px] font-semibold transition-all duration-200 cursor-pointer relative shrink-0 whitespace-nowrap px-1 sm:px-2 border-0 outline-none ${
              activeTab === "about"
                ? "text-subtle-black"
                : "text-gray hover:text-subtle-black"
            }`}
          >
            About
            <span
              className={`text-[11px] sm:text-[12px] font-medium px-2 py-0.5 rounded-full transition-colors ${
                activeTab === "about"
                  ? "bg-violet/10 text-violet"
                  : "bg-light-gray/50 text-gray"
              }`}
            >
              {myCuenttos.length}
            </span>
            {activeTab === "about" && (
              <motion.div
                layoutId="profileTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-violet rounded-full"
              />
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "followers"}
            onClick={() => setActiveTab("followers")}
            className={`flex items-center gap-1.5 sm:gap-2 pb-2.5 text-[14px] sm:text-[16px] font-semibold transition-all duration-200 cursor-pointer relative shrink-0 whitespace-nowrap px-1 sm:px-2 border-0 outline-none ${
              activeTab === "followers"
                ? "text-subtle-black"
                : "text-gray hover:text-subtle-black"
            }`}
          >
            Followers
            <span
              className={`text-[11px] sm:text-[12px] font-medium px-2 py-0.5 rounded-full transition-colors ${
                activeTab === "followers"
                  ? "bg-violet/10 text-violet"
                  : "bg-light-gray/50 text-gray"
              }`}
            >
              {followers.length}
            </span>
            {activeTab === "followers" && (
              <motion.div
                layoutId="profileTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-violet rounded-full"
              />
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "following"}
            onClick={() => setActiveTab("following")}
            className={`flex items-center gap-1.5 sm:gap-2 pb-2.5 text-[14px] sm:text-[16px] font-semibold transition-all duration-200 cursor-pointer relative shrink-0 whitespace-nowrap px-1 sm:px-2 border-0 outline-none ${
              activeTab === "following"
                ? "text-subtle-black"
                : "text-gray hover:text-subtle-black"
            }`}
          >
            Following
            <span
              className={`text-[11px] sm:text-[12px] font-medium px-2 py-0.5 rounded-full transition-colors ${
                activeTab === "following"
                  ? "bg-violet/10 text-violet"
                  : "bg-light-gray/50 text-gray"
              }`}
            >
              {followings.length}
            </span>
            {activeTab === "following" && (
              <motion.div
                layoutId="profileTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-violet rounded-full"
              />
            )}
          </button>
        </div>

        {/* Tab 1: About Content */}
        {activeTab === "about" && (
          <section className="flex flex-col gap-4 sm:gap-5 w-full min-w-0 animate-in fade-in duration-200">
            {cuenttosLoading ? (
              <SkeletonCuenttoFeed />
            ) : cuenttosError ? (
              <div className="flex w-full items-center justify-center rounded-[18px] border border-dashed border-red/40 bg-red/5 px-4 py-8 text-[14px] text-red">
                {cuenttosError}
              </div>
            ) : myCuenttos.length === 0 ? (
              /* Enhanced Empty State for Cuenttos */
              <div className="flex flex-col items-center justify-center text-center rounded-[20px] sm:rounded-[24px] border border-dashed border-light-gray bg-gradient-to-b from-white to-light-beige/30 p-8 sm:p-12 w-full">
                <div className="flex h-[56px] w-[56px] sm:h-[64px] sm:w-[64px] items-center justify-center rounded-full bg-violet/10 text-violet mb-3.5">
                  <BookOpen size={26} />
                </div>
                <h3 className="text-[17px] sm:text-[20px] font-bold text-subtle-black">
                  No Cuenttos written yet
                </h3>
                <p className="text-[13px] sm:text-[14px] text-gray mt-1.5 max-w-[420px] leading-relaxed">
                  Start writing your first Cuentto today to document memories,
                  thoughts, and personal stories.
                </p>
                <Link
                  href="/cuentto/create"
                  className="inline-flex items-center gap-2 mt-4 sm:mt-5 px-5 py-2.5 rounded-full bg-violet hover:bg-dark-violet text-white text-[13px] sm:text-[14px] font-semibold shadow-[0_4px_14px_rgba(93,77,190,0.3)] transition-all"
                >
                  <PenLine size={15} />
                  Write a new Cuentto
                </Link>
              </div>
            ) : (
              <>
                {/* Mood Filter chips */}
                <div
                  role="tablist"
                  aria-label="Filter cuenttos by mood"
                  className="flex flex-nowrap items-center gap-2 overflow-x-auto hide-scrollbar w-full py-1"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  <motion.button
                    type="button"
                    role="tab"
                    aria-selected={selectedMoodId == null}
                    onClick={() => setSelectedMoodId(null)}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 sm:px-4 py-1.5 text-[11px] sm:text-[12px] font-semibold transition-all duration-150 cursor-pointer ${
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
                        className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 sm:px-4 py-1.5 text-[11px] sm:text-[12px] font-semibold transition-all duration-150 cursor-pointer ${
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
                    className="flex flex-col gap-4 sm:gap-5 w-full min-w-0"
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
        )}

        {/* Tab 2: Followers Content */}
        {activeTab === "followers" && (
          <section className="flex flex-col gap-2.5 sm:gap-3 w-full min-w-0 animate-in fade-in duration-200">
            {followersLoading ? (
              <div className="flex flex-col gap-2.5 sm:gap-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3.5 sm:p-4 rounded-[14px] sm:rounded-[16px] border border-light-gray/60 bg-white animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-[40px] h-[40px] rounded-full bg-light-gray" />
                      <div className="flex flex-col gap-1.5">
                        <div className="w-28 sm:w-36 h-4 rounded bg-light-gray" />
                        <div className="w-20 h-3 rounded bg-light-gray" />
                      </div>
                    </div>
                    <div className="w-20 h-8 rounded-full bg-light-gray" />
                  </div>
                ))}
              </div>
            ) : followers.length === 0 ? (
              /* Empty State for Followers */
              <div className="flex flex-col items-center justify-center text-center rounded-[20px] sm:rounded-[24px] border border-dashed border-light-gray bg-gradient-to-b from-white to-light-beige/30 p-8 sm:p-12 w-full">
                <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-violet/10 text-violet mb-3">
                  <Users size={24} />
                </div>
                <h3 className="text-[16px] sm:text-[18px] font-bold text-subtle-black">
                  No followers yet
                </h3>
                <p className="text-[13px] sm:text-[14px] text-gray mt-1 max-w-[360px] leading-relaxed">
                  As you share your Cuenttos and engage with others, followers
                  will appear here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:gap-2.5 w-full">
                {followers.map((fUser) => (
                  <UserFollowTile
                    key={fUser.id}
                    user={fUser}
                    onFollowChange={(id, status) => {
                      setFollowers((prev) =>
                        prev.map((u) =>
                          u.id === id ? { ...u, isFollowing: status } : u
                        )
                      );
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab 3: Following Content */}
        {activeTab === "following" && (
          <section className="flex flex-col gap-2.5 sm:gap-3 w-full min-w-0 animate-in fade-in duration-200">
            {followingsLoading ? (
              <div className="flex flex-col gap-2.5 sm:gap-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3.5 sm:p-4 rounded-[14px] sm:rounded-[16px] border border-light-gray/60 bg-white animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-[40px] h-[40px] rounded-full bg-light-gray" />
                      <div className="flex flex-col gap-1.5">
                        <div className="w-28 sm:w-36 h-4 rounded bg-light-gray" />
                        <div className="w-20 h-3 rounded bg-light-gray" />
                      </div>
                    </div>
                    <div className="w-20 h-8 rounded-full bg-light-gray" />
                  </div>
                ))}
              </div>
            ) : followings.length === 0 ? (
              /* Empty State for Following */
              <div className="flex flex-col items-center justify-center text-center rounded-[20px] sm:rounded-[24px] border border-dashed border-light-gray bg-gradient-to-b from-white to-light-beige/30 p-8 sm:p-12 w-full">
                <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-violet/10 text-violet mb-3">
                  <Compass size={24} />
                </div>
                <h3 className="text-[16px] sm:text-[18px] font-bold text-subtle-black">
                  Not following anyone yet
                </h3>
                <p className="text-[13px] sm:text-[14px] text-gray mt-1 max-w-[380px] leading-relaxed">
                  Discover interesting writers and explore community stories to
                  connect with others.
                </p>
                <Link
                  href="/think"
                  className="inline-flex items-center gap-2 mt-4 px-5 py-2 rounded-full border border-violet text-violet hover:bg-violet hover:text-white text-[13px] font-semibold transition-all cursor-pointer"
                >
                  Explore Prompts & Community
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:gap-2.5 w-full">
                {followings.map((fUser) => (
                  <UserFollowTile
                    key={fUser.id}
                    user={fUser}
                    onFollowChange={(id, status) => {
                      setFollowings((prev) =>
                        prev.map((u) =>
                          u.id === id ? { ...u, isFollowing: status } : u
                        )
                      );
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        user={userProfile}
        onProfileUpdated={(updated) => setUserProfile(updated)}
      />

      {/* Delete Account Sheet (Preserved functionality, responsive sheet layout) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="bg-white flex flex-col justify-between h-full border-none !max-w-none !w-full sm:!max-w-[480px] p-6 sm:p-10 border-l border-light-gray overflow-y-auto">
          <div className="flex flex-col justify-start items-start">
            <p className="text-[13px] sm:text-[14px] font-medium text-gray">Delete Account</p>
            <p className="text-[20px] sm:text-[22px] font-bold text-subtle-black mt-2 max-w-[340px]">
              Are you sure you want to delete your account?
            </p>
            <p className="text-[14px] sm:text-[15px] font-normal text-gray mt-4 leading-relaxed">
              Your profile, cuenttos, comments, and followers will be
              permanently deleted.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col w-full gap-3.5 my-auto py-6"
          >
            <input
              {...register("email")}
              placeholder="Email"
              autoComplete="off"
              className="border border-light-gray text-subtle-black text-[15px] sm:text-[16px] bg-none outline-none h-[52px] rounded-[10px] w-full px-4 placeholder-gray focus:border-violet transition-colors"
            />
            {errors.email && (
              <p className="text-red-400 text-left text-[13px] w-full">
                {errors.email.message}
              </p>
            )}

            <div className="relative w-full">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="off"
                className="border border-light-gray text-subtle-black bg-none outline-none text-[15px] sm:text-[16px] h-[52px] rounded-[10px] w-full px-4 placeholder-gray focus:border-violet transition-colors"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray hover:text-subtle-black cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-left text-[13px] w-full">
                {errors.password.message}
              </p>
            )}

            {error && <p className="text-red-400 w-full text-left text-[13px]">{error}</p>}

            <div className="flex flex-row gap-3 mt-3 justify-start">
              <VioletButton
                text="Delete my account"
                className="w-full sm:w-[180px] text-[14px]"
                loading={loading}
                type="submit"
              />
            </div>
          </form>

          <div />
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default checkAuth(ProfilePage);
