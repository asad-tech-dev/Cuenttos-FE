import { describe, it, expect, vi, beforeEach } from "vitest";

const { postMock } = vi.hoisted(() => ({ postMock: vi.fn() }));
vi.mock("axios", () => ({
  default: {
    post: postMock,
    isAxiosError: (e: unknown) =>
      Boolean((e as { isAxiosError?: boolean })?.isAxiosError),
  },
}));

import { AUTH_CHANGE_EVENT, refreshAccessToken, restoreSession } from "./auth";

// A JWT-shaped token whose payload expires `secondsFromNow` from now.
const jwtExpiringIn = (secondsFromNow: number) =>
  `h.${btoa(
    JSON.stringify({ userId: 1, exp: Math.floor(Date.now() / 1000) + secondsFromNow }),
  )}.s`;

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("refreshAccessToken", () => {
  it("posts to the refresh endpoint with cookie credentials + web client header, then stores and returns the new token", async () => {
    postMock.mockResolvedValue({ data: { token: "fresh-access" } });

    const token = await refreshAccessToken();

    expect(token).toBe("fresh-access");
    expect(localStorage.getItem("authToken")).toBe("fresh-access");

    const [url, body, config] = postMock.mock.calls[0];
    expect(url).toContain("/api/auth/refreshtoken");
    expect(body).toEqual({});
    expect(config.withCredentials).toBe(true);
    expect(config.headers["x-client-type"]).toBe("web");
  });

  it("throws and stores nothing when the response carries no token", async () => {
    postMock.mockResolvedValue({ data: {} });

    await expect(refreshAccessToken()).rejects.toThrow(/No access token/);
    expect(localStorage.getItem("authToken")).toBeNull();
  });

  it("propagates a network/401 error from the refresh call", async () => {
    postMock.mockRejectedValue(new Error("Request failed with status code 401"));

    await expect(refreshAccessToken()).rejects.toThrow(/401/);
    expect(localStorage.getItem("authToken")).toBeNull();
  });
});

describe("refreshAccessToken — single-flight", () => {
  it("shares one request across concurrent callers (no rotation race)", async () => {
    let resolve!: (v: unknown) => void;
    postMock.mockReturnValue(new Promise((r) => (resolve = r)));

    const calls = [refreshAccessToken(), refreshAccessToken(), refreshAccessToken()];
    resolve({ data: { token: "shared" } });

    expect(await Promise.all(calls)).toEqual(["shared", "shared", "shared"]);
    expect(postMock).toHaveBeenCalledTimes(1);
  });

  it("starts a new request once the previous one has settled", async () => {
    postMock.mockResolvedValueOnce({ data: { token: "a" } });
    postMock.mockResolvedValueOnce({ data: { token: "b" } });
    expect(await refreshAccessToken()).toBe("a");
    expect(await refreshAccessToken()).toBe("b");
    expect(postMock).toHaveBeenCalledTimes(2);
  });

  it("announces the new token so the app chrome can re-render", async () => {
    postMock.mockResolvedValue({ data: { token: "fresh" } });
    const listener = vi.fn();
    window.addEventListener(AUTH_CHANGE_EVENT, listener);
    await refreshAccessToken();
    window.removeEventListener(AUTH_CHANGE_EVENT, listener);
    expect(listener).toHaveBeenCalled();
  });
});

describe("restoreSession", () => {
  it("is true without a request when the access token is still valid", async () => {
    localStorage.setItem("authToken", jwtExpiringIn(3600));
    expect(await restoreSession()).toBe(true);
    expect(postMock).not.toHaveBeenCalled();
  });

  it("does not call the API for a guest who never had a session", async () => {
    expect(await restoreSession()).toBe(false);
    expect(postMock).not.toHaveBeenCalled();
  });

  it("silently refreshes an expired access token", async () => {
    localStorage.setItem("authToken", jwtExpiringIn(-60));
    postMock.mockResolvedValue({ data: { token: "renewed" } });
    expect(await restoreSession()).toBe(true);
    expect(localStorage.getItem("authToken")).toBe("renewed");
  });

  it("clears the dead session when the refresh token is rejected (401)", async () => {
    localStorage.setItem("authToken", jwtExpiringIn(-60));
    localStorage.setItem("isAdmin", "true");
    postMock.mockRejectedValue({ isAxiosError: true, response: { status: 401 } });
    expect(await restoreSession()).toBe(false);
    expect(localStorage.getItem("authToken")).toBeNull();
    expect(localStorage.getItem("isAdmin")).toBeNull();
  });

  it("keeps the session on a network error so a later attempt can retry", async () => {
    const expired = jwtExpiringIn(-60);
    localStorage.setItem("authToken", expired);
    postMock.mockRejectedValue(new Error("Network Error"));
    expect(await restoreSession()).toBe(false);
    expect(localStorage.getItem("authToken")).toBe(expired);
  });
});
