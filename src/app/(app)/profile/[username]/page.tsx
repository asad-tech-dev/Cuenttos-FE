"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import checkAuth from "@/HOC/checkAuth";
import ProfileView from "@/app/components/profile/ProfileView";
import {
  fetchUserProfile,
  fetchUserProfileBySlug,
  UserProfile,
} from "@/lib/api/profile";

type Lookup =
  | { state: "loading" }
  | { state: "found"; user: UserProfile }
  | { state: "missing" }
  | { state: "error" };

const isNotFound = (err: unknown) =>
  axios.isAxiosError(err) && err.response?.status === 404;

/**
 * Resolve the URL segment to a user: normally their username slug; a numeric
 * segment that isn't a username is treated as an id, so older /profile/<id>
 * links keep working.
 */
async function lookupUser(segment: string): Promise<UserProfile | null> {
  try {
    return await fetchUserProfileBySlug(segment);
  } catch (err) {
    if (!isNotFound(err)) throw err;
  }
  if (/^\d+$/.test(segment)) {
    try {
      return await fetchUserProfile(Number(segment));
    } catch (err) {
      if (!isNotFound(err)) throw err;
    }
  }
  return null;
}

// Another user's profile at /profile/<username>, opened by clicking their name
// on a Cuentto (as in the mobile app). Your own username shows your own
// profile.
function UserProfilePage() {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const segment = decodeURIComponent(params.username ?? "");
  const [lookup, setLookup] = useState<Lookup>({ state: "loading" });

  useEffect(() => {
    let active = true;
    setLookup({ state: "loading" });
    lookupUser(segment)
      .then((user) => {
        if (!active) return;
        if (!user) {
          setLookup({ state: "missing" });
          return;
        }
        setLookup({ state: "found", user });
        // Show the canonical username URL (e.g. after opening an old id link).
        if (user.usernameSlug && user.usernameSlug !== segment) {
          router.replace(`/profile/${encodeURIComponent(user.usernameSlug)}`);
        }
      })
      .catch(() => {
        if (active) setLookup({ state: "error" });
      });
    return () => {
      active = false;
    };
  }, [segment, router]);

  if (lookup.state === "loading") return null;

  if (lookup.state !== "found") {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-3 py-24 px-4">
        <h1 className="text-[20px] font-bold text-subtle-black">
          {lookup.state === "missing"
            ? "Profile not found"
            : "Could not load this profile"}
        </h1>
        <p className="text-[14px] text-gray">
          {lookup.state === "missing"
            ? "This user may have changed their username or deleted their account."
            : "Please check your connection and try again."}
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

  return <ProfileView key={lookup.user.id} userId={lookup.user.id} />;
}

export default checkAuth(UserProfilePage);
