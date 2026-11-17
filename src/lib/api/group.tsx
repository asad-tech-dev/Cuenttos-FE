import { Group } from "@/types/group";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const fetchGroups = async (): Promise<Group[]> => {
  const token = localStorage.getItem("authToken");
  const response = await axios.get(`${API_URL}/api/group/user`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return response.data.groups;
};

export type CreateGroupData = {
  name: string;
  description: string;
  emoji?: string;
};

export const createGroup = async (data: CreateGroupData): Promise<Group> => {
  const token = localStorage.getItem("authToken");
  const response = await axios.post(`${API_URL}/api/group`, data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return response.data.group;
};

/**
 * Ids of the people in a circle, not counting its creator (the backend lists
 * only `member`-role rows, the same set `addGroupMembers` replaces).
 */
export const fetchGroupMemberIds = async (
  groupId: number,
): Promise<number[]> => {
  const token = localStorage.getItem("authToken");
  const response = await axios.get(`${API_URL}/api/group/detail/${groupId}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  const members: { user?: { id?: unknown } }[] =
    response.data?.group?.members ?? [];
  return members
    .map((m) => m.user?.id)
    .filter((id): id is number => typeof id === "number");
};

/**
 * Set a circle's members (the backend adds new ids and removes missing ones;
 * only people who follow the circle's creator can be added).
 */
export const addGroupMembers = async (
  groupId: number,
  userIds: number[],
): Promise<void> => {
  const token = localStorage.getItem("authToken");
  await axios.post(
    `${API_URL}/api/member`,
    { groupId, userIds },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    },
  );
};
