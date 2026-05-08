import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const authHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export interface Answer {
  id: number;
  questionId: number;
  userId: number;
  text: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubmitAnswerPayload {
  questionId: number;
  text: string;
}

export const submitAnswer = async (
  payload: SubmitAnswerPayload,
): Promise<Answer> => {
  const response = await axios.post(`${API_URL}/api/answers`, payload, {
    headers: authHeaders(),
  });
  return response.data?.answer ?? response.data;
};
