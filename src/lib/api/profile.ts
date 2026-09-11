import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface UserProfile {
  id: number;
  username: string;
  email?: string;
  profileName?: string | null;
  profileLabel?: string | null;
  profileDescription?: string | null;
  gender?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  profilePicture?: string | null;
  isPublic?: boolean;
  country?: string | null;
  state?: string | null;
}

export interface FollowUser {
  id: number;
  username: string;
  email?: string;
  profileName?: string | null;
  profilePicture?: string | null;
  isPublic?: boolean;
  isFollowing?: boolean;
}

export function formatUsername(name?: string | null): string {
  if (!name) return "";
  const cleaned = name.trim().replace(/^@+/, "");
  return cleaned
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getAuthHeader() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
}

export const fetchUserProfile = async (
  userId: number
): Promise<UserProfile> => {
  const response = await axios.get(`${API_URL}/api/profile/${userId}`, {
    headers: getAuthHeader(),
  });
  return response.data.user;
};

export const updateUserProfile = async (formData: FormData): Promise<boolean> => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  const response = await axios.patch(`${API_URL}/api/profile/info`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "multipart/form-data",
    },
  });
  return response.status === 200;
};

export const fetchUserFollowers = async (
  userId: number
): Promise<FollowUser[]> => {
  const response = await axios.get(
    `${API_URL}/api/followers/followers-list/${userId}`,
    {
      headers: getAuthHeader(),
    }
  );
  return response.data.followers ?? [];
};

export const fetchUserFollowings = async (
  userId: number
): Promise<FollowUser[]> => {
  const response = await axios.get(
    `${API_URL}/api/followers/followings-list/${userId}`,
    {
      headers: getAuthHeader(),
    }
  );
  return response.data.followings ?? [];
};

export const toggleFollowUser = async (
  receiverId: number
): Promise<{ relationship?: string; message?: string }> => {
  const response = await axios.post(
    `${API_URL}/api/follow-request`,
    { receiverId },
    {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};
