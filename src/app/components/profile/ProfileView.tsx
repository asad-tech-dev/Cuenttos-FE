"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { z } from "zod";
import { BackIcon } from "@/app/components/icons";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  AlertTriangle,
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
  X,
} from "lucide-react";
import CustomToast from "@/app/components/toasts/toast";
import CuenttoFeedCard from "@/app/components/ui/cuenttos/cuenttoFeedCard";
import { SkeletonCuenttoFeed } from "@/app/components/skeletons/CuenttoFeed";
import { Cuentto } from "@/types/cuentto";
import { fetchMyCuenttos, fetchVisibleCuenttosOf } from "@/lib/api/cuentto";
import {
  fetchUserProfile,
  fetchUserFollowers,
  fetchUserFollowings,
  formatUsername,
  FollowUser,
  UserProfile,
  toggleFollowUser,
} from "@/lib/api/profile";
import { clearAuth, getCurrentUserId, logoutUser } from "@/lib/api/auth";
import ProfileHeader from "@/app/components/profile/ProfileHeader";
import UserFollowTile from "@/app/components/profile/UserFollowTile";
import { toast } from "sonner";

const schema = z.object({
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

type TabType = "about" | "followers" | "following";

type Relationship = "following" | "pending" | "none";

/**
 * Follow / Following / Requested button shown on someone else's profile
 * (mirrors the mobile profile header). Toggling uses the same endpoint as the
 * follower tiles; the backend decides between following and a request based
 * on the account's privacy.
 */
function FollowButton({
  userId,
  username,
  relationship,
  onChange,
}: {
  userId: number;
  username: string;
  relationship: Relationship | null;
  onChange: (next: Relationship) => void;
}) {
  const [busy, setBusy] = useState(false);
  const isFollowing = relationship === "following";
  const isPending = relationship === "pending";

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { relationship: next } = await toggleFollowUser(userId);
      const status: Relationship =
        next === "following" || next === "pending" ? next : "none";
      onChange(status);
      if (status === "following") toast.success(`Following @${username}`);
      else if (status === "pending") toast.success("Follow request sent");
      else toast.info(isPending ? "Follow request cancelled" : `Unfollowed @${username}`);
    } catch (err: unknown) {
      console.error("Error toggling follow:", err);
      toast.error("Could not update follow status. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy || relationship === null}
      className={`inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer rounded-[12px] px-4 h-[36px] text-[13px] font-semibold transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed ${
        isFollowing || isPending
          ? "border border-light-gray bg-white text-subtle-black hover:border-violet hover:text-violet"
          : "bg-violet text-white hover:bg-dark-violet shadow-[0_2px_8px_rgba(93,77,190,0.25)]"
      }`}
    >
      {busy ? (
        <span className="inline-block h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isFollowing ? (
        "Following"
      ) : isPending ? (
        "Requested"
      ) : (
        "Follow"
      )}
    </button>
  );
}

/**
 * Profile page body. With no `userId` (or the signed-in user's own id) it is
 * the user's own profile, exactly as before; with another user's id it shows
 * their profile read-only with a follow button — like opening a profile from a
 * username in the mobile app.
 */
export default function ProfileView({ userId: viewedUserId }: { userId?: number }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: "onChange" });
  const router = useRouter();

  // Whose profile this is. Rendered client-side only (behind checkAuth), so
  // reading the signed-in user from storage here is safe.
  const currentUserId = useMemo(() => getCurrentUserId(), []);
  const profileUserId = viewedUserId ?? currentUserId;
  const isSelf = profileUserId != null && profileUserId === currentUserId;

  // Dialog & menu states
  const [isSheetOpen, setIsSheetOpen] = useState(false);
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

  const [followings, setFollowings] = useState<FollowUser[]>([]);
  const [followingsLoading, setFollowingsLoading] = useState(false);

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

  // Follow status with the profile's owner (other people's profiles only).
  // Derived from their followers list; "pending" is only known after a
  // request is sent from this page.
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [profileMissing, setProfileMissing] = useState(false);
  // Bumped after a follow change so the profile's lists reload.
  const [reloadKey, setReloadKey] = useState(0);

  // Opening a different person's profile starts fresh; a reload after a
  // follow change keeps the current tab and filter.
  const loadedUserRef = useRef<number | null>(null);
  useEffect(() => {
    setActiveTab("about");
    setSelectedMoodId(null);
    setRelationship(null);
  }, [profileUserId]);

  // Load User Profile, Cuenttos, and initial counts (again for another
  // person's profile, or after a follow change)
  useEffect(() => {
    const userId = profileUserId;
    if (userId != null) {
      const isNewProfile = loadedUserRef.current !== userId;
      loadedUserRef.current = userId;
      if (isNewProfile) setUserLoading(true);
      // Fetch user profile info
      fetchUserProfile(userId)
        .then((data) => setUserProfile(data))
        .catch((err) => {
          console.error("Failed to load user profile:", err);
          // The token fallback below describes the signed-in user, so it only
          // applies to your own profile.
          if (!isSelf) {
            setProfileMissing(true);
            return;
          }
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

      // Fetch the profile's cuenttos: all of your own, or — for someone
      // else — only the ones you're allowed to see.
      setCuenttosLoading(true);
      setCuenttosError(null);
      (isSelf ? fetchMyCuenttos() : fetchVisibleCuenttosOf(userId))
        .then((data) => setMyCuenttos(data))
        .catch((err: unknown) => {
          const message =
            axios.isAxiosError(err) && err.response?.data?.message
              ? err.response.data.message
              : isSelf
                ? "Could not load your cuenttos. Please try again."
                : "Could not load cuenttos. Please try again.";
          setCuenttosError(message);
        })
        .finally(() => setCuenttosLoading(false));

      // Fetch follower & following initial counts
      setFollowersLoading(true);
      fetchUserFollowers(userId)
        .then((data) => {
          setFollowers(data);
          if (!isSelf) {
            const followsThem = data.some((u) => u.id === currentUserId);
            setRelationship((prev) =>
              followsThem ? "following" : prev === "pending" ? "pending" : "none",
            );
          }
        })
        .catch(() => {})
        .finally(() => setFollowersLoading(false));

      setFollowingsLoading(true);
      fetchUserFollowings(userId)
        .then((data) => {
          setFollowings(data);
        })
        .catch(() => {})
        .finally(() => setFollowingsLoading(false));
    } else {
      setUserLoading(false);
      setCuenttosLoading(false);
    }
  }, [profileUserId, isSelf, currentUserId, reloadKey]);

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
      const emailToUse =
        userProfile?.email ||
        (typeof window !== "undefined"
          ? (() => {
              try {
                const token = localStorage.getItem("authToken");
                return token ? JSON.parse(atob(token.split(".")[1])).email : "";
              } catch {
                return "";
              }
            })()
          : "");

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile/delete`,
        {
          email: emailToUse,
          password: data.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      CustomToast({ title: "Account deleted successfully." });
      clearAuth();
      router.push("/login");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Account deletion failed. Please check your password and try again.",
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (profileMissing) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-3 py-24 px-4">
        <h1 className="text-[20px] font-bold text-subtle-black">
          Profile not found
        </h1>
        <p className="text-[14px] text-gray">
          This user may have deleted their account.
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-2 text-[14px] font-semibold text-violet cursor-pointer hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

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
          {userProfile?.username
            ? formatUsername(userProfile.username)
            : "Profile"}
        </p>

        {isSelf ? (
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
                    router.push("/profile/edit");
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
        ) : (
          // Keeps the username centred where the actions menu would be.
          <span aria-hidden className="w-[36px] sm:w-[38px] shrink-0" />
        )}
      </div>

      {/* Profile Header (Hero card with peach accent, avatar, badge, bio, stats) */}
      <ProfileHeader
        user={userProfile}
        loading={userLoading}
        cuenttosCount={myCuenttos.length}
        followersCount={followers.length}
        followingCount={followings.length}
        onTabSelect={(tab) => setActiveTab(tab)}
        onEditClick={isSelf ? () => router.push("/profile/edit") : undefined}
        action={
          !isSelf && profileUserId != null ? (
            <FollowButton
              userId={profileUserId}
              username={userProfile?.username ?? ""}
              relationship={relationship}
              onChange={(next) => {
                setRelationship(next);
                setReloadKey((k) => k + 1);
              }}
            />
          ) : undefined
        }
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
                  {isSelf ? "No Cuenttos written yet" : "No Cuenttos to show"}
                </h3>
                <p className="text-[13px] sm:text-[14px] text-gray mt-1.5 max-w-[420px] leading-relaxed">
                  {isSelf
                    ? "Start writing your first Cuentto today to document memories, thoughts, and personal stories."
                    : "Cuenttos this user shares with you will appear here."}
                </p>
                {isSelf && (
                <Link
                  href="/cuentto/create"
                  className="inline-flex items-center gap-2 mt-4 sm:mt-5 px-5 py-2.5 rounded-full bg-violet hover:bg-dark-violet text-white text-[13px] sm:text-[14px] font-semibold shadow-[0_4px_14px_rgba(93,77,190,0.3)] transition-all"
                >
                  <PenLine size={15} />
                  Write a new Cuentto
                </Link>
                )}
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
                        ? "border-violet bg-violet text-white"
                        : "border-violet/70 bg-white text-violet hover:border-violet"
                    }`}
                  >
                    All
                  </motion.button>
                  {availableMoods.map((mood) => {
                    const isActive = selectedMoodId === mood.id;
                    const moodColor = mood.color || "#5D4DBE";
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
                            ? "border-transparent text-subtle-black"
                            : "bg-white hover:opacity-90"
                        }`}
                        style={
                          isActive
                            ? {
                                backgroundColor: moodColor,
                                borderColor: moodColor,
                              }
                            : {
                                borderColor: moodColor,
                                color: "gray",
                                backgroundColor: moodColor,
                              }
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
                            prev.filter((c) => c.id !== id),
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
                  {isSelf
                    ? "As you share your Cuenttos and engage with others, followers will appear here."
                    : "This user has no followers yet."}
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
                          u.id === id ? { ...u, isFollowing: status } : u,
                        ),
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
                  {isSelf
                    ? "Discover interesting writers and explore community stories to connect with others."
                    : "This user hasn't followed anyone yet."}
                </p>
                {isSelf && (
                <Link
                  href="/think"
                  className="inline-flex items-center gap-2 mt-4 px-5 py-2 rounded-full border border-violet text-violet hover:bg-violet hover:text-white text-[13px] font-semibold transition-all cursor-pointer"
                >
                  Explore Prompts & Community
                </Link>
                )}
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
                          u.id === id ? { ...u, isFollowing: status } : u,
                        ),
                      );
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Delete Account Sheet (Matched to mobile app design reference) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          hideCloseButton
          className="bg-white flex flex-col justify-between h-full border-none !max-w-none !w-full sm:!max-w-[460px] p-5 sm:p-7 border-l border-light-gray overflow-y-auto"
        >
          <div className="flex flex-col gap-5 sm:gap-6">
            {/* Drawer Header: Back button on left, Title centered, Close button on right */}
            <div className="flex items-center justify-between pb-3 border-b border-light-gray/60 relative">
              <button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                aria-label="Back"
                className="p-1.5 -ml-1.5 text-subtle-black hover:text-gray transition-colors cursor-pointer rounded-full hover:bg-light-gray/30"
              >
                <BackIcon width={10} height={18} className="text-current" />
              </button>
              <SheetTitle className="text-[17px] font-semibold text-subtle-black absolute left-1/2 -translate-x-1/2">
                Delete Account
              </SheetTitle>
              <button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                aria-label="Close"
                className="p-1.5 -mr-1.5 text-gray hover:text-subtle-black transition-colors cursor-pointer rounded-full hover:bg-light-gray/30"
              >
                <X size={18} />
              </button>
            </div>

            {/* Warning Banner Card */}
            <div className="flex items-start gap-3 rounded-[14px] bg-[#FEF2F2] border border-[#FCA5A5]/60 p-3.5 sm:p-4">
              <AlertTriangle
                className="text-[#DC2626] shrink-0 mt-0.5"
                size={20}
              />
              <p className="text-[13px] sm:text-[13.5px] leading-relaxed text-[#991B1B]">
                Deleting your account is permanent. This cannot be undone and
                your writing cannot be recovered.
              </p>
            </div>

            {/* What gets deleted */}
            <div className="flex flex-col gap-2.5">
              <h3 className="text-[16px] font-bold text-subtle-black">
                What gets deleted
              </h3>
              <ul className="flex flex-col gap-2 text-[13.5px] sm:text-[14px] text-[#4B5563]">
                <li className="flex items-start gap-2">
                  <span className="text-[#6B7280] leading-tight">•</span>
                  <span>All your cuenttos, public and private</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6B7280] leading-tight">•</span>
                  <span>Your drafts saved on this device</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6B7280] leading-tight">•</span>
                  <span>Your circles, followers and following</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#6B7280] leading-tight">•</span>
                  <span>Your saved cuenttos and comments</span>
                </li>
              </ul>
            </div>

            <div className="border-t border-light-gray/80" />

            {/* Confirm password form */}
            <form
              id="delete-account-form"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-3.5"
            >
              <div>
                <h3 className="text-[16px] font-bold text-subtle-black">
                  Confirm your password
                </h3>
                <p className="text-[13px] text-gray mt-1">
                  Enter your password to confirm it is really you.
                </p>
              </div>

              <div className="relative w-full mt-2">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full h-[46px] px-1 bg-transparent border-b border-light-gray text-subtle-black text-[14px] sm:text-[15px] outline-none focus:border-subtle-black transition-colors placeholder:text-gray/70"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-gray hover:text-subtle-black cursor-pointer p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red text-left text-[12px]">
                  {errors.password.message}
                </p>
              )}

              {error && (
                <p className="text-red text-left text-[13px] rounded-lg bg-red/5 p-2.5 border border-red/20">
                  {error}
                </p>
              )}
            </form>
          </div>

          {/* Action buttons (Delete My Account + Cancel) */}
          <div className="flex flex-col gap-2.5 pt-6 mt-4">
            <button
              type="submit"
              form="delete-account-form"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-[12px] bg-[#DC6B6B] hover:bg-[#C95B5B] text-white font-semibold text-[15px] transition-colors shadow-xs cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>Delete My Account</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSheetOpen(false)}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-[12px] bg-white border border-light-gray hover:bg-light-beige/40 text-[#4B5563] font-semibold text-[15px] transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

