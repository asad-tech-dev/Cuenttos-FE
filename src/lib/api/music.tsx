import { Music } from "@/types/music";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const fetchMusics = async (): Promise<Music[]> => {
  const token = localStorage.getItem("authToken");
  const response = await axios.get(`${API_URL}/api/music`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return response.data.musics;
};