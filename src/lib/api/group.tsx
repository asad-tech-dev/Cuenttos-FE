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
