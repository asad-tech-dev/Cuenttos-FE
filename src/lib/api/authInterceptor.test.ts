import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";

const API_URL = "http://api.test";

// --- module mocks ---------------------------------------------------------
// A callable axios mock that also records the interceptor handlers registered
// against it, plus mocked auth-service functions.
const { axiosMock, handlers, refreshAccessToken, clearAuth } = vi.hoisted(() => {
  const handlers: Array<{
    onFulfilled: (v: unknown) => unknown;
    onRejected: (e: unknown) => unknown;
  }> = [];
  const axiosMock = vi.fn((config: unknown) =>
    Promise.resolve({ status: 200, config, __retried: true }),
  ) as ReturnType<typeof vi.fn> & { interceptors: unknown };
  axiosMock.interceptors = {
    response: {
      use: (onFulfilled: (v: unknown) => unknown, onRejected: (e: unknown) => unknown) => {
        handlers.push({ onFulfilled, onRejected });
        return handlers.length - 1;
      },
    },
  };
  return {
    axiosMock,
    handlers,
    refreshAccessToken: vi.fn(),
    clearAuth: vi.fn(),
  };
});

vi.mock("axios", () => ({ default: axiosMock }));
vi.mock("./auth", () => ({ refreshAccessToken, clearAuth }));

import { installAuthInterceptor } from "./authInterceptor";

// The registered rejection handler under test.
let onRejected: (e: unknown) => Promise<unknown>;

type ErrConfig = {
  url?: string;
  headers?: Record<string, string>;
  _retry?: boolean;
};
const makeError = (status: number, config: ErrConfig = {}) => ({
  response: { status },
  config: {
    url: `${API_URL}/api/feed/all`,
    headers: { Authorization: "Bearer old-token" },
    ...config,
  },
});

const setLocation = (pathname: string) => {
  // Replace jsdom's location with a plain, writable stand-in so redirect
  // assignments don't trigger real navigation.
  delete (window as unknown as { location?: unknown }).location;
  (window as unknown as { location: { pathname: string; search: string; href: string } }).location = {
    pathname,
    search: "",
    href: "",
  };
};

beforeAll(() => {
  installAuthInterceptor();
  onRejected = handlers[0].onRejected as typeof onRejected;
});

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  localStorage.setItem("authToken", "expired-but-present"); // "had a session"
  setLocation("/feed");
  refreshAccessToken.mockResolvedValue("new-token");
});

describe("authInterceptor — pass-through (no refresh attempted)", () => {
  it("ignores non-401 responses", async () => {
    const err = makeError(500);
    await expect(onRejected(err)).rejects.toBe(err);
    expect(refreshAccessToken).not.toHaveBeenCalled();
    expect(axiosMock).not.toHaveBeenCalled();
  });

  it("ignores a 401 when there was never a session (guest)", async () => {
    localStorage.clear();
    const err = makeError(401);
    await expect(onRejected(err)).rejects.toBe(err);
    expect(refreshAccessToken).not.toHaveBeenCalled();
  });

  it("does not refresh on the auth-flow endpoints themselves (no loop)", async () => {
    for (const url of [
      `${API_URL}/api/auth/refreshtoken`,
      `${API_URL}/api/auth/login`,
      `${API_URL}/api/auth/register`,
    ]) {
      const err = makeError(401, { url });
      await expect(onRejected(err)).rejects.toBe(err);
    }
    expect(refreshAccessToken).not.toHaveBeenCalled();
  });

  it("ignores a 401 from a non-API (third-party) URL", async () => {
    const err = makeError(401, { url: "https://third-party.example/x" });
    await expect(onRejected(err)).rejects.toBe(err);
    expect(refreshAccessToken).not.toHaveBeenCalled();
  });

  it("does not retry a request that was already retried once", async () => {
    const err = makeError(401, { _retry: true });
    await expect(onRejected(err)).rejects.toBe(err);
    expect(refreshAccessToken).not.toHaveBeenCalled();
  });
});

describe("authInterceptor — refresh + retry", () => {
  it("refreshes once and replays the original request with the new token", async () => {
    const err = makeError(401);
    const result = (await onRejected(err)) as { __retried: boolean };

    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(axiosMock).toHaveBeenCalledTimes(1);
    // original was marked retried and its Authorization header rewritten
    expect(err.config._retry).toBe(true);
    expect(err.config.headers.Authorization).toBe("Bearer new-token");
    // returns the replayed request's resolution
    expect(result.__retried).toBe(true);
  });

  it("on refresh failure: clears auth and redirects to /login with a redirect param", async () => {
    refreshAccessToken.mockRejectedValue(new Error("refresh failed"));
    const err = makeError(401);

    await expect(onRejected(err)).rejects.toThrow("refresh failed");
    expect(clearAuth).toHaveBeenCalledTimes(1);
    expect(window.location.href).toContain("/login?redirect=");
    expect(axiosMock).not.toHaveBeenCalled();
  });

  it("does not redirect (loop) if the user is already on /login", async () => {
    setLocation("/login");
    refreshAccessToken.mockRejectedValue(new Error("refresh failed"));
    const err = makeError(401);

    await expect(onRejected(err)).rejects.toThrow("refresh failed");
    expect(clearAuth).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe(""); // unchanged
  });
});

describe("authInterceptor — single-flight", () => {
  it("shares one refresh across concurrent 401s, then retries each request", async () => {
    // Make the refresh hang until we resolve it.
    let resolveRefresh!: (token: string) => void;
    refreshAccessToken.mockReturnValue(
      new Promise<string>((res) => {
        resolveRefresh = res;
      }),
    );

    const err1 = makeError(401, { url: `${API_URL}/api/feed/all`, headers: { Authorization: "Bearer old" } });
    const err2 = makeError(401, { url: `${API_URL}/api/notification`, headers: { Authorization: "Bearer old" } });

    const p1 = onRejected(err1);
    const p2 = onRejected(err2);

    // Both 401s arrived while the single refresh is still pending.
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);

    resolveRefresh("shared-token");
    await Promise.all([p1, p2]);

    expect(refreshAccessToken).toHaveBeenCalledTimes(1); // still just one
    expect(axiosMock).toHaveBeenCalledTimes(2); // each request replayed
    expect(err1.config.headers.Authorization).toBe("Bearer shared-token");
    expect(err2.config.headers.Authorization).toBe("Bearer shared-token");
  });
});
