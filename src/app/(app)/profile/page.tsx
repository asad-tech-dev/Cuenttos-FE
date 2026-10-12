"use client";

import checkAuth from "@/HOC/checkAuth";
import ProfileView from "@/app/components/profile/ProfileView";

// The signed-in user's own profile.
function ProfilePage() {
  return <ProfileView />;
}

export default checkAuth(ProfilePage);
