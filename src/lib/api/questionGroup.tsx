import axios from "axios";
import { QuestionGroup } from "@/types/questionGroup";
import { QuestionGroupFormData } from "../formSchemas/questionGroup";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const authHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const fetchQuestionGroups = async (): Promise<QuestionGroup[]> => {
  const response = await axios.get(`${API_URL}/api/question-groups`, {
    headers: authHeaders(),
  });
  return (
    response.data.questionGroups ??
    response.data.groups ??
    response.data.data ??
    []
  );
};

export const createQuestionGroup = async (
  data: QuestionGroupFormData
): Promise<QuestionGroup> => {
  const payload = {
    title: data.title,
    description: data.description || "",
    questions: data.questions.map((q, index) => ({
      text: q.text,
      order: index,
    })),
  };

  const response = await axios.post(
    `${API_URL}/api/question-groups`,
    payload,
    { headers: authHeaders() }
  );
  return response.data.questionGroup ?? response.data;
};
