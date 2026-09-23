import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { refreshAccessToken, clearAuth } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Ensure we only register the interceptor once, and share a single in-flight
// refresh across all concurrent 401s (no refresh storms).
let isInstalled = false;
let refreshPromise: Promise<string> | null = null;

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/**
 * Auth endpoints that must never themselves trigger a refresh-and-retry, to
 * avoid infinite loops (a failing refresh/login is terminal).
 */
const isAuthFlowUrl = (url?: string): boolean => {
  if (!url) return false;
  return (
    url.includes("/api/auth/refreshtoken") ||
    url.includes("/api/auth/login") ||
    url.includes("/api/auth/register")
  );
};

const redirectToLogin = (): void => {
  if (typeof window === "undefined") return;
  const { pathname, search } = window.location;
  // Don't bounce someone who's already on an auth screen.
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) return;
  const redirect = encodeURIComponent(pathname + search);
  window.location.href = `/login?redirect=${redirect}`;
};

const getSharedRefresh = (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

// Only logged-in sessions carry an access token. If there was never one, the
// caller is effectively a guest (e.g. a public cuentto page) and we must not
// hijack their 401 with a refresh + redirect — leave it to the call site.
const hadSession = (): boolean => {
  try {
    return Boolean(localStorage.getItem("authToken"));
  } catch {
    return false;
  }
};

/**
 * Register a response interceptor on the default axios instance. Because every
 * existing API module imports the default `axios`, this transparently covers
 * all call sites: on a 401 it silently refreshes the access token (via the
 * httpOnly refresh cookie) once, replays the original request with the new
 * token, and on failure tears down the session and redirects to /login.
 */
export const installAuthInterceptor = (): void => {
  if (isInstalled || typeof window === "undefined") return;
  isInstalled = true;

  axios.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as RetriableConfig | undefined;
      const status = error.response?.status;

      // Only act on 401s for our own API that we haven't already retried, and
      // never on the auth-flow endpoints themselves.
      if (
        status !== 401 ||
        !original ||
        original._retry ||
        isAuthFlowUrl(original.url) ||
        !hadSession()
      ) {
        return Promise.reject(error);
      }
      if (API_URL && original.url && !original.url.startsWith(API_URL)) {
        return Promise.reject(error);
      }

      original._retry = true;

      try {
        const newToken = await getSharedRefresh();
        // Overwrite the stale Authorization header the call site set, then
        // replay the original request.
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>).Authorization =
          `Bearer ${newToken}`;
        return axios(original);
      } catch (refreshError) {
        clearAuth();
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }
  );
};
