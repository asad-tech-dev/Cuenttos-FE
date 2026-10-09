import axios from "axios";
import { LoginFormData } from "../formSchemas/auth";
import { RegisterFormData } from "../formSchemas/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface LoginResponse {
  token: string;
  isAdmin?: boolean;
}

export const loginUser = async (data: LoginFormData): Promise<LoginResponse> => {
  const response = await axios.post(`${API_URL}/api/auth/login`, data, {
    headers: {
      "Content-Type": "application/json",
      // Identify as a web client so the backend delivers the refresh token as
      // an httpOnly cookie (never in the JS-readable body).
      "x-client-type": "web",
    },
    // Required so the browser stores the Set-Cookie refresh cookie.
    withCredentials: true,
  });
  return {
    token: response.data.token,
    isAdmin: Boolean(response.data.isAdmin),
  };
};

/**
 * Fired on `window` whenever the stored access token is set or cleared, so
 * chrome that derives "signed in" from it (sidebar, header) can re-check after
 * a silent refresh instead of waiting for the next navigation.
 */
export const AUTH_CHANGE_EVENT = "cuentto:auth-change";

const notifyAuthChange = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const storeToken = (token: string) => {
  localStorage.setItem("authToken", token);
  notifyAuthChange();
};

// Every caller (route guards, pages, the axios interceptor) shares one
// in-flight refresh. The refresh token rotates on each use, so independent
// parallel refreshes would race each other with the same cookie.
let inFlightRefresh: Promise<string> | null = null;

/**
 * Exchange the httpOnly refresh cookie for a fresh access token. The refresh
 * token itself is never touched by JS — the browser sends the cookie because
 * of `withCredentials`, and the backend rotates it via Set-Cookie. Returns the
 * new access token (also persisted to localStorage) or throws on failure.
 * Concurrent calls share a single request.
 */
export const refreshAccessToken = (): Promise<string> => {
  if (!inFlightRefresh) {
    inFlightRefresh = requestAccessToken().finally(() => {
      inFlightRefresh = null;
    });
  }
  return inFlightRefresh;
};

const requestAccessToken = async (): Promise<string> => {
  const response = await axios.post(
    `${API_URL}/api/auth/refreshtoken`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        "x-client-type": "web",
      },
      withCredentials: true,
    }
  );
  const newToken: string | undefined = response.data?.token;
  if (!newToken) {
    throw new Error("No access token returned from refresh");
  }
  storeToken(newToken);
  return newToken;
};

export const logoutUser = async (): Promise<{ message: string }> => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  const response = await axios.post(
    `${API_URL}/api/auth/logout`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        "x-client-type": "web",
        Authorization: token ? `Bearer ${token}` : "",
      },
      // Send the refresh cookie so the backend can clear it server-side.
      withCredentials: true,
    }
  );
  return response.data;
};

export const clearAuth = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("authToken");
  localStorage.removeItem("isAdmin");
  notifyAuthChange();
};

export const storeIsAdmin = (isAdmin: boolean) => {
  if (isAdmin) {
    localStorage.setItem("isAdmin", "true");
  } else {
    localStorage.removeItem("isAdmin");
  }
};

export const getIsAdmin = (): boolean => {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem("isAdmin") === "true") return true;
  const token = localStorage.getItem("authToken");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Boolean(payload.isAdmin);
  } catch {
    return false;
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("authToken");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (typeof payload.exp === "number") {
      return payload.exp * 1000 >= Date.now();
    }
    return true;
  } catch {
    return false;
  }
};

/**
 * Resolve whether the visitor is signed in, silently refreshing an expired
 * access token via the refresh cookie (e.g. after the browser was closed for
 * longer than the access-token lifetime). Only attempts the refresh when this
 * browser has held a session before, so plain guests don't trigger a request.
 */
export const restoreSession = async (): Promise<boolean> => {
  if (isAuthenticated()) return true;
  if (typeof window === "undefined" || !localStorage.getItem("authToken")) {
    return false;
  }
  try {
    await refreshAccessToken();
    return true;
  } catch (error) {
    // A rejected refresh token means the session is over; a network error
    // doesn't, so keep the stored token and let a later attempt retry.
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearAuth();
    }
    return false;
  }
};

export const getCurrentUserId = (): number | null => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("authToken");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.userId === "number" ? payload.userId : null;
  } catch {
    return null;
  }
};

export const registerUser = async (data: RegisterFormData) => {
  const response = await axios.post(`${API_URL}/api/auth/register`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const forgotPassword = async (data: { email: string }) => {
  const response = await axios.post(`${API_URL}/api/auth/forgot-password`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const verifyOTP = async (data: { email: string; otp: string }) => {
  const response = await axios.post(`${API_URL}/api/auth/verify-otp`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const resetPassword = async (data: {
  email: string;
  otp: string;
  password: string;
}) => {
  const response = await axios.post(`${API_URL}/api/auth/reset-password`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};
