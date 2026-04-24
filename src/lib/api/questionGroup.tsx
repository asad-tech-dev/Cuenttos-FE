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

export const fetchQuestionGroupById = async (
  id: number
): Promise<QuestionGroup> => {
  const response = await axios.get(`${API_URL}/api/question-groups/${id}`, {
    headers: authHeaders(),
  });
  return response.data.questionGroup ?? response.data;
};

export const activateQuestionGroup = async (
  id: number
): Promise<QuestionGroup> => {
  const response = await axios.patch(
    `${API_URL}/api/question-groups/${id}/activate`,
    {},
    { headers: authHeaders() }
  );
  return response.data.questionGroup ?? response.data;
};

export const deactivateQuestionGroup = async (
  id: number
): Promise<QuestionGroup> => {
  const response = await axios.patch(
    `${API_URL}/api/question-groups/${id}/deactivate`,
    {},
    { headers: authHeaders() }
  );
  return response.data.questionGroup ?? response.data;
};

export const toggleQuestionGroupActive = async (
  id: number,
  isActive: boolean
): Promise<QuestionGroup> =>
  isActive ? activateQuestionGroup(id) : deactivateQuestionGroup(id);

const buildGroupPayload = (data: QuestionGroupFormData) => ({
  title: data.title,
  description: data.description || "",
  questions: data.questions.map((q, index) => ({
    ...(q.id != null ? { id: q.id } : {}),
    text: q.text,
    ...(q.description != null ? { description: q.description } : {}),
    order: index,
  })),
});

export const createQuestionGroup = async (
  data: QuestionGroupFormData
): Promise<QuestionGroup> => {
  const response = await axios.post(
    `${API_URL}/api/question-groups`,
    buildGroupPayload(data),
    { headers: authHeaders() }
  );
  return response.data.questionGroup ?? response.data;
};

export const updateQuestionGroup = async (
  id: number,
  data: QuestionGroupFormData
): Promise<QuestionGroup> => {
  const response = await axios.patch(
    `${API_URL}/api/question-groups/${id}`,
    buildGroupPayload(data),
    { headers: authHeaders() }
  );
  return response.data.questionGroup ?? response.data;
};

export const deleteQuestionGroup = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/api/question-groups/${id}`, {
    headers: authHeaders(),
  });
};
