import axios from "axios";
import { Mood } from "@/types/mood";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchMoods = async (): Promise<Mood[]> => {
  const response = await axios.get(`${API_URL}/api/moods`);
  return response.data.moods;
};