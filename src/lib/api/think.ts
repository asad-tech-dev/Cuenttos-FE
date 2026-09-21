import axios from "axios";
import {
  ChallengeInput,
  ChallengeList,
  DailyPromptSchedule,
  SelectableGroup,
  ThinkToday,
} from "@/types/think";
import { Challenge, ChallengeToggleResult } from "@/types/think";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const authHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

/**
 * Today's prompt + the live challenge, in one call.
 *
 * Cache-busted for the same reason fetchActiveQuestionGroups is: a CDN or
 * browser holding this response would serve yesterday's prompt, and an admin
 * changing today's pick has to land immediately.
 */
export const fetchThinkToday = async (): Promise<ThinkToday> => {
  const response = await axios.get(`${API_URL}/api/think/today`, {
    headers: {
      ...authHeaders(),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    },
    params: { _: Date.now() },
  });
  return {
    prompt: response.data?.prompt ?? null,
    challenge: response.data?.challenge ?? null,
  };
};

/**
 * Turns an API failure into something an admin can act on.
 *
 * 404 matters most here: it means the API being talked to predates these
 * endpoints — almost always a frontend pointed at a backend that hasn't been
 * updated yet — and a generic "couldn't load" sends people hunting through
 * the wrong layer.
 */
export const describeThinkApiError = (
  error: unknown,
  fallback: string,
): string => {
  if (!axios.isAxiosError(error)) return fallback;

  if (!error.response) {
    return "Couldn't reach the API. Check the backend is running and that NEXT_PUBLIC_API_URL points at it.";
  }

  const status = error.response.status;
  if (status === 404) {
    return `This API has no Think admin endpoints (404 from ${API_URL}). It's running an older build — deploy the backend, or point NEXT_PUBLIC_API_URL at one that has them.`;
  }
  if (status === 401) return "Your session has expired. Sign in again.";
  if (status === 403) return "This account doesn't have admin access.";

  const data = error.response.data as { message?: string } | undefined;
  return data?.message ?? fallback;
};

// --------------------------------------------------------------------------
// Admin — Today's Prompt schedule
// --------------------------------------------------------------------------

export const fetchDailyPromptSchedule = async (params?: {
  from?: string;
  to?: string;
}): Promise<DailyPromptSchedule> => {
  const response = await axios.get(`${API_URL}/api/admin/daily-prompts`, {
    headers: authHeaders(),
    params: { ...params, _: Date.now() },
  });
  return {
    from: response.data?.from ?? "",
    to: response.data?.to ?? "",
    today: response.data?.today ?? "",
    dailyPrompts: response.data?.dailyPrompts ?? [],
  };
};

/**
 * Groups that can actually be scheduled. Purpose-built endpoint rather than
 * the general question-group list, which omits the questions themselves and
 * so can't say whether a group has an answerable one.
 */
export const fetchSelectableGroups = async (): Promise<SelectableGroup[]> => {
  const response = await axios.get(
    `${API_URL}/api/admin/daily-prompts/selectable-groups`,
    { headers: authHeaders(), params: { _: Date.now() } },
  );
  return response.data?.questionGroups ?? [];
};

export const setDailyPrompt = async (
  date: string,
  questionGroupId: number,
): Promise<void> => {
  await axios.put(
    `${API_URL}/api/admin/daily-prompts/${encodeURIComponent(date)}`,
    { questionGroupId },
    { headers: authHeaders() },
  );
};

export const clearDailyPrompt = async (date: string): Promise<void> => {
  await axios.delete(
    `${API_URL}/api/admin/daily-prompts/${encodeURIComponent(date)}`,
    { headers: authHeaders() },
  );
};

// --------------------------------------------------------------------------
// Admin — Challenges
// --------------------------------------------------------------------------

export const fetchChallenges = async (): Promise<ChallengeList> => {
  const response = await axios.get(`${API_URL}/api/admin/challenges`, {
    headers: authHeaders(),
    params: { _: Date.now() },
  });
  return {
    liveChallengeId: response.data?.liveChallengeId ?? null,
    challenges: response.data?.challenges ?? [],
  };
};

export const createChallenge = async (
  data: ChallengeInput,
): Promise<Challenge> => {
  const response = await axios.post(`${API_URL}/api/admin/challenges`, data, {
    headers: authHeaders(),
  });
  return response.data.challenge;
};

export const updateChallenge = async (
  id: number,
  data: Partial<ChallengeInput>,
): Promise<Challenge> => {
  const response = await axios.patch(
    `${API_URL}/api/admin/challenges/${id}`,
    data,
    { headers: authHeaders() },
  );
  return response.data.challenge;
};

export const deleteChallenge = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/api/admin/challenges/${id}`, {
    headers: authHeaders(),
  });
};

export const toggleChallengeActive = async (
  id: number,
  next: boolean,
): Promise<ChallengeToggleResult> => {
  const response = await axios.patch(
    `${API_URL}/api/admin/challenges/${id}/${next ? "activate" : "deactivate"}`,
    {},
    { headers: authHeaders() },
  );
  return {
    challenge: response.data.challenge,
    liveChallengeId: response.data.liveChallengeId ?? null,
  };
};
