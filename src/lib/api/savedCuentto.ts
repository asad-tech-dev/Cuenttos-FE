import axios from "axios";
import { SavedCuentto } from "@/types/cuentto";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface SaveCuenttoResponse {
  message: string;
  saved: boolean;
}

/**
 * POST /api/savecuentto is a single toggle endpoint, not separate save/unsave
 * calls: the backend creates the SavedCuentto row if there isn't one and
 * deletes it if there is, reporting which happened via `saved` in the
 * response. Saving someone else's cuentto also fires them a SAVE
 * notification server-side. Same contract the mobile app uses.
 */
export const toggleSaveCuentto = async (
  cuenttoId: number,
): Promise<SaveCuenttoResponse> => {
  const token = localStorage.getItem("authToken");
  const response = await axios.post(
    `${API_URL}/api/savecuentto`,
    { cuenttoId },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    },
  );
  return response.data;
};

export const fetchSavedCuenttos = async (): Promise<SavedCuentto[]> => {
  const token = localStorage.getItem("authToken");
  const response = await axios.get(`${API_URL}/api/savecuentto`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return response.data.savedCuenttos ?? [];
};
